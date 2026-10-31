import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  stories: ["../registry/**/*.stories.@(ts|tsx)"],
  framework: "@storybook/react-vite",
}

export default config
