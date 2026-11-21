package com.jobportal.kaamsathi.company.event;

import com.jobportal.kaamsathi.company.dto.ResponseScore;

import java.util.List;

/**
 * Daily scores were saved. Companies NOT in the list have no score now (reset to "New employer").
 * The job module copies the rates onto its jobs (search boost) in the same transaction.
 */
public record ResponseScoresUpdated(List<ResponseScore> scores) {
}
