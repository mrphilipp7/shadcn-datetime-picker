import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { type DateValue } from "react-aria-components"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"

import { DateTimePicker } from "./datetime-picker"
import { FormischExample } from "./examples/formisch-example"
import { ReactHookFormExample } from "./examples/react-hook-form-example"
import type { ExampleFormProps } from "./examples/schema"
import { TanStackFormExample } from "./examples/tanstack-form-example"

// Shows what the form handed to onSubmit
const WithSubmitted = ({
  Example,
}: {
  Example: (props: ExampleFormProps) => React.ReactNode
}) => {
  const [submitted, setSubmitted] = useState<string>()

  return (
    <div className="flex flex-col gap-6">
      <Example onSubmit={(value) => setSubmitted(value?.toString())} />
      <p className="text-sm text-muted-foreground">
        Submitted: <code>{submitted ?? "—"}</code>
      </p>
    </div>
  )
}

const meta = {
  title: "DateTime Picker/Forms",
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const FieldComposition: Story = {
  render: () => {
    const [value, setValue] = useState<DateValue | null>(null)

    return (
      <Field className="w-80">
        <FieldLabel htmlFor="field-appointment">Appointment</FieldLabel>
        <DateTimePicker
          id="field-appointment"
          value={value}
          onChange={setValue}
        />
        <FieldDescription>Pick a date and time for your appointment.</FieldDescription>
      </Field>
    )
  },
}

export const ReactHookForm: Story = {
  render: () => <WithSubmitted Example={ReactHookFormExample} />,
}

export const TanStackForm: Story = {
  render: () => <WithSubmitted Example={TanStackFormExample} />,
}

export const Formisch: Story = {
  render: () => <WithSubmitted Example={FormischExample} />,
}
