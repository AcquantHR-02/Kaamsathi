package com.jobportal.kaamsathi.admin.service;

import com.jobportal.kaamsathi.auth.service.UserService;
import com.jobportal.kaamsathi.company.service.CompanyService;
import com.jobportal.kaamsathi.job.service.JobService;
import com.jobportal.kaamsathi.masterdata.service.CityService;
import com.jobportal.kaamsathi.masterdata.service.IndustryService;
import com.jobportal.kaamsathi.masterdata.service.JobCategoryService;
import com.jobportal.kaamsathi.masterdata.service.SkillService;
import com.jobportal.kaamsathi.payment.service.PaymentService;
import com.jobportal.kaamsathi.payment.service.PlanService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Human name of an audit target ("TechNova Labs", "ravi@gmail.com", "Senior Java Developer"),
 * asked from each module's service. Saved on the audit row as a snapshot.
 */
@Component
public class AuditTargetLabels {

    private final UserService userService;
    private final CompanyService companyService;
    private final JobService jobService;
    private final PaymentService paymentService;
    private final PlanService planService;
    private final SkillService skillService;
    private final CityService cityService;
    private final IndustryService industryService;
    private final JobCategoryService jobCategoryService;

    public AuditTargetLabels(UserService userService, CompanyService companyService, JobService jobService,
                             PaymentService paymentService, PlanService planService, SkillService skillService,
                             CityService cityService, IndustryService industryService,
                             JobCategoryService jobCategoryService) {
        this.userService = userService;
        this.companyService = companyService;
        this.jobService = jobService;
        this.paymentService = paymentService;
        this.planService = planService;
        this.skillService = skillService;
        this.cityService = cityService;
        this.industryService = industryService;
        this.jobCategoryService = jobCategoryService;
    }

    /** null when the type is unknown or the row doesn't exist (any more). */
    public String labelOf(String targetType, UUID id) {
        if (targetType == null || id == null) {
            return null;
        }
        List<UUID> ids = List.of(id);
        return switch (targetType) {
            case "USER" -> userService.emailsByIds(ids).get(id);
            case "COMPANY" -> companyService.namesByIds(ids).get(id);
            case "JOB" -> jobService.titlesByIds(ids).get(id);
            case "PAYMENT" -> paymentService.auditLabel(id);
            case "PLAN" -> planService.namesByIds(ids).get(id);
            case "SKILL" -> skillService.namesByIds(ids).get(id);
            case "CITY" -> cityService.labelsByIds(ids).get(id);
            case "INDUSTRY" -> industryService.namesByIds(ids).get(id);
            case "JOB_CATEGORY" -> jobCategoryService.namesByIds(ids).get(id);
            default -> null;
        };
    }
}
