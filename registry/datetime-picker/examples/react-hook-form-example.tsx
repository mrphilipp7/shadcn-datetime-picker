import { zodResolver } from "@hookform/resolvers/zod"
import { type DateValue } from "react-aria-components"
import { Controller, useForm } from "react-hook-form"
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

export function ReactHookFormExample({ onSubmit }: Props) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { appointment: null },
  })

  return (
    <form
      onSubmit={form.handleSubmit((data) => onSubmit?.(data.appointment))}
      className="flex w-80 flex-col gap-6"
    >
      <FieldGroup>
        <Controller
          name="appointment"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="rhf-appointment">Appointment</FieldLabel>
              <DateTimePicker
                {...field}
                id="rhf-appointment"
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                Pick a date and time for your appointment.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit">Submit</Button>
    </form>
  )
}
