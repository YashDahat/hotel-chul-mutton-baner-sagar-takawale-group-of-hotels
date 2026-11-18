package com.webappfoundation.site.repository;

import com.webappfoundation.site.model.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    Optional<OrderDetail> findByOrderId(Long orderId);

    List<OrderDetail> findByWorkflowCodeOrderByCreatedAtDesc(String workflowCode);

    long countByWorkflowCodeAndSlotDateAndSlotTime(String workflowCode, LocalDate slotDate, LocalTime slotTime);
}
