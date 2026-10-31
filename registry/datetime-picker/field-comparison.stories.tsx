import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { type DateValue } from "react-aria-components"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { DateTimePicker } from "./datetime-picker"

type State = "default" | "invalid" | "disabled"

// Reference: a shadcn Input composed with Field, the way shadcn docs show it
const InputField = ({ state }: { state: State }) => (
  <Field
    data-invalid={state === "invalid" || undefined}
    data-disabled={state === "disabled" || undefined}
  >
    <FieldLabel htmlFor={`input-${state}`}>Appointment</FieldLabel>
    <Input
      id={`input-${state}`}
      placeholder="mm/dd/yyyy, --:-- --"
      aria-invalid={state === "invalid" || undefined}
      disabled={state === "disabled"}
    />
    <FieldDescription>Pick a date and time for your appointment.</FieldDescription>
    {state === "invalid" && (
      <FieldError>Appointment date and time is required.</FieldError>
    )}
  </Field>
)

const PickerField = ({ state }: { state: State }) => {
  const [value, setValue] = useState<DateValue | null>(null)

  return (
    <DateTimePicker
      label="Appointment"
      description="Pick a date and time for your appointment."
      errorMessage={
        state === "invalid" ? "Appointment date and time is required." : undefined
      }
      value={value}
      onChange={setValue}
      pickerProps={{
        isInvalid: state === "invalid",
        isDisabled: state === "disabled",
      }}
    />
  )
}

const Comparison = ({ state }: { state: State }) => (
  <div className="grid w-[44rem] grid-cols-2 gap-10">
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        shadcn Input + Field
      </p>
      <InputField state={state} />
    </div>
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        DateTimePicker
      </p>
      <PickerField state={state} />
    </div>
  </div>
)

const meta = {
  title: "DateTime Picker/Field Comparison",
  component: Comparison,
  args: { state: "default" },
  argTypes: {
    state: { control: "inline-radio", options: ["default", "invalid", "disabled"] },
  },
} satisfies Meta<typeof Comparison>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Invalid: Story = { args: { state: "invalid" } }

export const Disabled: Story = { args: { state: "disabled" } }
