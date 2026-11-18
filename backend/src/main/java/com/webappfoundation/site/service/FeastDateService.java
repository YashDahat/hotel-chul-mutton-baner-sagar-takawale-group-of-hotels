package com.webappfoundation.site.service;

import com.webappfoundation.dto.BulkUploadResult;
import com.webappfoundation.service.AuditService;
import com.webappfoundation.service.SpreadsheetParser;
import com.webappfoundation.site.model.FeastDate;
import com.webappfoundation.site.repository.FeastDateRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class FeastDateService {

    private final FeastDateRepository repository;
    private final AuditService auditService;
    private final SpreadsheetParser spreadsheetParser;

    public FeastDateService(FeastDateRepository repository, AuditService auditService, SpreadsheetParser spreadsheetParser) {
        this.repository = repository;
        this.auditService = auditService;
        this.spreadsheetParser = spreadsheetParser;
    }

    public List<FeastDate> upcoming() {
        return repository.findByActiveTrueAndDateGreaterThanEqualOrderByDateAsc(LocalDate.now(KitchenService.IST));
    }

    public List<FeastDate> adminList() {
        return repository.findAllByOrderByDateAsc();
    }

    @Transactional
    public FeastDate save(Long id, FeastDate in) {
        if (in.getName() == null || in.getName().isBlank() || in.getName().length() > 80) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required (max 80 characters)");
        }
        if (in.getDate() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date is required");
        if (in.getPreorderOpensOn() != null && in.getPreorderOpensOn().isAfter(in.getDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pre-orders must open on or before the feast day");
        }
        String wf = in.getWorkflowCode() == null || in.getWorkflowCode().isBlank() ? "feast-order" : in.getWorkflowCode();
        if (!List.of("feast-order", "chul-order").contains(wf)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "workflowCode must be feast-order or chul-order");
        }
        FeastDate f = id == null ? new FeastDate() : repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Feast date not found"));
        f.setName(in.getName().trim());
        f.setMarathiName(Parse.blankToNull(in.getMarathiName()));
        f.setDate(in.getDate());
        f.setPreorderOpensOn(in.getPreorderOpensOn());
        f.setDescription(Parse.blankToNull(in.getDescription()));
        f.setWorkflowCode(wf);
        f.setActive(in.isActive());
        FeastDate saved = repository.save(f);
        auditService.record(id == null ? "FEAST_DATE_CREATED" : "FEAST_DATE_UPDATED", "SUCCESS", "FEAST_DATE", String.valueOf(saved.getId()), saved.getName());
        return saved;
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
        auditService.record("FEAST_DATE_DELETED", "SUCCESS", "FEAST_DATE", String.valueOf(id), null);
    }

    @Transactional
    public BulkUploadResult bulkImport(MultipartFile file) {
        BulkUploadResult result = BulkUploadResult.builder().build();
        int row = 1;
        for (Map<String, String> r : spreadsheetParser.parse(file)) {
            row++;
            String name = Parse.blankToNull(r.get("name"));
            LocalDate date = Parse.date(r.get("date"));
            if (name == null || date == null) { result.addError(row, "name and date (YYYY-MM-DD) are required"); continue; }
            String wf = Parse.blankToNull(r.get("workflowcode"));
            repository.save(FeastDate.builder().name(name).marathiName(Parse.blankToNull(r.get("marathiname"))).date(date)
                    .preorderOpensOn(Parse.date(r.get("preorderopenson"))).description(Parse.blankToNull(r.get("description")))
                    .workflowCode("chul-order".equals(wf) ? "chul-order" : "feast-order").active(true).build());
            result.setCreated(result.getCreated() + 1);
        }
        auditService.record("FEAST_DATE_BULK_IMPORT", "SUCCESS", "FEAST_DATE", null, "created=" + result.getCreated());
        return result;
    }
}
