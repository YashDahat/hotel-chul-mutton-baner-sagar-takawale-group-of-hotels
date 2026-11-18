package com.webappfoundation.site.service;

import com.webappfoundation.dto.BulkUploadResult;
import com.webappfoundation.model.Product;
import com.webappfoundation.repository.ProductRepository;
import com.webappfoundation.service.AuditService;
import com.webappfoundation.service.SpreadsheetParser;
import com.webappfoundation.site.model.BlackoutDate;
import com.webappfoundation.site.model.KitchenStatus;
import com.webappfoundation.site.repository.BlackoutDateRepository;
import com.webappfoundation.site.repository.KitchenStatusRepository;
import com.webappfoundation.site.workflow.ChulWorkflowSeeder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** The live Chul Board: kitchen status, hours, pickup slots, blackout dates and today's handi stock. */
@Service
public class KitchenService {

    public static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    private final KitchenStatusRepository statusRepository;
    private final BlackoutDateRepository blackoutRepository;
    private final ProductRepository productRepository;
    private final com.webappfoundation.site.repository.OrderDetailRepository detailRepository;
    private final AuditService auditService;
    private final SpreadsheetParser spreadsheetParser;

    public KitchenService(KitchenStatusRepository statusRepository, BlackoutDateRepository blackoutRepository,
                          ProductRepository productRepository,
                          com.webappfoundation.site.repository.OrderDetailRepository detailRepository,
                          AuditService auditService, SpreadsheetParser spreadsheetParser) {
        this.statusRepository = statusRepository;
        this.blackoutRepository = blackoutRepository;
        this.productRepository = productRepository;
        this.detailRepository = detailRepository;
        this.auditService = auditService;
        this.spreadsheetParser = spreadsheetParser;
    }

    public record BlackoutView(Long id, LocalDate date, String reason, String appliesTo) {}

    public record HandiView(Long id, String name, String slug, int left) {}

    public record SlotView(String time, int remaining) {}

    public record StatusView(String mode, LocalDate reopensOn, String message, LocalTime lunchOpen, LocalTime lunchClose,
                             LocalTime dinnerOpen, LocalTime dinnerClose, boolean orderingEnabled, int slotCapacity,
                             int leadMinutes, boolean openNow, List<BlackoutView> blackouts, List<HandiView> todaysHandi) {}

    @Transactional
    public KitchenStatus get() {
        return statusRepository.findById(1L).orElseGet(() -> statusRepository.save(KitchenStatus.builder()
                .id(1L).mode("OPEN").message("The chul is lit.")
                .lunchOpen(LocalTime.of(12, 0)).lunchClose(LocalTime.of(16, 30))
                .orderingEnabled(true).slotCapacity(12).leadMinutes(30).updatedAt(Instant.now()).build()));
    }

    @Transactional
    public StatusView view() {
        KitchenStatus k = get();
        LocalDateTime now = LocalDateTime.now(IST);
        boolean blackedToday = !blackoutRepository.findByDate(now.toLocalDate()).isEmpty();
        boolean open = "OPEN".equals(k.getMode()) && !blackedToday
                && (within(now.toLocalTime(), k.getLunchOpen(), k.getLunchClose())
                || within(now.toLocalTime(), k.getDinnerOpen(), k.getDinnerClose()));
        List<BlackoutView> blackouts = blackoutRepository.findByDateGreaterThanEqualOrderByDateAsc(now.toLocalDate()).stream()
                .map(b -> new BlackoutView(b.getId(), b.getDate(), b.getReason(), b.getAppliesTo())).toList();
        List<HandiView> handi = new ArrayList<>();
        for (Product p : productRepository.findByActiveTrue()) {
            if (ChulWorkflowSeeder.CHUL_ORDER.equals(p.getWorkflowCode()) && p.isStockTracked() && !p.isStockPerBranch()) {
                int left = (p.getStock() == null ? 0 : p.getStock()) - (p.getReserved() == null ? 0 : p.getReserved());
                handi.add(new HandiView(p.getId(), p.getName(), p.getSlug(), Math.max(left, 0)));
            }
        }
        return new StatusView(k.getMode(), k.getReopensOn(), k.getMessage(), k.getLunchOpen(), k.getLunchClose(),
                k.getDinnerOpen(), k.getDinnerClose(), k.isOrderingEnabled(),
                k.getSlotCapacity(), k.getLeadMinutes(), open, blackouts, handi);
    }

    private static boolean within(LocalTime t, LocalTime open, LocalTime close) {
        return open != null && close != null && !t.isBefore(open) && t.isBefore(close);
    }

