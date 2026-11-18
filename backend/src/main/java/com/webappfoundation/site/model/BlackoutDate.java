package com.webappfoundation.site.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "site_blackout_date")
public class BlackoutDate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "blackout_date", nullable = false)
    private LocalDate date;
    private String reason;
    /** ORDERS | TABLES | BOTH */
    @Column(nullable = false)
    @Builder.Default
    private String appliesTo = "BOTH";
}
