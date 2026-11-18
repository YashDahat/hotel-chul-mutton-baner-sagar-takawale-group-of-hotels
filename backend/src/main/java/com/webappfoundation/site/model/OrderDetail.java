package com.webappfoundation.site.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/** Process inputs for an order (slot, party size, notes, team labels…) kept 1:1 with the order spine row. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "site_order_detail")
public class OrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private Long orderId;
    @Column(nullable = false)
    private Integer userId;
    @Column(nullable = false)
    private String workflowCode;
    private String contactName;
    private String phone;
    @Column(columnDefinition = "text")
    private String notes;
    /** Customer-visible note from the kitchen / host / catering lead (e.g. the quote). */
    @Column(columnDefinition = "text")
    private String staffNote;

    // chul-order
    private LocalDate slotDate;
    private LocalTime slotTime;
    private Boolean teamLunch;
    private Integer boxCount;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "site_order_detail_box_labels", joinColumns = @JoinColumn(name = "detail_id"))
    @Column(name = "label")
    @Builder.Default
    private List<String> boxLabels = new ArrayList<>();

    // table-booking
    private Integer partySize;
    private String occasion;
    private Long tableSlotId;

    // feast-order
    private LocalDate eventDate;
    private LocalTime eventTime;
    private Integer guestCount;
    private Integer vegGuestCount;
    private BigDecimal budgetPerHead;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "site_order_detail_dishes", joinColumns = @JoinColumn(name = "detail_id"))
    @Column(name = "dish_id")
    @Builder.Default
    private List<Long> dishIds = new ArrayList<>();
    @Column(columnDefinition = "text")
    private String deliveryAddressText;

    @Column(nullable = false)
    private Instant createdAt;
    @Column(nullable = false)
    private Instant updatedAt;
}
