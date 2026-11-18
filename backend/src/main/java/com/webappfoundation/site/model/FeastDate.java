package com.webappfoundation.site.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** An admin-entered feast day (lunar dates are never guessed in code). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "site_feast_date")
public class FeastDate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    private String marathiName;
    @Column(name = "feast_date", nullable = false)
    private LocalDate date;
    private LocalDate preorderOpensOn;
    @Column(columnDefinition = "text")
    private String description;
    /** feast-order | chul-order */
    @Column(nullable = false)
    @Builder.Default
    private String workflowCode = "feast-order";
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
