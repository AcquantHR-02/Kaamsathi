package com.jobportal.kaamsathi.job.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Admin blocks a job: {"reason": "Asks applicants for money"} — the company sees the reason. */
public record BlockJobRequest(

        @NotBlank(message = "reason is required")
        @Size(max = 500, message = "reason must be at most 500 characters")
        String reason
) {
}
