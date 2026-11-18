package com.webappfoundation.site.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "site_suggestion")
public class Suggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Integer userId;
    @Column(nullable = false, length = 500)
    private String text;
    /** menu | service | site | other */
    @Column(nullable = false)
    private String category;
    /** NEW | PLANNED | DONE */
    @Column(nullable = false)
    @Builder.Default
    private String status = "NEW";
    @Column(columnDefinition = "text")
    private String publicNote;
    @Column(nullable = false)
    @Builder.Default
    private boolean showPublic = false;
    @Column(nullable = false)
    private Instant createdAt;
    @Column(nullable = false)
    private Instant updatedAt;
}
