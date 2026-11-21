package com.jobportal.kaamsathi.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Duration;
import java.util.List;

/**
 * CORS = the browser asks "may a page from http://localhost:3000 call this API on :8080?".
 * Without this answer the browser blocks every frontend call (Postman/curl don't care, browsers do).
 * Spring Security picks this bean up via .cors(withDefaults()) in SecurityConfig, so the
 * browser's OPTIONS "preflight" request is answered BEFORE the token check.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource(@Value("${app.frontend-url}") String frontendUrl) {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(List.of(frontendUrl));                       // only OUR website, never "*"
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        // headers the frontend JavaScript may READ from our replies (browsers hide others)
        cors.setExposedHeaders(List.of("Content-Disposition", "WWW-Authenticate",
                "X-Dev-Verify-Token", "X-Dev-Reset-Token", "X-Dev-Invite-Token"));
        cors.setAllowCredentials(false);                                    // Bearer token in a header, no cookies
        cors.setMaxAge(Duration.ofHours(1));                                // browser caches the preflight answer

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", cors);
        return source;
    }
}
