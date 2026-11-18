package com.webappfoundation.site.repository;

import com.webappfoundation.site.model.BlackoutDate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BlackoutDateRepository extends JpaRepository<BlackoutDate, Long> {
    List<BlackoutDate> findByDateGreaterThanEqualOrderByDateAsc(LocalDate from);

    List<BlackoutDate> findByDate(LocalDate date);
}
