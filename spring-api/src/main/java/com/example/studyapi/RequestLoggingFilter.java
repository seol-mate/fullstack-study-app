package com.example.studyapi;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/** 요청이 끝날 때마다 HTTP 메서드, 경로, 응답 상태, 처리 시간을 한 줄로 기록합니다. */
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    /** 개인정보가 담길 수 있는 요청 본문은 기록하지 않고, 요청 정보와 결과만 남깁니다. */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        var startedAt = System.nanoTime();
        try {
            filterChain.doFilter(request, response);
        } finally {
            var elapsedMillis = (System.nanoTime() - startedAt) / 1_000_000;
            logger.info("{} {} -> {} ({} ms)", request.getMethod(), requestPath(request), response.getStatus(), elapsedMillis);
        }
    }

    /** Swagger UI가 정적 파일을 불러오는 요청은 로그가 너무 많아지므로 제외합니다. */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        var path = request.getRequestURI();
        return path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs");
    }

    private String requestPath(HttpServletRequest request) {
        var query = request.getQueryString();
        return query == null ? request.getRequestURI() : request.getRequestURI() + "?" + query;
    }
}
