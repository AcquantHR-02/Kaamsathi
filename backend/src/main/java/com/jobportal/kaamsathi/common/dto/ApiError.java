package com.jobportal.kaamsathi.common.dto;

import java.util.Map;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

/**
 * The one error JSON shape the whole app returns.
 * Example: {"timestamp":"...","status":404,"code":"NOT_FOUND","message":"...","path":"/api/x"}
 *
 * details = optional extra data for some errors, left out of the JSON when null:
 *   ACCOUNT_LOCKED → {"lockedUntil": "..."} · INVALID_OTP (wrong code) → {"triesLeft": 3}
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        Instant timestamp,
        int status,
        String code,
        String message,
        String path,
        Map<String, Object> details
) {

    // most errors have no details
    public ApiError(Instant timestamp, int status, String code, String message, String path) {
        this(timestamp, status, code, message, path, null);
    }
}
