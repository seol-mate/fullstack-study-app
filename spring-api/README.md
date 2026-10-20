# Study Record API

Spring Boot API for the study record form in the repository root. It stores the profile details and all three study-record steps together in one `study_records` row.

## Requirements

- JDK 25 (latest LTS)
- Maven 3.6.3 or newer
- The repository's local PostgreSQL container

## Run

From the repository root, start PostgreSQL:

```powershell
docker compose up -d db
```

Then run the API:

```powershell
cd spring-api
mvn spring-boot:run
```

The API listens on `http://localhost:8081` (8080 is used by the Jenkins container). Database and port settings are read from `spring-api/config.properties` (git-ignored); copy `config.properties.example` to create it. The API uses its own `study_api` database, separate from the Prisma tables in `my_app`, so create it once before the first run:

```powershell
docker exec my-app-db-1 psql -U postgres -c "CREATE DATABASE study_api;"
```

Flyway creates the `study_records` table; Hibernate validates the table mapping on startup. Without `config.properties`, the defaults fall back to `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`.

## Create a study record

`POST /api/study-records` accepts all form steps in one JSON request and returns `201 Created` with a `Location` header and the created record.

```json
{
  "name": "홍길동",
  "birthDate": "2000-01-01",
  "studyRecord": {
    "date": "2026-10-20",
    "content": "Spring MVC를 공부했다.",
    "learned": "Controller와 Service의 역할을 이해했다.",
    "nextStudy": "Spring Data JPA를 공부할 예정이다."
  }
}
```

The API allows browser requests from the local Next.js development origins `http://localhost:3000` and `http://127.0.0.1:3000`.

## Error handling

Invalid request fields and malformed JSON return `400 Bad Request` with a JSON body containing a `message` and a `details` array. Validation errors include the field names and validation reasons; malformed JSON returns a general explanation without exposing parser details.

Database access failures are logged and return `500 Internal Server Error` with a general message that does not expose database details. Other unexpected server-side errors are not converted into successful responses; Spring returns an error status and logs unhandled exceptions.

## Test

```powershell
mvn test
```
