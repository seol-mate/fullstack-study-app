package com.example.studyapi.studyrecord;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

/** 학습 기록 API 요청을 받아 서비스에 전달합니다. */
@RestController
@RequestMapping("/api/study-records")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class StudyRecordController {

    private final StudyRecordService studyRecordService;

    /** 학습 기록을 처리할 서비스를 전달받아 보관합니다. */
    public StudyRecordController(StudyRecordService studyRecordService) {
        this.studyRecordService = studyRecordService;
    }

    /** 학습 기록을 저장하고, 생성된 기록과 주소를 응답합니다. */
    @PostMapping
    public ResponseEntity<StudyRecordResponse> create(
            @Valid @RequestBody CreateStudyRecordRequest request
    ) {
        var response = studyRecordService.create(request);
        return ResponseEntity
                .created(URI.create("/api/study-records/" + response.id()))
                .body(response);
    }
}
