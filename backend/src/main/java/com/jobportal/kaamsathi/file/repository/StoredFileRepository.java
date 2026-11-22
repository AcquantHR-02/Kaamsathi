package com.jobportal.kaamsathi.file.repository;

import com.jobportal.kaamsathi.file.entity.FileKind;
import com.jobportal.kaamsathi.file.entity.StoredFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * DB access for `files`. Only the file module uses this; other modules call FileService.
 */
public interface StoredFileRepository extends JpaRepository<StoredFile, UUID> {

    // admin user detail: e.g. resumes uploaded (old versions count too)
    long countByOwnerIdAndKind(UUID ownerId, FileKind kind);
}
