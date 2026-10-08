"use client";

import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";

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

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=10");
  if (!res.ok) throw new Error(`요청 실패: ${res.status}`);
  return res.json();
}

export default function ExamplePage() {
  const { data, isPending, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });
  const [selectedId, setSelectedId] = useAtom(selectedPostIdAtom);

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">useQuery 예제</h1>
        <Button onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "불러오는 중..." : "새로고침"}
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
          {data.map((post) => (
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
    </main>
  );
}
