import { type DateValue } from "react-aria-components"
import * as v from "valibot"
import * as z from "zod"

export const REQUIRED_MESSAGE = "Appointment date and time is required."

// Zod — used by the React Hook Form and TanStack Form examples
export const zodSchema = z.object({
  appointment: z
    .custom<DateValue | null>()
    .refine((value) => value !== null, REQUIRED_MESSAGE),
})

// Valibot — used by the Formisch example
export const valibotSchema = v.object({
  appointment: v.pipe(
    v.custom<DateValue | null>(() => true),
    v.check((value) => value !== null, REQUIRED_MESSAGE)
  ),
})

export type ExampleFormProps = {
  onSubmit?: (appointment: DateValue | null) => void
}
