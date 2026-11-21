package com.jobportal.kaamsathi.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Turns on @Scheduled methods (job / application / subscription schedulers).
 * How often: `app.scheduler.cron` in application.yml (hourly). Tests may pass a faster cron on the command line.
 * One app instance only (no ShedLock needed yet); every scheduled change is an atomic, repeat-safe UPDATE anyway.
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
