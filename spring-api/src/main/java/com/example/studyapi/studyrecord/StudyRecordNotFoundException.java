package com.example.studyapi.studyrecord;

/** 요청한 id의 학습 기록이 없을 때 던지는 예외입니다. */
public class StudyRecordNotFoundException extends RuntimeException {

    /** 찾지 못한 기록의 id를 담아 예외를 만듭니다. */
    public StudyRecordNotFoundException(Long id) {
        super("Study record not found: " + id);
    }
}
