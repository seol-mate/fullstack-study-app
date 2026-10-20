package com.example.studyapi.studyrecord;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;

/** 학습 기록 저장에 필요한 데이터 변환과 처리를 담당합니다. */
@Service
public class StudyRecordService {

    private final StudyRecordRepository studyRecordRepository;
    private final Clock clock;

    /** 실제 요청에서 사용할 저장소와 현재 시각 기준을 준비합니다. */
    @Autowired
    public StudyRecordService(StudyRecordRepository studyRecordRepository) {
        this(studyRecordRepository, Clock.systemUTC());
    }

    /** 테스트에서 시각을 고정할 수 있도록 저장소와 시각 기준을 받습니다. */
    StudyRecordService(StudyRecordRepository studyRecordRepository, Clock clock) {
        this.studyRecordRepository = studyRecordRepository;
        this.clock = clock;
    }

    /** 요청 내용을 데이터베이스에 저장하고 저장된 결과를 응답 형태로 바꿉니다. */
    @Transactional
    public StudyRecordResponse create(CreateStudyRecordRequest request) {
        var details = request.studyRecord();
        var entity = new StudyRecordEntity(
                request.name(),
                request.birthDate(),
                details.date(),
                details.content(),
                details.learned(),
                details.nextStudy(),
                Instant.now(clock)
        );

        var saved = studyRecordRepository.save(entity);
        return new StudyRecordResponse(
                saved.getId(),
                saved.getName(),
                saved.getBirthDate(),
                new StudyRecordResponse.StudyRecordDetails(
                        saved.getRecordDate(),
                        saved.getContent(),
                        saved.getLearned(),
                        saved.getNextStudy()
                ),
                saved.getCreatedAt()
        );
    }
}
