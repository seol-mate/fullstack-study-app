package com.example.studyapi.studyrecord;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** 클라이언트가 학습 기록을 만들 때 보내는 요청 데이터입니다. */
public record CreateStudyRecordRequest(
        @NotBlank
        @Size(max = 50)
        String name,

        @NotNull
        LocalDate birthDate,

        @NotNull
        @Valid
        StudyRecordDetails studyRecord
) {
    /** 학습 기록의 날짜와 세 단계 내용을 묶습니다. */
    public record StudyRecordDetails(
            @NotNull
            LocalDate date,

            @NotBlank
            @Size(max = 5000)
            String content,

            @NotBlank
            @Size(max = 2000)
            String learned,

            @NotBlank
            @Size(max = 2000)
            String nextStudy
    ) {
    }
}
