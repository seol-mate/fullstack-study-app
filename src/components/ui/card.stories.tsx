import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>게시글 제목</CardTitle>
        <CardDescription>게시글 #1</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          카드 본문입니다. 요약이나 짧은 설명을 넣을 수 있습니다.
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithActionAndFooter: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>알림 설정</CardTitle>
        <CardDescription>이메일 알림을 관리합니다.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            편집
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">새 댓글이 달리면 알려줍니다.</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">저장</Button>
      </CardFooter>
    </Card>
  ),
};
