package com.jobportal.kaamsathi.application.scheduler;

import com.jobportal.kaamsathi.application.service.ResponseScoreService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Once a day (app.scheduler.score-cron, 02:30): recompute every employer's response score. */
@Component
public class ResponseScoreScheduler {

    private static final Logger log = LoggerFactory.getLogger(ResponseScoreScheduler.class);

    private final ResponseScoreService scoreService;

    public ResponseScoreScheduler(ResponseScoreService scoreService) {
        this.scoreService = scoreService;
    }

    @Scheduled(cron = "${app.scheduler.score-cron}")
    public void run() {
        int scored = scoreService.recomputeAll();
        log.info("Response score: {} companies have a score", scored);
    }
}
