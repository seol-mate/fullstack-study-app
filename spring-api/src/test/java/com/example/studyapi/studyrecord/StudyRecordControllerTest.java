package com.example.studyapi.studyrecord;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StudyRecordController.class)
class StudyRecordControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StudyRecordService studyRecordService;

    @Test
    void createsStudyRecordFromOneRequest() throws Exception {
        when(studyRecordService.create(any(CreateStudyRecordRequest.class)))
                .thenReturn(new StudyRecordResponse(
                        42L,
                        "홍길동",
                        LocalDate.parse("2000-01-01"),
                        new StudyRecordResponse.StudyRecordDetails(
                                LocalDate.parse("2026-10-20"),
                                "Spring MVC를 공부했다.",
                                "요청이 Controller를 거쳐 Service로 전달되는 흐름을 이해했다.",
                                "Spring Data JPA를 공부할 예정이다."
                        ),
                        Instant.parse("2026-10-20T01:00:00Z")
                ));

        mockMvc.perform(post("/api/study-records")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "홍길동",
                                  "birthDate": "2000-01-01",
                                  "studyRecord": {
                                    "date": "2026-10-20",
                                    "content": "Spring MVC를 공부했다.",
                                    "learned": "요청이 Controller를 거쳐 Service로 전달되는 흐름을 이해했다.",
                                    "nextStudy": "Spring Data JPA를 공부할 예정이다."
                                  }
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/study-records/42"))
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.name").value("홍길동"))
                .andExpect(jsonPath("$.studyRecord.date").value("2026-10-20"))
                .andExpect(jsonPath("$.studyRecord.content").value("Spring MVC를 공부했다."));

        verify(studyRecordService).create(any(CreateStudyRecordRequest.class));
    }

    @Test
    void rejectsRequestWithMissingRequiredValues() throws Exception {
        mockMvc.perform(post("/api/study-records")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "",
                                  "studyRecord": {
                                    "content": ""
                                  }
                                }
                                """))
                .andExpect(status().isBadRequest());

        verify(studyRecordService, never()).create(any(CreateStudyRecordRequest.class));
    }

    @Test
    void returnsErrorDetailsForInvalidRequest() throws Exception {
        mockMvc.perform(post("/api/study-records")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "",
                                  "birthDate": null,
                                  "studyRecord": null
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("요청 값이 올바르지 않습니다."))
                .andExpect(jsonPath("$.details").isArray());

        verify(studyRecordService, never()).create(any(CreateStudyRecordRequest.class));
    }

    @Test
    void returnsErrorForMalformedJson() throws Exception {
        mockMvc.perform(post("/api/study-records")
                        .contentType(APPLICATION_JSON)
                        .content("{ invalid json }"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("요청 본문이 올바른 JSON 형식이 아닙니다."))
                .andExpect(jsonPath("$.details").isEmpty());

        verify(studyRecordService, never()).create(any(CreateStudyRecordRequest.class));
    }

    @Test
    void returnsServerErrorWhenDatabaseAccessFails() throws Exception {
        doThrow(new DataAccessResourceFailureException("Database unavailable"))
                .when(studyRecordService).create(any(CreateStudyRecordRequest.class));

        mockMvc.perform(post("/api/study-records")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "홍길동",
                                  "birthDate": "2000-01-01",
                                  "studyRecord": {
                                    "date": "2026-10-20",
                                    "content": "공부했다.",
                                    "learned": "배웠다.",
                                    "nextStudy": "계속 공부한다."
                                  }
                                }
                                """))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message")
                        .value("학습 기록을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."))
                .andExpect(jsonPath("$.details").isEmpty());
    }

    private static final String VALID_BODY = """
            {
              "name": "홍길동",
              "birthDate": "2000-01-01",
              "studyRecord": {
                "date": "2026-10-20",
                "content": "공부했다.",
                "learned": "배웠다.",
                "nextStudy": "계속 공부한다."
              }
            }
            """;

    private static StudyRecordResponse sampleResponse(long id) {
        return new StudyRecordResponse(
                id,
                "홍길동",
                LocalDate.parse("2000-01-01"),
                new StudyRecordResponse.StudyRecordDetails(
                        LocalDate.parse("2026-10-20"),
                        "공부했다.",
                        "배웠다.",
                        "계속 공부한다."
                ),
                Instant.parse("2026-10-20T01:00:00Z")
        );
    }

    @Test
    void listsStudyRecords() throws Exception {
        when(studyRecordService.findAll()).thenReturn(List.of(sampleResponse(2L), sampleResponse(1L)));

        mockMvc.perform(get("/api/study-records"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(2))
                .andExpect(jsonPath("$[1].id").value(1));
    }

    @Test
    void getsStudyRecordById() throws Exception {
        when(studyRecordService.findById(7L)).thenReturn(sampleResponse(7L));

        mockMvc.perform(get("/api/study-records/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.studyRecord.content").value("공부했다."));
    }

    @Test
    void returnsNotFoundWhenStudyRecordDoesNotExist() throws Exception {
        when(studyRecordService.findById(99L)).thenThrow(new StudyRecordNotFoundException(99L));

        mockMvc.perform(get("/api/study-records/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("학습 기록을 찾을 수 없습니다."))
                .andExpect(jsonPath("$.details").isEmpty());
    }

    @Test
    void rejectsNonNumericId() throws Exception {
        mockMvc.perform(get("/api/study-records/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("요청 값이 올바르지 않습니다."));
    }

    @Test
    void updatesStudyRecord() throws Exception {
        when(studyRecordService.update(eq(7L), any(CreateStudyRecordRequest.class)))
                .thenReturn(sampleResponse(7L));

        mockMvc.perform(put("/api/study-records/7")
                        .contentType(APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7));

        verify(studyRecordService).update(eq(7L), any(CreateStudyRecordRequest.class));
    }

    @Test
    void rejectsInvalidUpdateRequest() throws Exception {
        mockMvc.perform(put("/api/study-records/7")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                { "name": "", "birthDate": null, "studyRecord": null }
                                """))
                .andExpect(status().isBadRequest());

        verify(studyRecordService, never()).update(any(), any());
    }

    @Test
    void returnsNotFoundWhenUpdatingMissingRecord() throws Exception {
        when(studyRecordService.update(eq(99L), any(CreateStudyRecordRequest.class)))
                .thenThrow(new StudyRecordNotFoundException(99L));

        mockMvc.perform(put("/api/study-records/99")
                        .contentType(APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isNotFound());
    }

    @Test
    void deletesStudyRecord() throws Exception {
        mockMvc.perform(delete("/api/study-records/7"))
                .andExpect(status().isNoContent());

        verify(studyRecordService).delete(7L);
    }

    @Test
    void returnsNotFoundWhenDeletingMissingRecord() throws Exception {
        doThrow(new StudyRecordNotFoundException(99L)).when(studyRecordService).delete(99L);

        mockMvc.perform(delete("/api/study-records/99"))
                .andExpect(status().isNotFound());
    }
}
