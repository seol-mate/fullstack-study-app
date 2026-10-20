package com.example.studyapi.studyrecord;

import java.util.List;

/** API 오류를 클라이언트에 전달하는 응답 데이터입니다. */
public record ApiErrorResponse(String message, List<String> details) {
}
