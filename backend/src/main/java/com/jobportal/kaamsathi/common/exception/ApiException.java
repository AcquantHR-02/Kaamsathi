package com.jobportal.kaamsathi.common.exception;

import java.util.Map;

/**
 * Thrown by services when a business rule fails, e.g.
 *   throw new ApiException(ErrorCode.EMAIL_ALREADY_EXISTS);
 * GlobalExceptionHandler turns it into ApiError JSON with the code's HTTP status.
 */
public class ApiException extends RuntimeException {

    private final ErrorCode errorCode;
    private final Map<String, Object> details;    // optional extra data for ApiError.details (null = none)

    // use the code's default message
    public ApiException(ErrorCode errorCode) {
        this(errorCode, errorCode.getDefaultMessage());
    }

    // use a custom message (when the default is not specific enough)
    public ApiException(ErrorCode errorCode, String message) {
        this(errorCode, message, null);
    }

    // with extra data, e.g. new ApiException(ACCOUNT_LOCKED, msg, Map.of("lockedUntil", until))
    public ApiException(ErrorCode errorCode, String message, Map<String, Object> details) {
        super(message);
        this.errorCode = errorCode;
        this.details = details;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public Map<String, Object> getDetails() {
        return details;
    }
}
