package com.webappfoundation.site.service;

import com.webappfoundation.dto.OrderDto;
import com.webappfoundation.service.AuditService;
import com.webappfoundation.service.OrderService;
import com.webappfoundation.site.catalog.TableSlotCatalogResolver;
import com.webappfoundation.site.dto.AttachDetailRequest;
import com.webappfoundation.site.dto.OrderDetailDto;
import com.webappfoundation.site.model.OrderDetail;
import com.webappfoundation.site.model.TableSlot;
import com.webappfoundation.site.repository.OrderDetailRepository;
import com.webappfoundation.site.repository.TableSlotRepository;
import com.webappfoundation.site.workflow.ChulWorkflowSeeder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Stores the process inputs of an order (slot, party size, team labels, notes…) next to the fenced order spine.
 * The order itself is always placed through OrderService; this only attaches validated details to it.
 */
@Service
public class OrderDetailService {

    private final OrderDetailRepository repository;
    private final OrderService orderService;
    private final KitchenService kitchenService;
    private final TableSlotRepository tableSlotRepository;
    private final AuditService auditService;

    public OrderDetailService(OrderDetailRepository repository, OrderService orderService, KitchenService kitchenService,
                              TableSlotRepository tableSlotRepository, AuditService auditService) {
        this.repository = repository;
        this.orderService = orderService;
        this.kitchenService = kitchenService;
        this.tableSlotRepository = tableSlotRepository;
        this.auditService = auditService;
    }

