import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { type DateValue } from "react-aria-components"

import { DateTimePickerDemo } from "./examples/datetime-picker-demo"
import { FormischExample } from "./examples/formisch-example"
import { ReactHookFormExample } from "./examples/react-hook-form-example"
import { TanStackFormExample } from "./examples/tanstack-form-example"

type ExampleForm = (props: {
  onSubmit?: (appointment: DateValue | null) => void
}) => React.ReactNode

// Shows what the form handed to onSubmit
const WithSubmitted = ({
  Example,
}: {
  Example: ExampleForm
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
  render: () => <DateTimePickerDemo />,
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
