import type { Preview } from "@storybook/react-vite"

import "../styles/globals.css"

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (Story, context) => {
      document.documentElement.classList.toggle(
        "dark",
        context.globals.theme === "dark"
      )
      return (
        <div className="bg-background text-foreground p-6">
          <Story />
        </div>
      )
    },
  ],
  parameters: {
    layout: "fullscreen",
  },
}

export default preview
