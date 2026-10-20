package com.example.studyapi.studyrecord;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;

/** 학습 기록 한 건을 데이터베이스의 study_records 테이블과 연결합니다. */
@Entity
@Table(name = "study_records")
public class StudyRecordEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(nullable = false, length = 5000)
    private String content;

    @Column(nullable = false, length = 2000)
    private String learned;

    @Column(name = "next_study", nullable = false, length = 2000)
    private String nextStudy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected StudyRecordEntity() {
    }

    /** 새 학습 기록의 내용을 받아 엔티티를 만듭니다. */
    public StudyRecordEntity(
            String name,
            LocalDate birthDate,
            LocalDate recordDate,
            String content,
            String learned,
            String nextStudy,
            Instant createdAt
    ) {
        this.name = name;
        this.birthDate = birthDate;
        this.recordDate = recordDate;
        this.content = content;
        this.learned = learned;
        this.nextStudy = nextStudy;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public LocalDate getRecordDate() {
        return recordDate;
    }

    public String getContent() {
        return content;
    }

    public String getLearned() {
        return learned;
    }

    public String getNextStudy() {
        return nextStudy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
