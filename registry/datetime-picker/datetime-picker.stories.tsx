import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { type DateValue } from "react-aria-components"
import { CalendarDate, CalendarDateTime } from "@internationalized/date"

import { DatePicker, DateTimePicker } from "./datetime-picker"

type PickerComponent = typeof DateTimePicker
type PickerArgs = React.ComponentProps<PickerComponent>

// Wraps the picker in local state so stories behave like a controlled field
const Controlled = ({
  component: Picker,
  initialValue = null,
  ...props
}: PickerArgs & {
  component: PickerComponent
  initialValue?: DateValue | null
}) => {
  const [value, setValue] = useState<DateValue | null>(initialValue)

  return (
    <div className="flex w-80 flex-col gap-4">
      <Picker {...props} value={value} onChange={setValue} />
      <p className="text-sm text-muted-foreground">
        Value: <code>{value?.toString() ?? "null"}</code>
      </p>
    </div>
  )
}

const meta = {
  title: "DateTime Picker",
  component: DateTimePicker,
  args: {
    label: "Appointment",
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
  },
} satisfies Meta<typeof DateTimePicker>

export default meta

type Story = StoryObj<typeof meta>

export const DateOnly: Story = {
  args: { label: "Date" },
  render: (args) => <Controlled component={DatePicker} {...args} />,
}

export const DateTime12Hour: Story = {
  render: (args) => <Controlled component={DateTimePicker} {...args} />,
}

export const DateTime24Hour: Story = {
  args: { pickerProps: { hourCycle: 24 } },
  render: (args) => <Controlled component={DateTimePicker} {...args} />,
}

export const HourGranularity: Story = {
  args: { pickerProps: { granularity: "hour" } },
  render: (args) => <Controlled component={DateTimePicker} {...args} />,
}

export const SecondGranularity: Story = {
  args: { pickerProps: { granularity: "second" } },
  render: (args) => <Controlled component={DateTimePicker} {...args} />,
}

export const WithInitialValue: Story = {
  render: (args) => (
    <Controlled
      component={DateTimePicker}
      initialValue={new CalendarDateTime(2026, 3, 14, 15, 9)}
      {...args}
    />
  ),
}

export const MinMax: Story = {
  args: {
    label: "Within 2026",
    description: "Only dates in 2026 are selectable.",
    pickerProps: {
      minValue: new CalendarDate(2026, 1, 1),
      maxValue: new CalendarDate(2026, 12, 31),
    },
  },
  render: (args) => <Controlled component={DatePicker} {...args} />,
}

export const WithDescription: Story = {
  args: { description: "Pick a date and time for your appointment." },
  render: (args) => <Controlled component={DateTimePicker} {...args} />,
}

export const WithError: Story = {
  args: {
    errorMessage: "Appointment date and time is required.",
    pickerProps: { isInvalid: true },
  },
  render: (args) => <Controlled component={DateTimePicker} {...args} />,
}

export const Disabled: Story = {
  args: { pickerProps: { isDisabled: true } },
  render: (args) => <Controlled component={DateTimePicker} {...args} />,
}

export const NoVisibleLabel: Story = {
  args: { label: undefined },
  render: (args) => <Controlled component={DateTimePicker} {...args} />,
}
