package com.webappfoundation.site.controller;

import com.webappfoundation.model.LoyaltyEventRule;
import com.webappfoundation.model.OrderStageEvent;
import com.webappfoundation.model.WorkflowStage;
import com.webappfoundation.repository.OrderStageEventRepository;
import com.webappfoundation.repository.WorkflowRepository;
import com.webappfoundation.security.CurrentUser;
import com.webappfoundation.service.LoyaltyConfigService;
import com.webappfoundation.service.OrderService;
import com.webappfoundation.service.WorkflowService;
import com.webappfoundation.site.dto.AttachDetailRequest;
import com.webappfoundation.site.dto.OrderDetailDto;
import com.webappfoundation.site.model.FeastDate;
import com.webappfoundation.site.model.Suggestion;
import com.webappfoundation.site.service.FeastDateService;
import com.webappfoundation.site.service.KitchenService;
import com.webappfoundation.site.service.OrderDetailService;
import com.webappfoundation.site.service.SuggestionService;
import com.webappfoundation.site.service.TableSlotService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** Public + customer endpoints of the Chul Mutton site layer (kitchen board, slots, order details, ideas). */
@RestController
@RequestMapping("/api/v1")
public class SiteController {

    private final KitchenService kitchenService;
    private final TableSlotService tableSlotService;
    private final FeastDateService feastDateService;
    private final OrderDetailService orderDetailService;
    private final SuggestionService suggestionService;
    private final LoyaltyConfigService loyaltyConfigService;
    private final WorkflowService workflowService;
    private final WorkflowRepository workflowRepository;
    private final OrderStageEventRepository stageEventRepository;
    private final OrderService orderService;

    public SiteController(KitchenService kitchenService, TableSlotService tableSlotService, FeastDateService feastDateService,
                          OrderDetailService orderDetailService, SuggestionService suggestionService,
                          LoyaltyConfigService loyaltyConfigService, WorkflowService workflowService,
                          WorkflowRepository workflowRepository, OrderStageEventRepository stageEventRepository,
                          OrderService orderService) {
        this.kitchenService = kitchenService;
        this.tableSlotService = tableSlotService;
        this.feastDateService = feastDateService;
        this.orderDetailService = orderDetailService;
        this.suggestionService = suggestionService;
        this.loyaltyConfigService = loyaltyConfigService;
        this.workflowService = workflowService;
        this.workflowRepository = workflowRepository;
        this.stageEventRepository = stageEventRepository;
        this.orderService = orderService;
    }

    public record EarnRule(String eventType, java.math.BigDecimal points, Integer perDayCap, boolean onceOnly) {}

    public record StageView(String code, String label, int ordinal, boolean initial, boolean terminal, boolean cancellable, Integer targetMinutes) {}

    public record WorkflowView(String code, String label, List<StageView> stages) {}

    public record StageEventView(String stageCode, Instant enteredAt) {}

    public record PublicIdea(Long id, String text, String category, String status, String publicNote, Instant updatedAt) {}

    public record SuggestionRequest(String text, String category) {}

    // ── Kitchen board, slots, feast calendar ──

    @GetMapping("/kitchen-status")
    public KitchenService.StatusView kitchenStatus() {
        return kitchenService.view();
    }

    @GetMapping("/chul-order/slots")
    public List<KitchenService.SlotView> pickupSlots(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return kitchenService.pickupSlots(date);
    }

    @GetMapping("/table-slots")
    public List<TableSlotService.SlotDto> tableSlots(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                                     @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return tableSlotService.publicSlots(from, to);
    }

    @GetMapping("/feast-dates")
    public List<FeastDate> feastDates() {
        return feastDateService.upcoming();
    }

    // ── Live rules + workflow stages for the tracking timeline ──

    @GetMapping("/site/earn-rules")
    public List<EarnRule> earnRules() {
        return loyaltyConfigService.listEventRules().stream()
                .filter(r -> r.isEarnsCoins() && r.getPoints() != null && r.getPoints().signum() > 0)
                .map(r -> new EarnRule(r.getEventType().name(), r.getPoints(), r.getPerDayCap(), r.isOnceOnly()))
                .toList();
    }

    @GetMapping("/site/workflows/{code}")
    public WorkflowView workflow(@PathVariable String code) {
        if (!workflowRepository.existsByCode(code)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown workflow");
        List<StageView> stages = workflowService.stages(code).stream()
                .map((WorkflowStage s) -> new StageView(s.getCode(), s.getLabel(), s.getOrdinal(), s.isInitial(), s.isTerminal(), s.isCancellable(), s.getTargetMinutes()))
                .toList();
        return new WorkflowView(code, workflowRepository.findByCode(code).map(w -> w.getLabel()).orElse(code), stages);
    }

    @GetMapping("/site/orders/{id}/stages")
    public List<StageEventView> orderStages(@CurrentUser Integer userId, @PathVariable Long id) {
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in");
        orderService.get(userId, id); // ownership check
        return stageEventRepository.findByOrderIdOrderByEnteredAtAsc(id).stream()
                .filter((OrderStageEvent e) -> !e.isMigration())
                .map(e -> new StageEventView(e.getStageCode(), e.getEnteredAt())).toList();
    }

    // ── Order details (slot, party size, notes…) ──

    @PostMapping("/order-details")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderDetailDto attach(@CurrentUser Integer userId, @RequestBody AttachDetailRequest request) {
        return orderDetailService.attach(userId, request);
    }

    @GetMapping("/order-details/{orderId}")
    public OrderDetailDto detail(@CurrentUser Integer userId, @PathVariable Long orderId) {
        return orderDetailService.forCustomer(userId, orderId);
    }

    // ── Suggest an idea ──

    @PostMapping("/suggestions")
    @ResponseStatus(HttpStatus.CREATED)
    public Suggestion suggest(@CurrentUser Integer userId, @RequestBody SuggestionRequest request) {
        return suggestionService.create(userId, request.text(), request.category());
    }

    @GetMapping("/suggestions/mine")
    public List<Suggestion> mySuggestions(@CurrentUser Integer userId) {
        return suggestionService.mine(userId);
    }

    @GetMapping("/suggestions/public")
    public List<PublicIdea> publicIdeas() {
        return suggestionService.publicList().stream()
                .map(s -> new PublicIdea(s.getId(), s.getText(), s.getCategory(), s.getStatus(), s.getPublicNote(), s.getUpdatedAt())).toList();
    }
}
