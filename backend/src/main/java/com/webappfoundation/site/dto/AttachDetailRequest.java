package com.webappfoundation.site.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** Process inputs sent right after placing an order (identity is server-derived; order ownership is checked). */
@Data
public class AttachDetailRequest {
    private Long orderId;
    private String contactName;
    private String phone;
    private String notes;
    // chul-order
    private LocalDate slotDate;
    private LocalTime slotTime;
    private Boolean teamLunch;
    private Integer boxCount;
    private List<String> boxLabels;
    // table-booking
    private Integer partySize;
    private String occasion;
    // feast-order
    private LocalDate eventDate;
    private LocalTime eventTime;
    private Integer guestCount;
    private Integer vegGuestCount;
    private BigDecimal budgetPerHead;
    private List<Long> dishIds;
    private String deliveryAddressText;
}