    /** Admin edit of the single status row. */
    @Transactional
    public StatusView update(KitchenStatus in) {
        String mode = in.getMode();
        if (!List.of("OPEN", "CLOSED_TODAY", "CLOSED_UNTIL").contains(mode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "mode must be OPEN, CLOSED_TODAY or CLOSED_UNTIL");
        }
        if ("CLOSED_UNTIL".equals(mode) && in.getReopensOn() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Set the reopening date");
        }
        if (in.getLunchOpen() != null && in.getLunchClose() != null && !in.getLunchOpen().isBefore(in.getLunchClose())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lunch closing must be after opening");
        }
        KitchenStatus k = get();
        k.setMode(mode);
        k.setReopensOn("CLOSED_UNTIL".equals(mode) ? in.getReopensOn() : null);
        k.setMessage(in.getMessage());
        k.setLunchOpen(in.getLunchOpen());
        k.setLunchClose(in.getLunchClose());
        k.setDinnerOpen(in.getDinnerOpen());
        k.setDinnerClose(in.getDinnerClose());
        k.setOrderingEnabled(in.isOrderingEnabled());
        k.setSlotCapacity(Math.max(1, in.getSlotCapacity() == null ? 12 : in.getSlotCapacity()));
        k.setLeadMinutes(Math.max(0, in.getLeadMinutes() == null ? 30 : in.getLeadMinutes()));
        k.setUpdatedAt(Instant.now());
        statusRepository.save(k);
        auditService.record("KITCHEN_STATUS_UPDATED", "SUCCESS", "KITCHEN_STATUS", "1", "mode=" + mode);
        return view();
    }

    /** 15-minute pickup slots for a date, honouring hours, lead time, blackouts and per-slot capacity. */
    @Transactional
    public List<SlotView> pickupSlots(LocalDate date) {
        List<SlotView> out = new ArrayList<>();
        KitchenStatus k = get();
        LocalDateTime now = LocalDateTime.now(IST);
        if (!k.isOrderingEnabled() || date.isBefore(now.toLocalDate()) || date.isAfter(now.toLocalDate().plusDays(7))) return out;
        if ("CLOSED_TODAY".equals(k.getMode()) && date.equals(now.toLocalDate())) return out;
        if ("CLOSED_UNTIL".equals(k.getMode()) && k.getReopensOn() != null && date.isBefore(k.getReopensOn())) return out;
        if (blackoutRepository.findByDate(date).stream().anyMatch(b -> !"TABLES".equals(b.getAppliesTo()))) return out;
        LocalDateTime earliest = now.plusMinutes(k.getLeadMinutes());
        addWindow(out, date, k.getLunchOpen(), k.getLunchClose(), earliest, k.getSlotCapacity());
        addWindow(out, date, k.getDinnerOpen(), k.getDinnerClose(), earliest, k.getSlotCapacity());
        return out;
    }

    private void addWindow(List<SlotView> out, LocalDate date, LocalTime open, LocalTime close, LocalDateTime earliest, int capacity) {
        if (open == null || close == null) return;
        for (LocalTime t = open; t.isBefore(close); t = t.plusMinutes(15)) {
            if (LocalDateTime.of(date, t).isBefore(earliest)) continue;
            long used = detailRepository.countByWorkflowCodeAndSlotDateAndSlotTime(ChulWorkflowSeeder.CHUL_ORDER, date, t);
            out.add(new SlotView(t.toString(), (int) Math.max(0, capacity - used)));
        }
    }

    // ── Blackout dates (admin) ──

    public List<BlackoutDate> blackouts() {
        return blackoutRepository.findAll();
    }

    @Transactional
    public BlackoutDate addBlackout(BlackoutDate in) {
        if (in.getDate() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date is required");
        String applies = in.getAppliesTo() == null ? "BOTH" : in.getAppliesTo();
        if (!List.of("ORDERS", "TABLES", "BOTH").contains(applies)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "appliesTo must be ORDERS, TABLES or BOTH");
        }
        BlackoutDate saved = blackoutRepository.save(BlackoutDate.builder().date(in.getDate()).reason(in.getReason()).appliesTo(applies).build());
        auditService.record("BLACKOUT_CREATED", "SUCCESS", "BLACKOUT", String.valueOf(saved.getId()), "date=" + saved.getDate());
        return saved;
    }

    @Transactional
    public void deleteBlackout(Long id) {
        blackoutRepository.deleteById(id);
        auditService.record("BLACKOUT_DELETED", "SUCCESS", "BLACKOUT", String.valueOf(id), null);
    }

    @Transactional
    public BulkUploadResult bulkBlackouts(MultipartFile file) {
        BulkUploadResult result = BulkUploadResult.builder().build();
        int row = 1;
        for (Map<String, String> r : spreadsheetParser.parse(file)) {
            row++;
            LocalDate d = Parse.date(r.get("date"));
            if (d == null) { result.addError(row, "date must be YYYY-MM-DD"); continue; }
            String applies = r.getOrDefault("appliesto", "BOTH");
            if (applies == null || applies.isBlank()) applies = "BOTH";
            applies = applies.trim().toUpperCase();
            if (!List.of("ORDERS", "TABLES", "BOTH").contains(applies)) { result.addError(row, "appliesTo must be ORDERS, TABLES or BOTH"); continue; }
            blackoutRepository.save(BlackoutDate.builder().date(d).reason(Parse.blankToNull(r.get("reason"))).appliesTo(applies).build());
            result.setCreated(result.getCreated() + 1);
        }
        auditService.record("BLACKOUT_BULK_IMPORT", "SUCCESS", "BLACKOUT", null, "created=" + result.getCreated());
        return result;
    }
}
