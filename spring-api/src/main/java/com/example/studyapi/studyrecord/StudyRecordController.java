package com.example.studyapi.studyrecord;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

/** 학습 기록 API 요청을 받아 서비스에 전달합니다. */
@Tag(name = "Study Records", description = "학습 기록 생성, 조회, 수정, 삭제")
@RestController
@RequestMapping("/api/study-records")
@CrossOrigin(
        origins = {"http://localhost:3000", "http://127.0.0.1:3000"},
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE}
)
public class StudyRecordController {

    private final StudyRecordService studyRecordService;

    /** 학습 기록을 처리할 서비스를 전달받아 보관합니다. */
    public StudyRecordController(StudyRecordService studyRecordService) {
        this.studyRecordService = studyRecordService;
    }

    /** 학습 기록을 저장하고, 생성된 기록과 주소를 응답합니다. */
    @Operation(summary = "학습 기록 생성")
    @ApiResponse(responseCode = "201", description = "생성됨")
    @ApiResponse(responseCode = "400", description = "요청 값이 올바르지 않음")
    @PostMapping
    public ResponseEntity<StudyRecordResponse> create(
            @Valid @RequestBody CreateStudyRecordRequest request
    ) {
        var response = studyRecordService.create(request);
        return ResponseEntity
                .created(URI.create("/api/study-records/" + response.id()))
                .body(response);
    }

    /** 모든 학습 기록을 학습 날짜가 최근인 순서로 응답합니다. */
    @Operation(summary = "학습 기록 목록 조회", description = "학습 날짜가 최근인 순서로 반환합니다.")
    @GetMapping
    public List<StudyRecordResponse> list() {
        return studyRecordService.findAll();
    }

    /** id에 해당하는 학습 기록 한 건을 응답합니다. 없으면 404를 응답합니다. */
    @Operation(summary = "학습 기록 단건 조회")
    @ApiResponse(responseCode = "404", description = "학습 기록을 찾을 수 없음")
    @GetMapping("/{id}")
    public StudyRecordResponse get(@PathVariable Long id) {
        return studyRecordService.findById(id);
    }

    /** id에 해당하는 학습 기록의 내용을 요청 값으로 모두 바꿉니다. 없으면 404를 응답합니다. */
    @Operation(summary = "학습 기록 수정", description = "모든 필드를 보내 내용을 통째로 교체합니다.")
    @ApiResponse(responseCode = "400", description = "요청 값이 올바르지 않음")
    @ApiResponse(responseCode = "404", description = "학습 기록을 찾을 수 없음")
    @PutMapping("/{id}")
    public StudyRecordResponse update(
            @PathVariable Long id,
            @Valid @RequestBody CreateStudyRecordRequest request
    ) {
        return studyRecordService.update(id, request);
    }

    /** id에 해당하는 학습 기록을 삭제하고 204를 응답합니다. 없으면 404를 응답합니다. */
    @Operation(summary = "학습 기록 삭제")
    @ApiResponse(responseCode = "204", description = "삭제됨")
    @ApiResponse(responseCode = "404", description = "학습 기록을 찾을 수 없음")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studyRecordService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
