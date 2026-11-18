package com.webappfoundation.site.seed;

import com.webappfoundation.model.Branch;
import com.webappfoundation.model.Product;
import com.webappfoundation.repository.BranchRepository;
import com.webappfoundation.repository.ProductRepository;
import com.webappfoundation.site.service.KitchenService;
import com.webappfoundation.site.service.TableSlotService;
import com.webappfoundation.site.workflow.ChulWorkflowSeeder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Idempotent demo data built from the few facts we have: the Baner outlet, the menu (five dishes with confirmed
 * list prices, the rest flagged as indicative), kitchen status and a fortnight of lunch table slots.
 * No reviews, feast dates or suggestions are invented.
 */
@Component
@Order(20)
public class SiteDataSeeder {

    private static final Logger log = LoggerFactory.getLogger(SiteDataSeeder.class);

    private final ProductRepository productRepository;
    private final BranchRepository branchRepository;
    private final KitchenService kitchenService;
    private final TableSlotService tableSlotService;

    public SiteDataSeeder(ProductRepository productRepository, BranchRepository branchRepository,
                          KitchenService kitchenService, TableSlotService tableSlotService) {
        this.productRepository = productRepository;
        this.branchRepository = branchRepository;
        this.kitchenService = kitchenService;
        this.tableSlotService = tableSlotService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        seedBranch();
        seedMenu();
        kitchenService.get();
        int slots = tableSlotService.generate(14);
        log.info("Chul Mutton seed done (table slots created: {})", slots);
    }

    private void seedBranch() {
        if (branchRepository.count() > 0) return;
        Instant now = Instant.now();
        branchRepository.save(Branch.builder().name("Hotel Chul Mutton, Baner").slug("baner").phone("+917272815555")
                .addressLine("Survey no. 119/5/11 & 120, 6, Balewadi High Street, near My World Society, Baner")
                .city("Pune").state("Maharashtra").pincode("411045").latitude(18.5670566).longitude(73.7763673)
                .googleMapsUrl("https://www.google.com/maps/place/?q=place_id:ChIJHRxjCBi_wjsRpt4jbmLdoSA")
                .openingHours("Lunch 12:00 PM – 4:30 PM").active(true).createdAt(now).updatedAt(now).build());
    }

    private void seedMenu() {
        if (productRepository.existsBySlug("mutton-thali")) return;
        List<Product> items = new ArrayList<>();
        // Thalis
        items.add(dish("mutton-thali", "Mutton Thali", 450, "Thalis", false, "मटण थाळी", false,
                "The full Maharashtrian mutton feast on one plate — chul-cooked mutton, bhakri, rice and sides.", 0));
        items.add(dish("chicken-thali", "Chicken Thali", 380, "Thalis", false, "चिकन थाळी", false,
                "Maharashtrian chicken curry with bhakri, rice and sides.", 0));
        // From the chul
        items.add(dish("chul-mutton-handi", "Chul Mutton Handi (½ kg)", 650, "From the chul", false, "चूल मटण हंडी", false,
                "Slow-cooked on the chul in a handi. Made in small daily batches.", 20));
        items.add(dish("mutton-sukka", "Mutton Sukka", 380, "From the chul", false, "मटण सुक्का", false,
                "Dry-roasted mutton with Maharashtrian masala.", 0));
        items.add(dish("maharashtrian-chicken-curry", "Maharashtrian Chicken Curry", 340, "From the chul", false, "महाराष्ट्रीयन चिकन", false,
                "The Maharashtrian chicken our guests keep naming.", 0));
        // Bhakri & roti (confirmed list prices)
        items.add(dish("jwari-bhakari", "Jwari Bhakari (1 pc)", 35, "Bhakri & roti", true, "ज्वारी भाकरी", true,
                "Jowar bhakri, patted by hand.", 0));
        items.add(dish("tandoor-roti", "Tandoor Roti", 30, "Bhakri & roti", true, null, true, "Fresh from the tandoor.", 0));
        items.add(dish("tandoor-roti-butter", "Tandoor Roti Butter", 35, "Bhakri & roti", true, null, true, "Tandoor roti brushed with butter.", 0));
        // Veg from the chul
        items.add(dish("shev-bhaji", "Shev Bhaji", 200, "Veg from the chul", true, "शेव भाजी", true,
                "Spicy gathiya in curry — a Maharashtrian classic.", 0));
        items.add(dish("chul-wanga-masala", "Chul Wanga Masala", 210, "Veg from the chul", true, "चूल वांगं मसाला", true,
                "Brinjal masala cooked over the chul.", 0));
        items.add(dish("paneer-banjara-kebab", "Paneer Banjara Kebab", 320, "Veg from the chul", true, null, false,
                "A guest favourite from the grill.", 0));
        // Sides & drinks
        items.add(dish("indrayani-rice", "Indrayani Rice", 90, "Sides & drinks", true, "इंद्रायणी भात", false, "Fragrant Indrayani rice.", 0));
        items.add(dish("solkadhi", "Solkadhi", 60, "Sides & drinks", true, "सोलकढी", false, "Kokum and coconut cooler to finish the meal.", 0));
        productRepository.saveAll(items);

        Instant now = Instant.now();
        productRepository.save(Product.builder().name("Party order request").slug("party-order-request")
                .description("A ₹0 request so your party order appears on our catering board. We call back with a quote.")
                .price(BigDecimal.ZERO).category("request").workflowCode(ChulWorkflowSeeder.FEAST_ORDER)
                .features(new ArrayList<>(List.of("Request only — nothing is charged"))).active(true).createdAt(now).updatedAt(now).build());
    }

    /** Diet / Marathi name / price-confirmation travel as readable feature lines (the foundation Product has no free attributes). */
    private Product dish(String slug, String name, int price, String category, boolean veg, String marathi, boolean priceConfirmed,
                         String description, int handiStock) {
        Instant now = Instant.now();
        List<String> features = new ArrayList<>();
        features.add(veg ? "Veg" : "Non-veg");
        if (marathi != null) features.add("Marathi: " + marathi);
        if (!priceConfirmed) features.add("Indicative price — confirmed on the day");
        return Product.builder().name(name).slug(slug).description(description).price(BigDecimal.valueOf(price))
                .category(category).workflowCode(ChulWorkflowSeeder.CHUL_ORDER).features(features)
                .stockTracked(handiStock > 0).stock(handiStock > 0 ? handiStock : null).reserved(0)
                .active(true).createdAt(now).updatedAt(now).build();
    }
}
