package com.webappfoundation.site.service;

import com.webappfoundation.dto.BulkUploadResult;
import com.webappfoundation.service.AuditService;
import com.webappfoundation.service.SpreadsheetParser;
import com.webappfoundation.site.model.TableSlot;
import com.webappfoundation.site.repository.BlackoutDateRepository;
import com.webappfoundation.site.repository.TableSlotRepository;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
public class TableSlotService {

    private static final List<LocalTime> LUNCH_SLOTS = List.of(
            LocalTime.of(12, 0), LocalTime.of(12, 45), LocalTime.of(13, 30), LocalTime.of(14, 15), LocalTime.of(15, 0));

    private final TableSlotRepository repository;
    private final BlackoutDateRepository blackoutRepository;
    private final AuditService auditService;
    private final SpreadsheetParser spreadsheetParser;

    public TableSlotService(TableSlotRepository repository, BlackoutDateRepository blackoutRepository,
                            AuditService auditService, SpreadsheetParser spreadsheetParser) {
        this.repository = repository;
        this.blackoutRepository = blackoutRepository;
        this.auditService = auditService;
        this.spreadsheetParser = spreadsheetParser;
    }

    public record SlotDto(Long id, LocalDate date, LocalTime time, int tables, int reserved, int left, boolean active) {}

    private static SlotDto dto(TableSlot s) {
        int reserved = s.getReserved() == null ? 0 : s.getReserved();
        return new SlotDto(s.getId(), s.getDate(), s.getTime(), s.getTables(), reserved, Math.max(0, s.getTables() - reserved), s.isActive());
    }

    /** Public: open slots in a date range (no blackout days, nothing already past). */
    public List<SlotDto> publicSlots(LocalDate from, LocalDate to) {
        LocalDateTime now = LocalDateTime.now(KitchenService.IST);
        LocalDate start = from == null || from.isBefore(now.toLocalDate()) ? now.toLocalDate() : from;
        LocalDate end = to == null || to.isAfter(start.plusDays(30)) ? start.plusDays(14) : to;
        return repository.findByDateBetweenAndActiveTrueOrderByDateAscTimeAsc(start, end).stream()
                .filter(s -> LocalDateTime.of(s.getDate(), s.getTime()).isAfter(now))
                .filter(s -> blackoutRepository.findByDate(s.getDate()).stream().noneMatch(b -> !"ORDERS".equals(b.getAppliesTo())))
                .map(TableSlotService::dto).toList();
    }

    public List<SlotDto> adminList() {
        return repository.findAllByOrderByDateAscTimeAsc().stream().map(TableSlotService::dto).toList();
    }

    @Transactional
    public SlotDto create(LocalDate date, LocalTime time, Integer tables, Boolean active) {
        validate(date, time, tables);
        if (repository.findByDateAndTime(date, time).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That slot already exists");
        }
        TableSlot saved = repository.save(TableSlot.builder().date(date).time(time).tables(tables).reserved(0)
                .active(active == null || active).build());
        auditService.record("TABLE_SLOT_CREATED", "SUCCESS", "TABLE_SLOT", String.valueOf(saved.getId()), date + " " + time);
        return dto(saved);
    }

    @Transactional
    public SlotDto update(Long id, Integer tables, Boolean active) {
        TableSlot s = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Slot not found"));
        if (tables != null) {
            if (tables < 0 || tables > 100 || tables < s.getReserved()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tables must be between the booked count and 100");
            }
            s.setTables(tables);
        }
        if (active != null) s.setActive(active);
        repository.save(s);
        auditService.record("TABLE_SLOT_UPDATED", "SUCCESS", "TABLE_SLOT", String.valueOf(id), "tables=" + s.getTables() + " active=" + s.isActive());
        return dto(s);
    }

    @Transactional
    public void delete(Long id) {
        TableSlot s = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Slot not found"));
        if (s.getReserved() > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This slot has bookings — switch it off instead");
        }
        repository.delete(s);
        auditService.record("TABLE_SLOT_DELETED", "SUCCESS", "TABLE_SLOT", String.valueOf(id), null);
    }

    /** Open the next {@code days} days with the standard lunch slots (existing slots are left alone). */
    @Transactional
    public int generate(int days) {
        int created = 0;
        LocalDate today = LocalDate.now(KitchenService.IST);
        for (int i = 0; i < Math.min(Math.max(days, 1), 60); i++) {
            LocalDate d = today.plusDays(i);
            for (LocalTime t : LUNCH_SLOTS) {
                if (repository.findByDateAndTime(d, t).isEmpty()) {
                    repository.save(TableSlot.builder().date(d).time(t).tables(8).reserved(0).active(true).build());
                    created++;
                }
            }
        }
        return created;
    }

    @Scheduled(cron = "0 5 0 * * *", zone = "Asia/Kolkata")
    public void rollFortnight() {
        generate(14);
    }

    @Transactional
    public BulkUploadResult bulkImport(MultipartFile file) {
        BulkUploadResult result = BulkUploadResult.builder().build();
        int row = 1;
        for (Map<String, String> r : spreadsheetParser.parse(file)) {
            row++;
            LocalDate d = Parse.date(r.get("date"));
            LocalTime t = Parse.time(r.get("time"));
            Integer tables = Parse.integer(r.get("tables"));
            if (d == null || t == null || tables == null || tables < 0 || tables > 100) {
                result.addError(row, "date (YYYY-MM-DD), time (HH:mm) and tables (0-100) are required");
                continue;
            }
            if (repository.findByDateAndTime(d, t).isPresent()) { result.setSkipped(result.getSkipped() + 1); continue; }
            repository.save(TableSlot.builder().date(d).time(t).tables(tables).reserved(0).active(true).build());
            result.setCreated(result.getCreated() + 1);
        }
        auditService.record("TABLE_SLOT_BULK_IMPORT", "SUCCESS", "TABLE_SLOT", null, "created=" + result.getCreated());
        return result;
    }

    private static void validate(LocalDate date, LocalTime time, Integer tables) {
        if (date == null || time == null || tables == null || tables < 0 || tables > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date, time and tables (0-100) are required");
        }
    }
}
