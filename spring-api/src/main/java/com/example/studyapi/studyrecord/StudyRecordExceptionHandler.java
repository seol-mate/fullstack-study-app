package com.example.studyapi.studyrecord;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

/** 학습 기록 API에서 발생한 잘못된 요청을 일관된 오류 응답으로 바꿉니다. */
@RestControllerAdvice
public class StudyRecordExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(StudyRecordExceptionHandler.class);

    /** 요청 필드 검증에 실패하면 잘못된 필드와 이유를 400 응답으로 전달합니다. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationError(
            MethodArgumentNotValidException exception
    ) {
        var details = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiErrorResponse("요청 값이 올바르지 않습니다.", details));
    }

    /** JSON 형식이 잘못되었거나 필드 값을 변환할 수 없으면 400 응답을 전달합니다. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableRequest() {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiErrorResponse(
                        "요청 본문이 올바른 JSON 형식이 아닙니다.",
                        List.of()
                ));
    }

    /** 데이터베이스 처리 실패를 기록하고 내부 정보를 제외한 500 응답을 전달합니다. */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiErrorResponse> handleDatabaseError(DataAccessException exception) {
        logger.error("Failed to access the study record database.", exception);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiErrorResponse(
                        "학습 기록을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
                        List.of()
                ));
    }
}
