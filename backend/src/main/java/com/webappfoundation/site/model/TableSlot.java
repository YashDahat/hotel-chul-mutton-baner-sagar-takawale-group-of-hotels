package com.webappfoundation.site.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/** A bookable lunch slot: {@code tables} is the stock, {@code reserved} the tables already held. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "site_table_slot", uniqueConstraints = @UniqueConstraint(columnNames = {"slot_date", "slot_time"}))
public class TableSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "slot_date", nullable = false)
    private LocalDate date;
    @Column(name = "slot_time", nullable = false)
    private LocalTime time;
    @Column(nullable = false)
    private Integer tables;
    @Column(nullable = false)
    @Builder.Default
    private Integer reserved = 0;
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
