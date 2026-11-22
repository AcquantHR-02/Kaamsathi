package com.jobportal.kaamsathi.auth.dto;

/** Reset-password page: whose account this link is for, masked ("p•••@gmail.com"). */
public record ResetPreviewResponse(String maskedEmail) {

    // "priya@gmail.com" → "p•••@gmail.com" (first letter + domain only)
    public static ResetPreviewResponse of(String email) {
        int at = email.indexOf('@');
        String masked = at <= 0 ? "•••" : email.charAt(0) + "•••" + email.substring(at);
        return new ResetPreviewResponse(masked);
    }
}
