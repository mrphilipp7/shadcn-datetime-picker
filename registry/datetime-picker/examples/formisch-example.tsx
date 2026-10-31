import { Form, Field as FormischField, useForm } from "@formisch/react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { DateTimePicker } from "../datetime-picker"
import { type ExampleFormProps, valibotSchema } from "./schema"

export function FormischExample({ onSubmit }: ExampleFormProps) {
  const form = useForm({
    schema: valibotSchema,
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
