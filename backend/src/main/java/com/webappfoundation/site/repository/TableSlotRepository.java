package com.webappfoundation.site.repository;

import com.webappfoundation.site.model.TableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface TableSlotRepository extends JpaRepository<TableSlot, Long> {
    List<TableSlot> findByDateBetweenAndActiveTrueOrderByDateAscTimeAsc(LocalDate from, LocalDate to);

    List<TableSlot> findAllByOrderByDateAscTimeAsc();

    Optional<TableSlot> findByDateAndTime(LocalDate date, LocalTime time);

    @Modifying
    @Query("update TableSlot t set t.reserved = t.reserved + :qty where t.id = :id and t.active = true and (t.tables - t.reserved) >= :qty")
    int reserveIfAvailable(@Param("id") Long id, @Param("qty") int qty);

    @Modifying
    @Query("update TableSlot t set t.reserved = t.reserved - :qty where t.id = :id and t.reserved >= :qty")
    int release(@Param("id") Long id, @Param("qty") int qty);
}
