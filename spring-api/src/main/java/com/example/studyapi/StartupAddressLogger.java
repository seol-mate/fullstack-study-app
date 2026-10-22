package com.example.studyapi;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/** 애플리케이션 시작이 끝나면 API 주소와 Swagger 주소를 마지막에 한 번 기록합니다. */
@Component
public class StartupAddressLogger {

    private static final Logger logger = LoggerFactory.getLogger(StartupAddressLogger.class);

    private final Environment environment;

    /** 실제로 열린 포트와 설정값을 읽기 위해 환경 정보를 전달받습니다. */
    public StartupAddressLogger(Environment environment) {
        this.environment = environment;
    }

    /** 서버가 요청을 받을 준비가 되면 접속 주소를 로그로 남깁니다. */
    @EventListener(ApplicationReadyEvent.class)
    public void logAddresses() {
        // server.port=0처럼 임의 포트를 쓰는 경우를 위해 실제로 열린 포트(local.server.port)를 우선 사용한다.
        var port = environment.getProperty("local.server.port", environment.getProperty("server.port", "8080"));
        var contextPath = environment.getProperty("server.servlet.context-path", "");
        var baseUrl = "http://localhost:" + port + contextPath;
        var swaggerPath = environment.getProperty("springdoc.swagger-ui.path", "/swagger-ui.html");

        logger.info("""

                ----------------------------------------------------------
                Study API is running
                  API     : {}
                  Swagger : {}{}
                ----------------------------------------------------------""",
                baseUrl, baseUrl, swaggerPath);
    }
}
