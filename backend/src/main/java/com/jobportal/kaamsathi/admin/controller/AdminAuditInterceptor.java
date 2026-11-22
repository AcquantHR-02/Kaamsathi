package com.jobportal.kaamsathi.admin.controller;

import java.lang.reflect.RecordComponent;
import com.jobportal.kaamsathi.admin.service.AuditTargetLabels;
import com.jobportal.kaamsathi.admin.service.AuditActions;
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
 *
 * WHAT, in words (V24): action + targetType come from AuditActions (fixed list of admin endpoints);
 * targetLabel is the target's name at that moment. For DELETE it is read BEFORE the action (preHandle),
 * because afterwards the row is gone; for everything else AFTER (a rename shows the new name).
 * Create endpoints have no id in the path → the new id is taken from the reply (AuditResponseCapture).
 */
@Component
public class AdminAuditInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(AdminAuditInterceptor.class);
    private static final Set<String> READS = Set.of("GET", "HEAD", "OPTIONS");
    private static final Pattern UUID_IN_PATH =
            Pattern.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");

    private static final String LABEL_BEFORE = AdminAuditInterceptor.class.getName() + ".labelBefore";

    private final AuditService auditService;
    private final AuditTargetLabels labels;

    public AdminAuditInterceptor(AuditService auditService, AuditTargetLabels labels) {
        this.auditService = auditService;
        this.labels = labels;
    }

    // DELETE only: remember the name while the row still exists
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        try {
            if ("DELETE".equals(request.getMethod()) && handler instanceof HandlerMethod hm && isAdminOnly(hm)) {
                String path = request.getRequestURI();
                AuditActions.find(request.getMethod(), path).ifPresent(a -> {
                    String label = labels.labelOf(a.targetType(), firstId(path));
                    if (label != null) {
                        request.setAttribute(LABEL_BEFORE, label);
                    }
                });
            }
        } catch (RuntimeException e) {
            log.warn("Audit label lookup failed", e);       // never blocks the admin's action
        }
        return true;
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
            String method = request.getMethod();
            UUID targetId = firstId(path);
            if (targetId == null) {
                targetId = idOf(request.getAttribute(AuditResponseCapture.BODY_ATTRIBUTE));   // create → new id
            }
            AuditActions.AuditAction action = AuditActions.find(method, path).orElse(null);
            String label = (String) request.getAttribute(LABEL_BEFORE);
            if (label == null && action != null) {
                label = safeLabel(action.targetType(), targetId);
            }
            auditService.record(UUID.fromString(jwt.getSubject()), method, path, targetId, status,
                    action == null ? null : action.action(), action == null ? null : action.targetType(), label);
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

    private String safeLabel(String targetType, UUID id) {
        try {
            return labels.labelOf(targetType, id);
        } catch (RuntimeException e) {
            log.warn("Audit label lookup failed", e);
            return null;
        }
    }

    // reply record with a UUID "id" component (SkillResponse, PlanResponse, UserResponse …) → that id
    private static UUID idOf(Object body) {
        if (body == null || !body.getClass().isRecord()) {
            return null;
        }
        for (RecordComponent c : body.getClass().getRecordComponents()) {
            if (c.getName().equals("id") && c.getType() == UUID.class) {
                try {
                    return (UUID) c.getAccessor().invoke(body);
                } catch (ReflectiveOperationException e) {
                    return null;
                }
            }
        }
        return null;
    }

    // "/api/companies/<uuid>/verify" → <uuid>; none → null
    private static UUID firstId(String path) {
        Matcher m = UUID_IN_PATH.matcher(path);
        return m.find() ? UUID.fromString(m.group()) : null;
    }
}
