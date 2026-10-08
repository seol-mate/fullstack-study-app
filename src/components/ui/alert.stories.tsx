import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const meta = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "destructive"] },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>알림</AlertTitle>
      <AlertDescription>변경 사항이 저장되었습니다.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  args: { variant: "destructive" },
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>에러</AlertTitle>
      <AlertDescription>요청 실패: 500</AlertDescription>
    </Alert>
  ),
};
