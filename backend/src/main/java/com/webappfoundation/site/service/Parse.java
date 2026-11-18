package com.webappfoundation.site.service;

import java.time.LocalDate;
import java.time.LocalTime;

/** Tiny null-safe parsers shared by the bulk importers. */
final class Parse {
    private Parse() {}

    static LocalDate date(String v) {
        if (v == null || v.isBlank()) return null;
        try { return LocalDate.parse(v.trim()); } catch (Exception e) { return null; }
    }

    static LocalTime time(String v) {
        if (v == null || v.isBlank()) return null;
        try { return LocalTime.parse(v.trim()); } catch (Exception e) { return null; }
    }

    static Integer integer(String v) {
        if (v == null || v.isBlank()) return null;
        try { return Integer.parseInt(v.trim()); } catch (NumberFormatException e) { return null; }
    }

    static String blankToNull(String v) {
        return v == null || v.isBlank() ? null : v.trim();
    }
}
