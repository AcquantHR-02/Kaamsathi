package com.jobportal.kaamsathi.application.event;

import com.jobportal.kaamsathi.application.entity.ApplicationStatus;

import java.util.UUID;

/** A recruiter moved an application (SHORTLISTED … HIRED / REJECTED). The seeker is told. */
public record ApplicationStatusChanged(UUID applicationId, UUID seekerId, String jobTitle, ApplicationStatus status) {
}
