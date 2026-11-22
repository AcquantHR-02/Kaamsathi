package com.jobportal.kaamsathi.auth.service;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;

/**
 * Company names for auth screens (admin users list, invite preview), without depending on the company module.
 * Auth OWNS this interface; CompanyService IMPLEMENTS it (same idea as CompanyVerificationCheck).
 */
public interface CompanyNameLookup {

    /** id → name for the companies that exist; unknown ids are simply missing from the map */
    Map<UUID, String> namesByIds(Collection<UUID> ids);
}
