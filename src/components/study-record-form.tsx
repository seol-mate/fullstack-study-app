"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";

import { postStepAtom, profileStepAtom, reflectionStepAtom } from "@/atoms/study-record";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const steps = ["기본 정보", "게시물", "학습 회고"];

type CreateStudyRecordRequest = {
  name: string;
  birthDate: string;
  studyRecord: {
    date: string;
    content: string;
    learned: string;
    nextStudy: string;
  };
};

type CreateStudyRecordResponse = {
  id: number;
};

async function saveStudyRecord(request: CreateStudyRecordRequest): Promise<CreateStudyRecordResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_STUDY_API_URL ?? "http://localhost:8081";
  let response: Response;

  try {
    response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/study-records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error("서버에 연결할 수 없습니다. API 서버가 실행 중인지 확인해 주세요.");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(`저장에 실패했습니다. (HTTP ${response.status})`);
    }
    throw new Error("서버 응답을 읽을 수 없습니다.");
  }

  if (!response.ok) {
    let errorMessage = `저장에 실패했습니다. (HTTP ${response.status})`;
    if (typeof body === "object" && body !== null && "message" in body && typeof body.message === "string") {
      errorMessage = body.message;
    }
    throw new Error(errorMessage);
  }

  if (typeof body !== "object" || body === null || !("id" in body) || typeof body.id !== "number") {
    throw new Error("서버 응답 형식이 올바르지 않습니다.");
  }

  return { id: body.id };
}

function getStepClassName(step: number, index: number) {
  if (step === index) {
    return "border-primary bg-primary text-primary-foreground";
  }

  if (index < step) {
    return "border-primary/30 bg-primary/5";
  }

  return "text-muted-foreground";
}

export function StudyRecordForm() {
  const [profile, setProfile] = useAtom(profileStepAtom);
  const [post, setPost] = useAtom(postStepAtom);
  const [reflection, setReflection] = useAtom(reflectionStepAtom);
  const [step, setStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const saveMutation = useMutation({
    mutationFn: saveStudyRecord,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step < steps.length - 1) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    setIsComplete(true);
  }

  function startOver() {
    saveMutation.reset();
    setProfile({ name: "", birthDate: "" });
    setPost({ content: "", date: "" });
    setReflection({ learned: "", nextStudy: "" });
    setStep(0);
    setIsComplete(false);
  }

  if (isComplete) {
    return (
      <main className="mx-auto w-full max-w-2xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>입력 흐름을 마쳤어요</CardTitle>
            <CardDescription>내용을 확인한 뒤 저장 버튼을 눌러 서버에 보관하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <SummaryItem label="이름" value={profile.name} />
            <SummaryItem label="생년월일" value={profile.birthDate} />
            <SummaryItem label="게시물 날짜" value={post.date} />
            <SummaryItem label="게시물 내용" value={post.content} />
            <SummaryItem label="오늘 배운 점" value={reflection.learned} />
            <SummaryItem label="다음에 공부할 내용" value={reflection.nextStudy} />
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={saveMutation.isPending || saveMutation.isSuccess}
                onClick={() =>
                  saveMutation.mutate({
                    name: profile.name,
                    birthDate: profile.birthDate,
                    studyRecord: {
                      date: post.date,
                      content: post.content,
                      learned: reflection.learned,
                      nextStudy: reflection.nextStudy,
                    },
                  })
                }
              >
                {saveMutation.isPending ? "저장 중..." : saveMutation.isSuccess ? "저장 완료" : "저장하기"}
              </Button>
              <Button type="button" variant="outline" onClick={startOver}>
                새로 작성하기
              </Button>
            </div>
            {saveMutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>저장하지 못했어요</AlertTitle>
                <AlertDescription>{saveMutation.error.message}</AlertDescription>
              </Alert>
            )}
            {saveMutation.isSuccess && (
              <Alert>
                <AlertTitle>저장했어요</AlertTitle>
                <AlertDescription>학습 기록을 서버에 저장했습니다. (기록 번호: {saveMutation.data.id})</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          이어쓰기 · {step + 1} / {steps.length}
        </p>
        <h1 className="text-2xl font-semibold">학습 기록 작성</h1>
        <p className="text-sm text-muted-foreground">단계를 이동해도 입력한 내용은 유지됩니다.</p>
      </header>

      <ol aria-label="작성 단계" className="grid grid-cols-3 gap-2 text-center text-sm">
        {steps.map((label, index) => (
          <li
            key={label}
            aria-current={step === index ? "step" : undefined}
            className={`rounded-lg border px-2 py-3 ${getStepClassName(step, index)}`}
          >
            <span className="mr-1">{index + 1}.</span>
            {label}
          </li>
        ))}
      </ol>

      <Card>
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
          <CardDescription>
            {step === 0 && "기록을 작성할 사람의 정보를 입력해 주세요."}
            {step === 1 && "게시물의 날짜와 내용을 입력해 주세요."}
            {step === 2 && "이번에 배운 점과 다음에 이어갈 내용을 정리해 주세요."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={50}
                    value={profile.name}
                    onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                    placeholder="이름을 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">생년월일</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    autoComplete="bday"
                    required
                    value={profile.birthDate}
                    onChange={(event) => setProfile({ ...profile, birthDate: event.target.value })}
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="postDate">게시물 날짜</Label>
                  <Input
                    id="postDate"
                    name="postDate"
                    type="date"
                    required
                    value={post.date}
                    onChange={(event) => setPost({ ...post, date: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postContent">게시물 내용</Label>
                  <textarea
                    id="postContent"
                    name="postContent"
                    required
                    maxLength={5000}
                    rows={6}
                    value={post.content}
                    onChange={(event) => setPost({ ...post, content: event.target.value })}
                    placeholder="오늘의 학습 내용을 적어보세요"
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="learned">오늘 배운 점</Label>
                  <textarea
                    id="learned"
                    name="learned"
                    required
                    maxLength={2000}
                    rows={4}
                    value={reflection.learned}
                    onChange={(event) =>
                      setReflection({
                        ...reflection,
                        learned: event.target.value,
                      })
                    }
                    placeholder="새롭게 알게 된 점이나 이해한 내용을 적어보세요"
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextStudy">다음에 공부할 내용</Label>
                  <textarea
                    id="nextStudy"
                    name="nextStudy"
                    required
                    maxLength={2000}
                    rows={4}
                    value={reflection.nextStudy}
                    onChange={(event) =>
                      setReflection({
                        ...reflection,
                        nextStudy: event.target.value,
                      })
                    }
                    placeholder="다음 학습에서 이어서 다룰 내용을 적어보세요"
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                  />
                </div>
              </>
            )}

            <div className="flex justify-between gap-3 pt-2">
              <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((currentStep) => currentStep - 1)}>
                이전
              </Button>
              <Button type="submit">{step === steps.length - 1 ? "입력 완료" : "다음"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
      <p className="break-words whitespace-pre-wrap">{value}</p>
    </div>
  );
}
