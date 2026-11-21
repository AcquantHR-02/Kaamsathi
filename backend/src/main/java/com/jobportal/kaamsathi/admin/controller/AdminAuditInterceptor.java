package com.jobportal.kaamsathi.admin.controller;

import com.jobportal.kaamsathi.admin.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Audit log for EVERY admin write, in one place (no audit code inside each service).
 * Records a row when ALL are true:
 *  - the controller (class or method) is ADMIN-only (@PreAuthorize mentions 'ADMIN'),
 *  - it is a write (not GET / HEAD / OPTIONS),
 *  - it succeeded (2xx) — failed attempts change nothing, so nothing to audit.
 * Runs after the reply is decided (afterCompletion), so it never slows or breaks the admin's action.
 * Request bodies are NOT stored (could hold passwords / personal data); method + path + target id say what happened.
 */
@Component
public class AdminAuditInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(AdminAuditInterceptor.class);
    private static final Set<String> READS = Set.of("GET", "HEAD", "OPTIONS");
    private static final Pattern UUID_IN_PATH =
            Pattern.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");

    private final AuditService auditService;

    public AdminAuditInterceptor(AuditService auditService) {
        this.auditService = auditService;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
                                Exception ex) {
        try {
            int status = response.getStatus();
            if (READS.contains(request.getMethod()) || status < 200 || status >= 300
                    || !(handler instanceof HandlerMethod hm) || !isAdminOnly(hm)) {
                return;
            }
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !(auth.getPrincipal() instanceof Jwt jwt)) {
                return;
            }
            String path = request.getRequestURI();
            auditService.record(UUID.fromString(jwt.getSubject()), request.getMethod(), path, firstId(path), status);
        } catch (RuntimeException e) {
            log.error("Audit log write failed", e);        // the admin action itself already succeeded
        }
    }

    // @PreAuthorize("hasRole('ADMIN')") on the controller class or the method
    private static boolean isAdminOnly(HandlerMethod hm) {
        PreAuthorize onMethod = AnnotatedElementUtils.findMergedAnnotation(hm.getMethod(), PreAuthorize.class);
        PreAuthorize onClass = AnnotatedElementUtils.findMergedAnnotation(hm.getBeanType(), PreAuthorize.class);
        return mentionsAdmin(onMethod) || mentionsAdmin(onClass);
    }

    private static boolean mentionsAdmin(PreAuthorize p) {
        return p != null && p.value().contains("'ADMIN'");
    }

    // "/api/companies/<uuid>/verify" → <uuid>; none → null
    private static UUID firstId(String path) {
        Matcher m = UUID_IN_PATH.matcher(path);
        return m.find() ? UUID.fromString(m.group()) : null;
    }
}
