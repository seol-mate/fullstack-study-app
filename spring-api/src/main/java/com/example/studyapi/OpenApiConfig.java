package com.example.studyapi;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Swagger UI와 OpenAPI 문서에 표시할 API 기본 정보를 설정합니다. */
@Configuration
public class OpenApiConfig {

    /** 문서 상단에 보여줄 API 이름, 설명, 버전을 정합니다. */
    @Bean
    public OpenAPI studyApiOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Study Record API")
                .description("학습 기록을 만들고 조회, 수정, 삭제하는 API입니다.")
                .version("0.1.0"));
    }
}
