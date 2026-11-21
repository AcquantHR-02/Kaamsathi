package com.jobportal.kaamsathi.application.repository;

/**
 * One row of the daily score query (Spring Data "interface projection": only these 3 columns are read).
 */
public interface CompanyReplyStats {

    String getCompanyId();   // CHAR(36) in native SQL → String

    Long getBasis();         // applications counted

    Long getReplied();       // of those, answered within 4 days
}
