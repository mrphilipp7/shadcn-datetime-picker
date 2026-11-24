import { useState } from "react"
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { parseDate, parseDateTime } from "@internationalized/date"
import { type DateValue } from "react-aria-components"
import { describe, expect, it, vi } from "vitest"

import { Field, FieldLabel } from "@/components/ui/field"

import { DateTimePicker } from "./datetime-picker"
import { FormischExample } from "./examples/formisch-example"
import { ReactHookFormExample } from "./examples/react-hook-form-example"
import { TanStackFormExample } from "./examples/tanstack-form-example"

const REQUIRED_MESSAGE = "Appointment date and time is required."

type ExampleForm = (props: {
  onSubmit?: (appointment: DateValue | null) => void
}) => React.ReactNode

const getPicker = () => screen.getByRole("group", { name: "Appointment" })
const getSegment = (name: RegExp) =>
  within(getPicker()).getByRole("spinbutton", { name })

// Types 03/14/2026 03:09 PM into the segments
async function typeDateTime(user: ReturnType<typeof userEvent.setup>) {
  await user.click(getSegment(/month/i))
  await user.keyboard("03142026")
  await user.keyboard("0309")
  await user.keyboard("p")
}

describe("Field composition", () => {
  const Composed = (props: { onBlur?: () => void; disabled?: boolean }) => {
    const [value, setValue] = useState<DateValue | null>(null)
    return (
      <Field>
        <FieldLabel htmlFor="appointment">Appointment</FieldLabel>
        <DateTimePicker
          id="appointment"
          value={value}
          onChange={setValue}
          {...props}
        />
        <button type="button">Elsewhere</button>
      </Field>
    )
  }

  it("is labelled by FieldLabel via htmlFor", () => {
    render(<Composed />)
    expect(getPicker()).toHaveAttribute("id", "appointment")
  })

  it("focuses the first segment when the label is clicked", async () => {
    const user = userEvent.setup()
    render(<Composed />)
    await user.click(screen.getByText("Appointment"))
    expect(getSegment(/month/i)).toHaveFocus()
  })

  it("maps aria-invalid to the invalid state", () => {
    render(<DateTimePicker label="Appointment" aria-invalid />)
    expect(getPicker()).toHaveAttribute("data-invalid", "true")
  })

  it("maps disabled to the disabled state", () => {
    render(<Composed disabled />)
    expect(getPicker()).toHaveAttribute("data-disabled", "true")
    expect(getSegment(/month/i)).toHaveAttribute("aria-disabled", "true")
  })

  it("only fires onBlur once focus leaves the picker and its popover", async () => {
    const user = userEvent.setup()
    const onBlur = vi.fn()
    render(<Composed onBlur={onBlur} />)

    await user.click(getSegment(/month/i))
    await user.click(screen.getByRole("button", { name: /calendar/i }))
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    expect(onBlur).not.toHaveBeenCalled()

    await user.keyboard("{Escape}")
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
    expect(onBlur).not.toHaveBeenCalled()
    // react-aria restores focus to the trigger on the next frame
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /calendar/i })).toHaveFocus()
    )

    await user.click(screen.getByRole("button", { name: "Elsewhere" }))
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  describe("Clear", () => {
    // Picks the 15th from the calendar, then presses Clear
    async function pickThenClear(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole("button", { name: /calendar/i }))
      const dialog = await screen.findByRole("dialog")
      const day15 = within(dialog)
        .getAllByRole("button")
        .find((el) => el.textContent === "15")!
      await user.click(day15)
      await user.click(within(dialog).getByRole("button", { name: "Clear" }))
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      )
    }

    const openCalendar = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(screen.getByRole("button", { name: /calendar/i }))
      return screen.findByRole("dialog")
    }

    it("empties the input", async () => {
      const user = userEvent.setup()
      render(<Composed />)
      await pickThenClear(user)
      expect(getSegment(/month/i)).toHaveAttribute("data-placeholder", "true")
    })

    it("leaves no day selected when the calendar is reopened", async () => {
      const user = userEvent.setup()
      render(<Composed />)
      await pickThenClear(user)

      const dialog = await openCalendar(user)
      expect(
        within(dialog).queryAllByRole("gridcell", { selected: true })
      ).toHaveLength(0)
    })

    it("does not bring the old date back when the reopened popover is dismissed", async () => {
      const user = userEvent.setup()
      render(<Composed />)
      await pickThenClear(user)

      await openCalendar(user)
      await user.keyboard("{Escape}")
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      )
      expect(getSegment(/month/i)).toHaveAttribute("data-placeholder", "true")
    })
  })

  it("still applies minValue / maxValue to the calendar", async () => {
    const user = userEvent.setup()
    render(
      <DateTimePicker
        label="Appointment"
        value={parseDateTime("2026-03-14T15:09")}
        pickerProps={{
          minValue: parseDate("2026-03-10"),
          maxValue: parseDate("2026-03-20"),
        }}
      />
    )
    await user.click(screen.getByRole("button", { name: /calendar/i }))
    const dialog = await screen.findByRole("dialog")
    const cell = (day: string) =>
      within(dialog)
        .getAllByRole("button")
        .find((el) => el.textContent === day)!

    expect(cell("9")).toHaveAttribute("aria-disabled", "true")
    expect(cell("15")).not.toHaveAttribute("aria-disabled")
    expect(cell("21")).toHaveAttribute("aria-disabled", "true")
    // The controlled value is the selected day
    expect(
      within(dialog).getByRole("gridcell", { selected: true })
    ).toHaveTextContent("14")
  })

  describe("swipe between months", () => {
    const openAt = async (
      pickerProps?: React.ComponentProps<typeof DateTimePicker>["pickerProps"]
    ) => {
      const user = userEvent.setup()
      render(
        <DateTimePicker
          label="Appointment"
          value={parseDateTime("2026-03-14T15:09")}
          pickerProps={pickerProps}
        />
      )
      await user.click(screen.getByRole("button", { name: /calendar/i }))
      const dialog = await screen.findByRole("dialog")
      return {
        heading: () => within(dialog).getByRole("heading").textContent,
        area: dialog.querySelector('[data-slot="calendar-swipe-area"]')!,
      }
    }

    const swipe = (
      el: Element,
      dx: number,
      { dy = 0, pointerType = "touch" } = {}
    ) => {
      fireEvent.pointerDown(el, { pointerId: 1, pointerType, clientX: 150, clientY: 150 })
      fireEvent.pointerUp(window, {
        pointerId: 1,
        pointerType,
        clientX: 150 + dx,
        clientY: 150 + dy,
      })
    }

    it("swipes left to the next month and right to the previous", async () => {
      const { heading, area } = await openAt()
      expect(heading()).toMatch(/March 2026/)
      act(() => swipe(area, -80))
      expect(heading()).toMatch(/April 2026/)
      act(() => swipe(area, 80))
      act(() => swipe(area, 80))
      expect(heading()).toMatch(/February 2026/)
    })

    it("ignores short, mostly vertical, and mouse drags", async () => {
      const { heading, area } = await openAt()
      act(() => swipe(area, -20))
      act(() => swipe(area, -60, { dy: 80 }))
      act(() => swipe(area, -80, { pointerType: "mouse" }))
      expect(heading()).toMatch(/March 2026/)
    })

    it("does not swipe past maxValue", async () => {
      const { heading, area } = await openAt({
        maxValue: parseDate("2026-03-31"),
      })
      act(() => swipe(area, -80))
      expect(heading()).toMatch(/March 2026/)
    })
  })
})

