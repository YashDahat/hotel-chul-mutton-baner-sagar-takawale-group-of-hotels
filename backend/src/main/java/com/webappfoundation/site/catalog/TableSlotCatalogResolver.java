package com.webappfoundation.site.catalog;

import com.webappfoundation.catalog.CatalogItemResolver;
import com.webappfoundation.dto.CatalogItemDto;
import com.webappfoundation.site.model.TableSlot;
import com.webappfoundation.site.repository.TableSlotRepository;
import com.webappfoundation.site.workflow.ChulWorkflowSeeder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** A table slot is a ₹0 sellable (itemType TABLE_SLOT) so bookings run through the order spine. */
@Component
public class TableSlotCatalogResolver implements CatalogItemResolver {

    public static final String TABLE_SLOT = "TABLE_SLOT";

    private final TableSlotRepository repository;

    public TableSlotCatalogResolver(TableSlotRepository repository) {
        this.repository = repository;
    }

    @Override
    public String itemType() {
        return TABLE_SLOT;
    }

    @Override
    public List<CatalogItemDto> resolve(Collection<Long> ids) {
        return repository.findAllById(ids).stream().filter(TableSlot::isActive).map(this::toDto).toList();
    }

    private CatalogItemDto toDto(TableSlot s) {
        Map<String, Object> attrs = new LinkedHashMap<>();
        attrs.put("date", s.getDate().toString());
        attrs.put("time", s.getTime().toString());
        attrs.put("tablesLeft", Math.max(0, s.getTables() - (s.getReserved() == null ? 0 : s.getReserved())));
        return CatalogItemDto.builder()
                .itemType(TABLE_SLOT).itemId(s.getId())
                .name("Table for " + s.getDate() + " at " + s.getTime())
                .price(BigDecimal.ZERO).priceUnit("table")
                .detailPath("/book").category("booking")
                .active(s.isActive()).cartable(false)
                .workflowCode(ChulWorkflowSeeder.TABLE_BOOKING)
                .attributes(attrs)
                .build();
    }
}
