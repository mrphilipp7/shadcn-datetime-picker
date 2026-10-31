import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

afterEach(() => cleanup())

// jsdom gaps used by Radix ScrollArea and the time columns
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Element.prototype.scrollIntoView ??= () => {}
