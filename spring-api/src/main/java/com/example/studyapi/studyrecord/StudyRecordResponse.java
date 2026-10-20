package com.example.studyapi.studyrecord;

import java.time.Instant;
import java.time.LocalDate;

/** 학습 기록 저장 후 클라이언트에 돌려주는 응답 데이터입니다. */
public record StudyRecordResponse(
        Long id,
        String name,
        LocalDate birthDate,
        StudyRecordDetails studyRecord,
        Instant createdAt
) {
    /** 응답에 포함할 학습 날짜와 세 단계 내용을 묶습니다. */
    public record StudyRecordDetails(
            LocalDate date,
            String content,
            String learned,
            String nextStudy
    ) {
    }
}
