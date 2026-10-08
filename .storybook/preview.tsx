import type { Preview } from "@storybook/nextjs-vite";

import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
  // layout.tsx가 next/font로 주입하는 --font-geist-sans 대신 시스템 폰트를 사용한다.
  decorators: [
    (Story) => (
      <div style={{ ["--font-geist-sans" as string]: "ui-sans-serif, system-ui, sans-serif" }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
