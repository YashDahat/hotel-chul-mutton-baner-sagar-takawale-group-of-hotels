package com.webappfoundation.site.service;

import com.webappfoundation.dto.BulkUploadResult;
import com.webappfoundation.model.LoyaltyEventType;
import com.webappfoundation.service.AuditService;
import com.webappfoundation.service.LoyaltyEventService;
import com.webappfoundation.service.SpreadsheetParser;
import com.webappfoundation.site.model.Suggestion;
import com.webappfoundation.site.repository.SuggestionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/** "Suggest an idea": customers send ideas, staff triage them, and the best are shown publicly once acted on. */
@Service
public class SuggestionService {

    private static final List<String> CATEGORIES = List.of("menu", "service", "site", "other");
    private static final List<String> STATUSES = List.of("NEW", "PLANNED", "DONE");

    private final SuggestionRepository repository;
    private final LoyaltyEventService loyaltyEventService;
    private final AuditService auditService;
    private final SpreadsheetParser spreadsheetParser;

    public SuggestionService(SuggestionRepository repository, LoyaltyEventService loyaltyEventService,
                             AuditService auditService, SpreadsheetParser spreadsheetParser) {
        this.repository = repository;
        this.loyaltyEventService = loyaltyEventService;
        this.auditService = auditService;
        this.spreadsheetParser = spreadsheetParser;
    }

    @Transactional
    public Suggestion create(Integer userId, String text, String category) {
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in");
        String t = text == null ? "" : text.trim();
        if (t.length() < 5 || t.length() > 500) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ideas need 5 to 500 characters");
        String c = category == null ? "other" : category.trim().toLowerCase();
        if (!CATEGORIES.contains(c)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown category");
        Instant now = Instant.now();
        Suggestion s = repository.save(Suggestion.builder().userId(userId).text(t).category(c).status("NEW")
                .createdAt(now).updatedAt(now).build());
        loyaltyEventService.record(userId, LoyaltyEventType.SUGGESTION, null, Map.of("suggestionId", s.getId()));
        return s;
    }

    public List<Suggestion> mine(Integer userId) {
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in");
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Suggestion> publicList() {
        return repository.findByShowPublicTrueOrderByUpdatedAtDesc();
    }

    public List<Suggestion> adminList() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Suggestion triage(Long id, String status, String publicNote, Boolean showPublic) {
        Suggestion s = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Suggestion not found"));
        if (status != null) {
            if (!STATUSES.contains(status)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status must be NEW, PLANNED or DONE");
            s.setStatus(status);
        }
        if (publicNote != null) s.setPublicNote(publicNote.isBlank() ? null : publicNote.trim());
        if (showPublic != null) s.setShowPublic(showPublic);
        s.setUpdatedAt(Instant.now());
        repository.save(s);
        auditService.record("SUGGESTION_TRIAGED", "SUCCESS", "SUGGESTION", String.valueOf(id), "status=" + s.getStatus() + " public=" + s.isShowPublic());
        return s;
    }

    /** Bulk import of ideas collected offline (counter cards, WhatsApp): columns text, category, status. */
    @Transactional
    public BulkUploadResult bulkImport(MultipartFile file, Integer adminUserId) {
        BulkUploadResult result = BulkUploadResult.builder().build();
        int row = 1;
        for (Map<String, String> r : spreadsheetParser.parse(file)) {
            row++;
            String text = Parse.blankToNull(r.get("text"));
            if (text == null || text.length() < 5 || text.length() > 500) { result.addError(row, "text must be 5 to 500 characters"); continue; }
            String cat = r.get("category") == null ? "other" : r.get("category").trim().toLowerCase();
            if (!CATEGORIES.contains(cat)) cat = "other";
            String status = r.get("status") == null ? "NEW" : r.get("status").trim().toUpperCase();
            if (!STATUSES.contains(status)) status = "NEW";
            Instant now = Instant.now();
            repository.save(Suggestion.builder().userId(adminUserId == null ? 0 : adminUserId).text(text).category(cat).status(status)
                    .createdAt(now).updatedAt(now).build());
            result.setCreated(result.getCreated() + 1);
        }
        auditService.record("SUGGESTION_BULK_IMPORT", "SUCCESS", "SUGGESTION", null, "created=" + result.getCreated());
        return result;
    }
}
