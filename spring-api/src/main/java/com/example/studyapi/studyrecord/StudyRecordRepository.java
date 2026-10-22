package com.example.studyapi.studyrecord;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** 학습 기록을 데이터베이스에 저장하고 조회하는 기능을 제공합니다. */
public interface StudyRecordRepository extends JpaRepository<StudyRecordEntity, Long> {

    /** 학습 날짜가 최근인 순서로, 같은 날짜면 나중에 만든 기록이 먼저 오도록 전체를 조회합니다. */
    List<StudyRecordEntity> findAllByOrderByRecordDateDescIdDesc();
}
