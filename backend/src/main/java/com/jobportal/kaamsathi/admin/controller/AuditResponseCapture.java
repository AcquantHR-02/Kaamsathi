package com.jobportal.kaamsathi.admin.controller;

import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

/**
 * Remembers the reply object of every write request, so the audit interceptor can read the NEW item's id
 * after a create (POST /api/masterdata/skills has no id in the path). Only the object reference is kept
 * on the request; nothing is changed or stored here.
 */
@RestControllerAdvice
public class AuditResponseCapture implements ResponseBodyAdvice<Object> {

    public static final String BODY_ATTRIBUTE = AuditResponseCapture.class.getName() + ".body";

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType contentType,
                                  Class<? extends HttpMessageConverter<?>> converterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        if (body != null && request instanceof ServletServerHttpRequest servlet
                && !"GET".equals(servlet.getServletRequest().getMethod())) {
            servlet.getServletRequest().setAttribute(BODY_ATTRIBUTE, body);
        }
        return body;
    }
}
