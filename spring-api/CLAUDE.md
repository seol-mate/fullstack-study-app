# spring-api

학습 기록 REST API. Spring Boot 3.5 + Java 25 + Maven + Postgres(Flyway, JPA). Next.js 프런트와는 별개 프로젝트다.

## 명령어 (이 디렉터리에서 실행)

- `mvn spring-boot:run` — 서버 실행 (http://localhost:8081)
- `mvn test` — 테스트
- Swagger UI: http://localhost:8081/swagger-ui.html, 명세: `/v3/api-docs`

JDK 25와 Maven이 PATH에 있어야 한다. `JAVA_HOME`이 다른 JDK(예: Android Studio의 21)를 가리키면 빌드가 실패한다.

## 설정

- DB·포트는 `config.properties`에 둔다 (git 제외, 예시는 `config.properties.example`). `application.properties`가 `spring.config.import`로 불러오며, `spring-api/`에서 실행하든 저장소 루트에서 실행하든 읽는다.
- 포트는 **8081**이다. 8080은 Jenkins 컨테이너가 쓴다.
- DB는 Prisma가 쓰는 `my_app`이 아니라 **`study_api`** 를 쓴다. `public` 스키마에 Prisma 테이블이 있으면 Flyway가 "non-empty schema"로 실패하므로 섞지 않는다. DB가 없으면 `docker exec my-app-db-1 psql -U postgres -c "CREATE DATABASE study_api;"`.
- 스키마 변경은 `src/main/resources/db/migration/V{n}__*.sql`로만 한다. 이미 적용된 마이그레이션 파일은 수정하지 않고 새 버전을 추가한다. `ddl-auto=validate`라 엔티티와 테이블이 어긋나면 시작에 실패한다.

## 구조

- `studyrecord/` — 기능 패키지: Controller → Service → Repository(JPA), Entity, 요청/응답 record, 예외 핸들러
- `RequestLoggingFilter` — 요청마다 `메서드 경로 -> 상태 (ms)` 한 줄 로그
- `StartupAddressLogger` — 시작 후 API/Swagger 주소 로그
- `OpenApiConfig` — Swagger 문서 정보

## 규칙

- 클래스·public 메서드에는 한국어 Javadoc(`/** ... */`)을 한 줄로 단다. 기존 코드 스타일을 따른다.
- 생성자가 둘 이상이면 Spring이 쓸 생성자에 `@Autowired`를 붙인다. 안 붙이면 "No default constructor found"로 시작에 실패한다.
- 요청/응답은 Entity를 직접 노출하지 않고 record(`*Request`, `*Response`)로 주고받는다. 입력 검증은 Bean Validation 어노테이션으로 한다.
- 오류는 `StudyRecordExceptionHandler`에서 `ApiErrorResponse(message, details)` 형태로 통일한다. 없는 리소스는 `StudyRecordNotFoundException` → 404. DB 오류 응답에 내부 정보를 싣지 않는다.
- 이름·생년월일 등 개인정보가 있으므로 요청 본문을 로그에 남기지 않는다.
- CORS는 컨트롤러의 `@CrossOrigin`에 허용 출처와 **메서드를 명시**한다. 메서드를 생략하면 GET/HEAD/POST만 허용되어 PUT/DELETE가 막힌다.
- API를 추가하거나 바꾸면 컨트롤러 테스트(`@WebMvcTest`)를 함께 추가하고, 엔드포인트에는 `@Operation`/`@ApiResponse`로 Swagger 설명을 단다.
- 현재 API에는 인증이 없다. 운영 배포 전에 인증과 Swagger 노출 여부(`springdoc.swagger-ui.enabled`)를 정리해야 한다.
