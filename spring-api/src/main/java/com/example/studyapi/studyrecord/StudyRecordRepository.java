package com.example.studyapi.studyrecord;

import org.springframework.data.jpa.repository.JpaRepository;

/** 학습 기록을 데이터베이스에 저장하고 조회하는 기능을 제공합니다. */
public interface StudyRecordRepository extends JpaRepository<StudyRecordEntity, Long> {
}
