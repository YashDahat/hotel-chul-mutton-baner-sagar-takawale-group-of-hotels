package com.webappfoundation.site.repository;

import com.webappfoundation.site.model.Suggestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {
    List<Suggestion> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<Suggestion> findByShowPublicTrueOrderByUpdatedAtDesc();

    List<Suggestion> findAllByOrderByCreatedAtDesc();
}
