package com.webappfoundation.site.controller;

import com.webappfoundation.dto.BulkUploadResult;
import com.webappfoundation.security.CurrentUser;
import com.webappfoundation.site.dto.OrderDetailDto;
import com.webappfoundation.site.model.BlackoutDate;
import com.webappfoundation.site.model.FeastDate;
import com.webappfoundation.site.model.KitchenStatus;
import com.webappfoundation.site.model.Suggestion;
import com.webappfoundation.site.service.FeastDateService;
import com.webappfoundation.site.service.KitchenService;
import com.webappfoundation.site.service.OrderDetailService;
import com.webappfoundation.site.service.SuggestionService;
import com.webappfoundation.site.service.TableSlotService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

/** Admin endpoints (ADMIN / SUPER_ADMIN via the /api/v1/admin/** rule) for the Chul Mutton site layer. */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminSiteController {

    private final KitchenService kitchenService;
    private final TableSlotService tableSlotService;
    private final FeastDateService feastDateService;
    private final OrderDetailService orderDetailService;
    private final SuggestionService suggestionService;

    public AdminSiteController(KitchenService kitchenService, TableSlotService tableSlotService, FeastDateService feastDateService,
                               OrderDetailService orderDetailService, SuggestionService suggestionService) {
        this.kitchenService = kitchenService;
        this.tableSlotService = tableSlotService;
        this.feastDateService = feastDateService;
        this.orderDetailService = orderDetailService;
        this.suggestionService = suggestionService;
    }

    public record SlotRequest(LocalDate date, LocalTime time, Integer tables, Boolean active) {}

    public record NoteRequest(String note) {}

    public record TriageRequest(String status, String publicNote, Boolean showPublic) {}

    // ── Kitchen status + blackouts ──

    @GetMapping("/kitchen-status")
    public KitchenService.StatusView kitchen() {
        return kitchenService.view();
    }

    @PutMapping("/kitchen-status")
    public KitchenService.StatusView updateKitchen(@RequestBody KitchenStatus body) {
        return kitchenService.update(body);
    }

    @GetMapping("/blackouts")
    public List<BlackoutDate> blackouts() {
        return kitchenService.blackouts();
    }

    @PostMapping("/blackouts")
    @ResponseStatus(HttpStatus.CREATED)
    public BlackoutDate addBlackout(@RequestBody BlackoutDate body) {
        return kitchenService.addBlackout(body);
    }

    @DeleteMapping("/blackouts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBlackout(@PathVariable Long id) {
        kitchenService.deleteBlackout(id);
    }

    @PostMapping("/blackouts/bulk-upload")
    public BulkUploadResult bulkBlackouts(@RequestParam("file") MultipartFile file) {
        return kitchenService.bulkBlackouts(file);
    }

    // ── Table slots ──

    @GetMapping("/table-slots")
    public List<TableSlotService.SlotDto> tableSlots() {
        return tableSlotService.adminList();
    }

    @PostMapping("/table-slots")
    @ResponseStatus(HttpStatus.CREATED)
    public TableSlotService.SlotDto createSlot(@RequestBody SlotRequest r) {
        return tableSlotService.create(r.date(), r.time(), r.tables(), r.active());
    }

    @PutMapping("/table-slots/{id}")
    public TableSlotService.SlotDto updateSlot(@PathVariable Long id, @RequestBody SlotRequest r) {
        return tableSlotService.update(id, r.tables(), r.active());
    }

    @DeleteMapping("/table-slots/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSlot(@PathVariable Long id) {
        tableSlotService.delete(id);
    }

    @PostMapping("/table-slots/generate")
    public Map<String, Integer> generate(@RequestParam(defaultValue = "14") int days) {
        return Map.of("created", tableSlotService.generate(days));
    }

    @PostMapping("/table-slots/bulk-upload")
    public BulkUploadResult bulkSlots(@RequestParam("file") MultipartFile file) {
        return tableSlotService.bulkImport(file);
    }

    // ── Order details (kitchen / host / catering view) ──

    @GetMapping("/order-details")
    public List<OrderDetailDto> details(@RequestParam String workflowCode) {
        return orderDetailService.adminList(workflowCode);
    }

    @GetMapping("/order-details/{orderId}")
    public OrderDetailDto detail(@PathVariable Long orderId) {
        return orderDetailService.forAdmin(orderId);
    }

    @PutMapping("/order-details/{orderId}/staff-note")
    public OrderDetailDto staffNote(@PathVariable Long orderId, @RequestBody NoteRequest r) {
        return orderDetailService.setStaffNote(orderId, r.note());
    }

    // ── Feast calendar ──

    @GetMapping("/feast-dates")
    public List<FeastDate> feastDates() {
        return feastDateService.adminList();
    }

    @PostMapping("/feast-dates")
    @ResponseStatus(HttpStatus.CREATED)
    public FeastDate createFeast(@RequestBody FeastDate body) {
        return feastDateService.save(null, body);
    }

    @PutMapping("/feast-dates/{id}")
    public FeastDate updateFeast(@PathVariable Long id, @RequestBody FeastDate body) {
        return feastDateService.save(id, body);
    }

    @DeleteMapping("/feast-dates/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFeast(@PathVariable Long id) {
        feastDateService.delete(id);
    }

    @PostMapping("/feast-dates/bulk-upload")
    public BulkUploadResult bulkFeasts(@RequestParam("file") MultipartFile file) {
        return feastDateService.bulkImport(file);
    }

    // ── Suggestions ──

    @GetMapping("/suggestions")
    public List<Suggestion> suggestions() {
        return suggestionService.adminList();
    }

    @PutMapping("/suggestions/{id}")
    public Suggestion triage(@PathVariable Long id, @RequestBody TriageRequest r) {
        return suggestionService.triage(id, r.status(), r.publicNote(), r.showPublic());
    }

    @PostMapping("/suggestions/bulk-upload")
    public BulkUploadResult bulkSuggestions(@CurrentUser Integer userId, @RequestParam("file") MultipartFile file) {
        return suggestionService.bulkImport(file, userId);
    }
}
