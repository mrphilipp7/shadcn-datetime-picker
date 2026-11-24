// @ts-check
import { cp } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const repoUrl = "https://github.com/mrphilipp7/shadcn-datetime-picker";

/**
 * Copies the built shadcn registry (`public/r/*.json` at the repo root) into
 * the site output, so `npx shadcn add` can install from the docs URL.
 */
function serveRegistry() {
  return {
    name: "serve-registry",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        await cp(path.join(repoRoot, "public/r"), new URL("r/", dir), {
          recursive: true,
        });
      },
    },
  };
}

export default defineConfig({
  site: "https://mrphilipp7.github.io",
  base: "/shadcn-datetime-picker",
  integrations: [
    starlight({
      title: "DateTime Picker",
      description:
        "A date and time picker for shadcn/ui, built on React Aria Components.",
      social: [{ icon: "github", label: "GitHub", href: repoUrl }],
      editLink: { baseUrl: `${repoUrl}/edit/main/docs/` },
      customCss: ["./src/styles/global.css"],
      sidebar: [
        {
          label: "Getting started",
          items: [
            { label: "Installation", slug: "installation" },
            { label: "Usage", slug: "usage" },
            { label: "API reference", slug: "api" },
            { label: "Upgrading", slug: "upgrading" },
          ],
        },
        {
          label: "Forms",
          items: [
            { label: "React Hook Form", slug: "forms/react-hook-form" },
            { label: "TanStack Form", slug: "forms/tanstack-form" },
            { label: "Formisch", slug: "forms/formisch" },
          ],
        },
        {
          label: "Registry",
          items: [{ label: "Examples & AI assistants", slug: "registry" }],
        },
      ],
    }),
    react(),
    serveRegistry(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // The demos render the real component and examples from the repo root,
      // imported by the same paths they install to in a user's project.
      alias: [
        {
          find: /^@\/components\/ui\/datetime-picker$/,
          replacement: path.join(
            repoRoot,
            "registry/datetime-picker/datetime-picker.tsx",
          ),
        },
        {
          find: /^@\/(components|lib|registry)\//,
          replacement: `${repoRoot}$1/`,
        },
      ],
    },
  },
});
