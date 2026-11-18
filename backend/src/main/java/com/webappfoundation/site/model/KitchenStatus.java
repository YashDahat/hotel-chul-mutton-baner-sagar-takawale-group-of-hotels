package com.webappfoundation.site.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

/** Single-row admin-controlled kitchen status (open / closed today / reopening on a date) and slot settings. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "site_kitchen_status")
public class KitchenStatus {
    @Id
    private Long id;
    /** OPEN | CLOSED_TODAY | CLOSED_UNTIL */
    @Column(nullable = false)
    private String mode;
    private LocalDate reopensOn;
    private String message;
    private LocalTime lunchOpen;
    private LocalTime lunchClose;
    private LocalTime dinnerOpen;
    private LocalTime dinnerClose;
    @Column(nullable = false)
    @Builder.Default
    private boolean orderingEnabled = true;
    @Column(nullable = false)
    @Builder.Default
    private Integer slotCapacity = 12;
    @Column(nullable = false)
    @Builder.Default
    private Integer leadMinutes = 30;
    private Instant updatedAt;
}
