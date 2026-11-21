package com.jobportal.kaamsathi.auth.service;

import java.util.UUID;

/**
 * How many recruiters a company may have. Auth OWNS this interface; the payment module IMPLEMENTS it.
 * Why: payment already depends on auth (and company → auth), so auth calling payment directly
 * would make a cycle. Same trick as CompanyVerificationCheck (dependency inversion).
 */
public interface RecruiterSeatLimit {

    /** free tier = 1; with a plan (incl. grace days) = the plan's recruiter seats */
    int seatLimit(UUID companyId);
}
