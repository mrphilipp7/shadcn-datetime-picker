import { Form, Field as FormischField, useForm } from "@formisch/react"
import { type DateValue } from "react-aria-components"
import * as v from "valibot"

import { DateTimePicker } from "@/components/datetime-picker/datetime-picker"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

const FormSchema = v.object({
  appointment: v.pipe(
    v.custom<DateValue | null>(() => true),
    v.check((value) => value !== null, "Appointment date and time is required.")
  ),
})

type Props = {
  /** Receives the validated appointment */
  onSubmit?: (appointment: DateValue | null) => void
}

export function FormischExample({ onSubmit }: Props) {
  const form = useForm({
    schema: FormSchema,
    initialInput: { appointment: null },
  })

  return (
    <Form
      of={form}
      onSubmit={(output) => onSubmit?.(output.appointment)}
      className="flex w-80 flex-col gap-6"
    >
      <FieldGroup>
        <FormischField of={form} path={["appointment"]}>
          {(field) => (
            <Field data-invalid={field.errors !== null}>
              <FieldLabel htmlFor="formisch-appointment">Appointment</FieldLabel>
              <DateTimePicker
                {...field.props}
                id="formisch-appointment"
                value={field.input ?? null}
                onChange={field.onChange}
                aria-invalid={field.errors !== null}
              />
              <FieldDescription>
                Pick a date and time for your appointment.
              </FieldDescription>
              {field.errors && (
                <FieldError
                  errors={field.errors.map((message) => ({ message }))}
                />
              )}
            </Field>
          )}
        </FormischField>
      </FieldGroup>
      <Button type="submit">Submit</Button>
    </Form>
  )
}
