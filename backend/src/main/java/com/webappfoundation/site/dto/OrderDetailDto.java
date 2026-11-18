package com.webappfoundation.site.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailDto {
    private Long id;
    private Long orderId;
    private String workflowCode;
    private String contactName;
    private String phone;
    private String notes;
    private String staffNote;
    private LocalDate slotDate;
    private LocalTime slotTime;
    private Boolean teamLunch;
    private Integer boxCount;
    private List<String> boxLabels;
    private Integer partySize;
    private String occasion;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private Integer guestCount;
    private Integer vegGuestCount;
    private BigDecimal budgetPerHead;
    private List<Long> dishIds;
    private String deliveryAddressText;
    private Instant createdAt;
    // admin list extras
    private String orderNumber;
    private String stageCode;
    private BigDecimal total;
}
