import { useState } from "react"
import { type DateValue } from "react-aria-components"

import {
  DatePicker,
  DateTimePicker,
} from "@/components/datetime-picker/datetime-picker"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

export function DateTimePickerDemo() {
  const [date, setDate] = useState<DateValue | null>(null)
  const [appointment, setAppointment] = useState<DateValue | null>(null)

  return (
    <FieldGroup className="w-80">
      <Field>
        <FieldLabel htmlFor="demo-date">Date</FieldLabel>
        <DatePicker id="demo-date" value={date} onChange={setDate} />
      </Field>
      <Field>
        <FieldLabel htmlFor="demo-appointment">Appointment</FieldLabel>
        <DateTimePicker
          id="demo-appointment"
          value={appointment}
          onChange={setAppointment}
          pickerProps={{ hourCycle: 24 }}
        />
        <FieldDescription>
          Pick a date and time for your appointment.
        </FieldDescription>
      </Field>
    </FieldGroup>
  )
}
