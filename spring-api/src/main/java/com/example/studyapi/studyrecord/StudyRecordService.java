package com.example.studyapi.studyrecord;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

/** 학습 기록의 저장, 조회, 수정, 삭제에 필요한 데이터 변환과 처리를 담당합니다. */
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

        return toResponse(studyRecordRepository.save(entity));
    }

    /** 모든 학습 기록을 학습 날짜가 최근인 순서로 조회합니다. */
    @Transactional(readOnly = true)
    public List<StudyRecordResponse> findAll() {
        return studyRecordRepository.findAllByOrderByRecordDateDescIdDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /** id로 학습 기록 한 건을 조회하고, 없으면 StudyRecordNotFoundException을 던집니다. */
    @Transactional(readOnly = true)
    public StudyRecordResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    /** id의 학습 기록 내용을 요청 값으로 모두 바꾸고, 없으면 StudyRecordNotFoundException을 던집니다. */
    @Transactional
    public StudyRecordResponse update(Long id, CreateStudyRecordRequest request) {
        var entity = getEntity(id);
        var details = request.studyRecord();
        entity.update(
                request.name(),
                request.birthDate(),
                details.date(),
                details.content(),
                details.learned(),
                details.nextStudy()
        );

        return toResponse(entity);
    }

    /** id의 학습 기록을 삭제하고, 없으면 StudyRecordNotFoundException을 던집니다. */
    @Transactional
    public void delete(Long id) {
        studyRecordRepository.delete(getEntity(id));
    }

    private StudyRecordEntity getEntity(Long id) {
        return studyRecordRepository.findById(id)
                .orElseThrow(() -> new StudyRecordNotFoundException(id));
    }

    private StudyRecordResponse toResponse(StudyRecordEntity entity) {
        return new StudyRecordResponse(
                entity.getId(),
                entity.getName(),
                entity.getBirthDate(),
                new StudyRecordResponse.StudyRecordDetails(
                        entity.getRecordDate(),
                        entity.getContent(),
                        entity.getLearned(),
                        entity.getNextStudy()
                ),
                entity.getCreatedAt()
        );
    }
}
