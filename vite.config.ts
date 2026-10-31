import path from "node:path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Examples import the picker from the path it installs to in a user's
    // project; point that at the registry source here.
    alias: [
      {
        find: "@/components/datetime-picker",
        replacement: path.resolve(import.meta.dirname, "registry/datetime-picker"),
      },
      { find: "@", replacement: path.resolve(import.meta.dirname) },
    ],
  },
})
