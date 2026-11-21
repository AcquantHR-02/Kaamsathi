package com.jobportal.kaamsathi.company.dto;

/**
 * Public badge on job cards / company page:
 *   newEmployer = true  → show "New employer"
 *   newEmployer = false → "Replies to {replyRatePercent}% of applicants within 4 days
 *                          (based on {basedOnApplications} applications, last 90 days)"
 */
public record EmployerScore(Integer replyRatePercent, int basedOnApplications, boolean newEmployer) {

    public static EmployerScore of(Integer rate, int basis) {
        return new EmployerScore(rate, basis, rate == null);
    }
}
