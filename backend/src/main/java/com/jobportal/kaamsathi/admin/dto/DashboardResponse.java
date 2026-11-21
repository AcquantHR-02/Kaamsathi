package com.jobportal.kaamsathi.admin.dto;

import java.time.Instant;

/**
 * Admin home page numbers. Grouped so the frontend can show one card per group.
 */
public record DashboardResponse(
        Users users,
        Companies companies,
        Jobs jobs,
        Applications applications,
        Payments payments,
        Instant generatedAt
) {
    public record Users(long seekers, long companyOwners, long recruiters, long admins, long suspended) {
    }

    public record Companies(long pending, long verified, long rejected) {
    }

    public record Jobs(long live) {
    }

    public record Applications(long total, long last30Days) {
    }

    public record Payments(long pendingApproval, long approved, long approvedRupees) {
    }
}
