package com.webappfoundation.site.repository;

import com.webappfoundation.site.model.KitchenStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KitchenStatusRepository extends JpaRepository<KitchenStatus, Long> {
}
