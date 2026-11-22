package com.jobportal.kaamsathi.admin.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Fixed list: admin endpoint (method + path) → action name + target type.
 * So the frontend gets "COMPANY_VERIFIED" instead of parsing "/api/companies/<id>/verify".
 * A new admin endpoint that is not listed here is still audited, just with action / targetType = null.
 */
public final class AuditActions {

    public record AuditAction(String action, String targetType) {
    }

    private record Rule(String method, Pattern path, AuditAction result) {
    }

    private static final String ID = "[0-9a-fA-F-]{36}";
    private static final List<Rule> RULES = new ArrayList<>();

    static {
        rule("POST", "/api/admin/admins", "ADMIN_CREATED", "USER");
        rule("POST", "/api/admin/users/{id}/suspend", "USER_SUSPENDED", "USER");
        rule("POST", "/api/admin/users/{id}/unsuspend", "USER_UNSUSPENDED", "USER");
        rule("DELETE", "/api/admin/users/{id}", "USER_DELETED", "USER");
        rule("POST", "/api/companies/{id}/verify", "COMPANY_VERIFIED", "COMPANY");
        rule("POST", "/api/companies/{id}/reject", "COMPANY_REJECTED", "COMPANY");
        rule("POST", "/api/admin/jobs/{id}/block", "JOB_BLOCKED", "JOB");
        rule("POST", "/api/admin/jobs/{id}/unblock", "JOB_UNBLOCKED", "JOB");
        rule("POST", "/api/admin/payments/{id}/approve", "PAYMENT_APPROVED", "PAYMENT");
        rule("POST", "/api/admin/payments/{id}/reject", "PAYMENT_REJECTED", "PAYMENT");
        // same 4 actions for every admin-managed list
        Map.of("/api/masterdata/skills", "SKILL",
                "/api/masterdata/cities", "CITY",
                "/api/masterdata/industries", "INDUSTRY",
                "/api/masterdata/categories", "JOB_CATEGORY",
                "/api/admin/plans", "PLAN").forEach((base, type) -> {
            rule("POST", base, type + "_CREATED", type);
            rule("PUT", base + "/{id}", type + "_UPDATED", type);
            rule("POST", base + "/{id}/deactivate", type + "_DEACTIVATED", type);
            rule("POST", base + "/{id}/activate", type + "_ACTIVATED", type);
        });
    }

    private AuditActions() {
    }

    private static void rule(String method, String path, String action, String targetType) {
        RULES.add(new Rule(method, Pattern.compile(path.replace("{id}", ID)), new AuditAction(action, targetType)));
    }

    public static Optional<AuditAction> find(String method, String path) {
        return RULES.stream()
                .filter(r -> r.method().equals(method) && r.path().matcher(path).matches())
                .map(Rule::result)
                .findFirst();
    }
}
