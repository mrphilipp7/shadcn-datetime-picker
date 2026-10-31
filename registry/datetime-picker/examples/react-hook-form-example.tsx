import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

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

export function ReactHookFormExample({ onSubmit }: ExampleFormProps) {
  const form = useForm({
    resolver: zodResolver(zodSchema),
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
