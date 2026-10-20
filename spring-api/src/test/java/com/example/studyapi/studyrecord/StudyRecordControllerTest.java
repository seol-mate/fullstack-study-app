package com.example.studyapi.studyrecord;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
}
