package com.webappfoundation.site.catalog;

import com.webappfoundation.inventory.InventoryProvider;
import com.webappfoundation.site.model.TableSlot;
import com.webappfoundation.site.repository.TableSlotRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Tables as stock: one booking holds one table; a full slot answers 409 (no overbooking). */
@Component
public class TableSlotInventoryProvider implements InventoryProvider {

    private final TableSlotRepository repository;

    public TableSlotInventoryProvider(TableSlotRepository repository) {
        this.repository = repository;
    }

    @Override
    public String itemType() {
        return TableSlotCatalogResolver.TABLE_SLOT;
    }

    @Override
    public boolean availableAt(Long itemId, Long branchId) {
        TableSlot s = repository.findById(itemId).orElse(null);
        return s != null && s.isActive() && s.getTables() - (s.getReserved() == null ? 0 : s.getReserved()) > 0;
    }

    @Override
    @Transactional
    public void reserve(Long itemId, String variantKey, Long branchId, int qty) {
        if (qty <= 0) return;
        if (repository.reserveIfAvailable(itemId, qty) == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That table slot has just filled up — please pick another time");
        }
    }

    @Override
    public void commit(Long itemId, String variantKey, Long branchId, int qty) {
        // a held table stays counted once booked
    }

    @Override
    @Transactional
    public void release(Long itemId, String variantKey, Long branchId, int qty) {
        if (qty > 0) repository.release(itemId, qty);
    }
}
