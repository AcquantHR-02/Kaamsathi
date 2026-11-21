package com.jobportal.kaamsathi.application.service;

import com.jobportal.kaamsathi.application.repository.ApplicationRepository;
import com.jobportal.kaamsathi.application.repository.CompanyReplyStats;
import com.jobportal.kaamsathi.company.dto.ResponseScore;
import com.jobportal.kaamsathi.company.service.CompanyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Daily employer response score (Reference §2): "Replies to X% of applicants within 4 days", last 90 days.
 * The application module COUNTS (it owns the data) and SAVES through CompanyService
 * (arrow application → company; company never reads applications).
 */
@Service
public class ResponseScoreService {

    static final Duration WINDOW = Duration.ofDays(90);
    static final Duration REPLY_WITHIN = Duration.ofDays(4);   // also: younger applications are not judged yet
    static final int MIN_APPLICATIONS = 10;                    // fewer → "New employer"

    private final ApplicationRepository applicationRepository;
    private final CompanyService companyService;
    private final Clock clock;

    public ResponseScoreService(ApplicationRepository applicationRepository, CompanyService companyService,
                                Clock clock) {
        this.applicationRepository = applicationRepository;
        this.companyService = companyService;
        this.clock = clock;
    }

    /** Recompute every company's score in one go. Returns how many companies got a real % (not "new"). */
    @Transactional
    public int recomputeAll() {
        Instant now = clock.instant();
        List<ResponseScore> scores = applicationRepository.replyStats(now.minus(WINDOW), now.minus(REPLY_WITHIN))
                .stream()
                .map(ResponseScoreService::toScore)
                .toList();
        companyService.saveResponseScores(scores);
        return (int) scores.stream().filter(s -> s.ratePercent() != null).count();
    }

    // basis < 10 → rate null ("New employer"), else rounded percent (8 of 11 → 73%)
    static ResponseScore toScore(CompanyReplyStats s) {
        int basis = s.getBasis().intValue();
        Integer rate = basis < MIN_APPLICATIONS ? null : (int) Math.round(s.getReplied() * 100.0 / basis);
        return new ResponseScore(UUID.fromString(s.getCompanyId()), rate, basis);
    }
}
