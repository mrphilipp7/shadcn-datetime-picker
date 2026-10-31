import { useForm } from "@tanstack/react-form"
import { type DateValue } from "react-aria-components"
import * as z from "zod"

import { DateTimePicker } from "@/components/datetime-picker/datetime-picker"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

const formSchema = z.object({
  appointment: z
    .custom<DateValue | null>()
    .refine((value) => value !== null, "Appointment date and time is required."),
})

type Props = {
  /** Receives the validated appointment */
  onSubmit?: (appointment: DateValue | null) => void
}

export function TanStackFormExample({ onSubmit }: Props) {
  const form = useForm({
    defaultValues: { appointment: null as DateValue | null },
    validators: { onSubmit: formSchema },
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