    @Transactional
    public OrderDetailDto attach(Integer userId, AttachDetailRequest r) {
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in");
        if (r.getOrderId() == null) throw bad("orderId is required");
        OrderDto order = orderService.get(userId, r.getOrderId()); // ownership-checked
        if (repository.findByOrderId(order.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Details were already added to this order");
        }
        String wf = order.getWorkflowCode();
        String name = trim(r.getContactName());
        if (name == null || name.length() > 60) throw bad("Enter the name for the order (up to 60 characters)");
        String phone = normalisePhone(r.getPhone());
        if (phone == null) throw bad("Enter a valid 10-digit mobile number");
        String notes = trim(r.getNotes());
        int notesMax = ChulWorkflowSeeder.FEAST_ORDER.equals(wf) ? 500 : 200;
        if (notes != null && notes.length() > notesMax) throw bad("Notes can be up to " + notesMax + " characters");

        Instant now = Instant.now();
        OrderDetail d = OrderDetail.builder().orderId(order.getId()).userId(userId).workflowCode(wf)
                .contactName(name).phone(phone).notes(notes).createdAt(now).updatedAt(now).build();

        if (ChulWorkflowSeeder.CHUL_ORDER.equals(wf)) {
            if (r.getSlotDate() == null || r.getSlotTime() == null) throw bad("Choose a pickup / delivery time");
            boolean ok = kitchenService.pickupSlots(r.getSlotDate()).stream()
                    .anyMatch(s -> s.time().equals(r.getSlotTime().toString()) && s.remaining() > 0);
            if (!ok) throw new ResponseStatusException(HttpStatus.CONFLICT, "That time slot is no longer available — please pick another");
            d.setSlotDate(r.getSlotDate());
            d.setSlotTime(r.getSlotTime());
            boolean team = Boolean.TRUE.equals(r.getTeamLunch());
            d.setTeamLunch(team);
            if (team) {
                Integer boxes = r.getBoxCount();
                if (boxes == null || boxes < 2 || boxes > 15) throw bad("Team lunch is for 2 to 15 boxes");
                d.setBoxCount(boxes);
                List<String> labels = new ArrayList<>();
                for (String l : r.getBoxLabels() == null ? List.<String>of() : r.getBoxLabels()) {
                    String t = trim(l);
                    if (t != null) {
                        if (t.length() > 30) throw bad("Box labels can be up to 30 characters");
                        labels.add(t);
                    }
                }
                d.setBoxLabels(labels);
            }
        } else if (ChulWorkflowSeeder.TABLE_BOOKING.equals(wf)) {
            Integer party = r.getPartySize();
            if (party == null || party < 1 || party > 12) throw bad("Party size must be between 1 and 12");
            d.setPartySize(party);
            d.setOccasion(trim(r.getOccasion()));
            Long slotId = order.getItems().stream().filter(i -> TableSlotCatalogResolver.TABLE_SLOT.equals(i.getItemType()))
                    .map(OrderDto.OrderItemDto::getItemId).findFirst().orElseThrow(() -> bad("This order has no table slot"));
            TableSlot slot = tableSlotRepository.findById(slotId).orElseThrow(() -> bad("Table slot not found"));
            d.setTableSlotId(slotId);
            d.setSlotDate(slot.getDate());
            d.setSlotTime(slot.getTime());
        } else if (ChulWorkflowSeeder.FEAST_ORDER.equals(wf)) {
            if (r.getEventDate() == null || r.getEventDate().isBefore(LocalDate.now(KitchenService.IST).plusDays(2))) {
                throw bad("Party requests need at least 2 days' notice");
            }
            Integer guests = r.getGuestCount();
            if (guests == null || guests < 15 || guests > 500) throw bad("Guests must be between 15 and 500");
            int veg = r.getVegGuestCount() == null ? 0 : r.getVegGuestCount();
            if (veg < 0 || veg > guests) throw bad("Veg guests cannot be more than the total");
            d.setEventDate(r.getEventDate());
            d.setEventTime(r.getEventTime());
            d.setGuestCount(guests);
            d.setVegGuestCount(veg);
            d.setOccasion(trim(r.getOccasion()));
            d.setBudgetPerHead(r.getBudgetPerHead());
            d.setDishIds(r.getDishIds() == null ? new ArrayList<>() : new ArrayList<>(r.getDishIds()));
            d.setDeliveryAddressText(trim(r.getDeliveryAddressText()));
        } else {
            throw bad("This order type takes no extra details");
        }
        d = repository.save(d);
        auditService.record("ORDER_DETAIL_ATTACHED", "SUCCESS", "ORDER", String.valueOf(order.getId()), "workflow=" + wf);
        return toDto(d, null);
    }

    public OrderDetailDto forCustomer(Integer userId, Long orderId) {
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in");
        orderService.get(userId, orderId); // ownership check
        return repository.findByOrderId(orderId).map(d -> toDto(d, null)).orElse(null);
    }

    public OrderDetailDto forAdmin(Long orderId) {
        return repository.findByOrderId(orderId).map(d -> toDto(d, orderService.getAdmin(orderId))).orElse(null);
    }

    public List<OrderDetailDto> adminList(String workflowCode) {
        List<OrderDetailDto> out = new ArrayList<>();
        for (OrderDetail d : repository.findByWorkflowCodeOrderByCreatedAtDesc(workflowCode)) {
            out.add(toDto(d, orderService.getAdmin(d.getOrderId())));
        }
        return out;
    }

    @Transactional
    public OrderDetailDto setStaffNote(Long orderId, String note) {
        OrderDetail d = repository.findByOrderId(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No details for this order"));
        String n = trim(note);
        if (n != null && n.length() > 1000) throw bad("Note is too long (max 1000 characters)");
        d.setStaffNote(n);
        d.setUpdatedAt(Instant.now());
        repository.save(d);
        auditService.record("ORDER_STAFF_NOTE", "SUCCESS", "ORDER", String.valueOf(orderId), "note updated");
        return toDto(d, orderService.getAdmin(orderId));
    }

    private OrderDetailDto toDto(OrderDetail d, OrderDto order) {
        return OrderDetailDto.builder().id(d.getId()).orderId(d.getOrderId()).workflowCode(d.getWorkflowCode())
                .contactName(d.getContactName()).phone(d.getPhone()).notes(d.getNotes()).staffNote(d.getStaffNote())
                .slotDate(d.getSlotDate()).slotTime(d.getSlotTime()).teamLunch(d.getTeamLunch()).boxCount(d.getBoxCount())
                .boxLabels(new ArrayList<>(d.getBoxLabels())).partySize(d.getPartySize()).occasion(d.getOccasion())
                .eventDate(d.getEventDate()).eventTime(d.getEventTime()).guestCount(d.getGuestCount())
                .vegGuestCount(d.getVegGuestCount()).budgetPerHead(d.getBudgetPerHead()).dishIds(new ArrayList<>(d.getDishIds()))
                .deliveryAddressText(d.getDeliveryAddressText()).createdAt(d.getCreatedAt())
                .orderNumber(order == null ? null : order.getOrderNumber())
                .stageCode(order == null ? null : order.getCurrentStageCode())
                .total(order == null ? null : order.getTotal()).build();
    }

    private static String trim(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static String normalisePhone(String raw) {
        if (raw == null) return null;
        String digits = raw.replaceAll("[^0-9]", "");
        if (digits.length() == 12 && digits.startsWith("91")) digits = digits.substring(2);
        if (digits.length() == 11 && digits.startsWith("0")) digits = digits.substring(1);
        return digits.matches("[6-9][0-9]{9}") ? digits : null;
    }

    private static ResponseStatusException bad(String m) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, m);
    }
}
