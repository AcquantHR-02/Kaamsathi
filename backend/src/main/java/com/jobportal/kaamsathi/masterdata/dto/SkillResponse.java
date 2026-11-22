package com.jobportal.kaamsathi.masterdata.dto;

import com.jobportal.kaamsathi.masterdata.entity.Skill;

import java.time.Instant;
import java.util.UUID;

/**
 * What we send back about a skill. createdAt is for the admin table (dropdowns ignore it).
 */
public record SkillResponse(
        UUID id,
        String name,
        boolean active,
        Instant createdAt           // admin table "Added" column
) {

    // entity → DTO (called inside the service, so the entity never leaves it)
    public static SkillResponse from(Skill skill) {
        return new SkillResponse(skill.getId(), skill.getName(), skill.isActive(), skill.getCreatedAt());
    }
}
