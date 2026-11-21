package com.jobportal.kaamsathi.admin.config;

import com.jobportal.kaamsathi.admin.controller.AdminAuditInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Plugs the audit interceptor into Spring MVC for every /api/** call (it filters admin writes itself). */
@Configuration
public class AdminAuditWebConfig implements WebMvcConfigurer {

    private final AdminAuditInterceptor auditInterceptor;

    public AdminAuditWebConfig(AdminAuditInterceptor auditInterceptor) {
        this.auditInterceptor = auditInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(auditInterceptor).addPathPatterns("/api/**");
    }
}
