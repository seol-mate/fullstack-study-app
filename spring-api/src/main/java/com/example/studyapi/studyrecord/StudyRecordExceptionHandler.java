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
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

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

    /** 요청한 id의 학습 기록이 없으면 404 응답을 전달합니다. */
    @ExceptionHandler(StudyRecordNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound() {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ApiErrorResponse("학습 기록을 찾을 수 없습니다.", List.of()));
    }

    /** 경로의 id가 숫자가 아니면 400 응답을 전달합니다. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidPathValue(
            MethodArgumentTypeMismatchException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiErrorResponse(
                        "요청 값이 올바르지 않습니다.",
                        List.of(exception.getName() + ": 올바른 값이 아닙니다")
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