const examples: Array<{
  name: string
  Example: ExampleForm
  focusesOnError: boolean
}> = [
  { name: "React Hook Form", Example: ReactHookFormExample, focusesOnError: true },
  { name: "TanStack Form", Example: TanStackFormExample, focusesOnError: false },
  { name: "Formisch", Example: FormischExample, focusesOnError: true },
]

describe.each(examples)("$name", ({ Example, focusesOnError }) => {
  it("shows the validation error and invalid styling on empty submit", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Example onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: "Submit" }))

    expect(await screen.findByText(REQUIRED_MESSAGE)).toBeInTheDocument()
    expect(getPicker()).toHaveAttribute("data-invalid", "true")
    expect(getPicker().closest('[data-slot="field"]')).toHaveAttribute(
      "data-invalid",
      "true"
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  if (focusesOnError) {
    it("focuses the picker when validation fails", async () => {
      const user = userEvent.setup()
      render(<Example />)
      await user.click(screen.getByRole("button", { name: "Submit" }))
      await waitFor(() => expect(getSegment(/month/i)).toHaveFocus())
    })
  }

  it("submits a typed date and time", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Example onSubmit={onSubmit} />)

    await typeDateTime(user)
    await user.click(screen.getByRole("button", { name: "Submit" }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]?.toString()).toBe("2026-03-14T15:09:00")
  })

  it("submits a date picked from the calendar popover", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Example onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: /calendar/i }))
    const dialog = await screen.findByRole("dialog")
    const day15 = within(dialog)
      .getAllByRole("button")
      .find((el) => el.textContent === "15")!
    await user.click(day15)
    await user.click(within(dialog).getByRole("button", { name: "Ok" }))
    await user.click(screen.getByRole("button", { name: "Submit" }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const submitted = onSubmit.mock.calls[0][0]
    expect(submitted.day).toBe(15)
    expect(submitted.hour).toBe(0)
  })

  it("clears the error once a value is entered and resubmitted", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Example onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: "Submit" }))
    expect(await screen.findByText(REQUIRED_MESSAGE)).toBeInTheDocument()

    await typeDateTime(user)
    await user.click(screen.getByRole("button", { name: "Submit" }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(screen.queryByText(REQUIRED_MESSAGE)).not.toBeInTheDocument()
    expect(getPicker()).not.toHaveAttribute("data-invalid")
  })
})
