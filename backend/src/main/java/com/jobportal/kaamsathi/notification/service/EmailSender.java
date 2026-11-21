package com.jobportal.kaamsathi.notification.service;

/**
 * Sends one email. Code depends on this interface only.
 * Today: LogEmailSender (prints to the console). Later: an SMTP implementation, no other code changes.
 */
public interface EmailSender {

    void send(String to, String subject, String text);
}
