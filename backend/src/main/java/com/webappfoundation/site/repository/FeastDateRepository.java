package com.webappfoundation.site.repository;

import com.webappfoundation.site.model.FeastDate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FeastDateRepository extends JpaRepository<FeastDate, Long> {
    List<FeastDate> findByActiveTrueAndDateGreaterThanEqualOrderByDateAsc(LocalDate from);

    List<FeastDate> findAllByOrderByDateAsc();
}
