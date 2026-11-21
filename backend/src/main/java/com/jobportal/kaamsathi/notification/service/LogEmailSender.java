package com.jobportal.kaamsathi.notification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * DEV email: writes the email to the console (same style as the OTP / reset logs).
 */
@Component
public class LogEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(LogEmailSender.class);

    @Override
    public void send(String to, String subject, String text) {
        log.info("EMAIL (dev) to {}: [{}] {}", to, subject, text);
    }
}
