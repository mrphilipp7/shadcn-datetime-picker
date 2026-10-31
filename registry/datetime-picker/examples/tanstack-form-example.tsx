import { useForm } from "@tanstack/react-form"
import { type DateValue } from "react-aria-components"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { DateTimePicker } from "../datetime-picker"
import { type ExampleFormProps, zodSchema } from "./schema"

export function TanStackFormExample({ onSubmit }: ExampleFormProps) {
  const form = useForm({
    defaultValues: { appointment: null as DateValue | null },
    validators: { onSubmit: zodSchema },
    onSubmit: ({ value }) => onSubmit?.(value.appointment),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="flex w-80 flex-col gap-6"
    >
      <FieldGroup>
        <form.Field
          name="appointment"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="tanstack-appointment">
                  Appointment
                </FieldLabel>
                <DateTimePicker
                  id="tanstack-appointment"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  aria-invalid={isInvalid}
                />
                <FieldDescription>
                  Pick a date and time for your appointment.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
      </FieldGroup>
      <Button type="submit">Submit</Button>
    </form>
  )
}
