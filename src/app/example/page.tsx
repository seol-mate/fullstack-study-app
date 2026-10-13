"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";

import { selectedPostIdAtom } from "@/atoms/posts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Post = {
  id: number;
  title: string;
  body: string;
};

const PAGE_SIZE = 10;
const MAX_PAGES = 100;

// 한 번의 요청에 PAGE_SIZE개씩 가져온다. page는 1부터 시작한다.
async function fetchPosts(page: number): Promise<Post[]> {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${PAGE_SIZE}`,
  );
  if (!res.ok) throw new Error(`요청 실패: ${res.status}`);
  return res.json();
}

export default function ExamplePage() {
  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: 1,
    // 마지막 페이지가 PAGE_SIZE보다 적거나 MAX_PAGES에 도달하면 더 가져오지 않는다.
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length < PAGE_SIZE || lastPageParam >= MAX_PAGES
        ? undefined
        : lastPageParam + 1,
  });

  const [selectedId, setSelectedId] = useAtom(selectedPostIdAtom);

  // 목록 맨 아래의 sentinel이 화면에 들어오면 다음 페이지를 가져온다.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    // 다음 페이지 조회가 실패했다면 자동 재시도로 요청이 반복되지 않도록 멈춘다.
    if (!sentinel || !hasNextPage || isFetchingNextPage || isFetchNextPageError) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  const posts = data?.pages.flat() ?? [];

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">useInfiniteQuery 예제</h1>
        <Button
          onClick={() => refetch()}
          disabled={isFetching && !isFetchingNextPage}
        >
          {isFetching && !isFetchingNextPage ? "불러오는 중..." : "새로고침"}
        </Button>
      </div>

      {isPending && (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>에러</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {data && (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id}>
              <Card
                onClick={() => setSelectedId(post.id)}
                className={cn(
                  "cursor-pointer transition-shadow",
                  selectedId === post.id && "ring-2 ring-primary",
                )}
              >
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>게시글 #{post.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{post.body}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {data && (
        <div ref={sentinelRef} className="space-y-4 pb-6">
          {isFetchingNextPage && <Skeleton className="h-28 w-full" />}
          {isFetchNextPageError && (
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <span>다음 게시글을 불러오지 못했습니다.</span>
              <Button variant="outline" size="sm" onClick={() => fetchNextPage()}>
                다시 시도
              </Button>
            </div>
          )}
          {!hasNextPage && (
            <p className="text-center text-sm text-muted-foreground">
              마지막 게시글입니다. (총 {posts.length}개)
            </p>
          )}
        </div>
      )}
    </main>
  );
}
