package com.jobportal.kaamsathi.masterdata.dto;

import com.jobportal.kaamsathi.masterdata.entity.JobCategory;

import java.time.Instant;
import java.util.UUID;

/**
 * What we send back about a job category.
 */
public record JobCategoryResponse(
        UUID id,
        String name,
        boolean active,
        Instant createdAt           // admin table "Added" column
) {

    public static JobCategoryResponse from(JobCategory category) {
        return new JobCategoryResponse(category.getId(), category.getName(), category.isActive(), category.getCreatedAt());
    }
}
