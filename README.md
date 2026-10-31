# DateTime Picker

A date and time picker for [shadcn/ui](https://ui.shadcn.com), built on [React Aria Components](https://react-spectrum.adobe.com/react-aria/DatePicker.html). Combines calendar selection with scrollable hour/minute/second/AM-PM columns, supports 12/24-hour formats, and lets you dial in exactly how much granularity you need — day only, or down to the second.

## Preview

Designed to sit alongside shadcn's `Input` and `Field` components with matching layout, spacing, and states.

![DateTimePicker next to a shadcn Input + Field in the default state](./assets/default-sidebyside.png)

![DateTimePicker next to a shadcn Input + Field in the invalid state](./assets/error-sidebyside.png)

## Installation

```bash
npx shadcn@latest add https://raw.githubusercontent.com/mrphilipp7/shadcn-datetime-picker/main/public/r/datetime-picker.json
```

This installs `datetime-picker.tsx` and `datetime-picker-context.ts` into `components/datetime-picker/` (or `src/components/datetime-picker/` if your project uses a `src` directory), plus the `button` and `scroll-area` shadcn components and the `@internationalized/date`, `react-aria-components`, and `lucide-react` dependencies it relies on.

## Usage

```tsx
import { useState } from "react"
import { type DateValue } from "react-aria-components"

import { DateTimePicker } from "@/components/datetime-picker/datetime-picker"

export function Example() {
  const [value, setValue] = useState<DateValue | null>(null)

  return (
    <DateTimePicker
      label="Appointment"
      value={value}
      onChange={setValue}
      pickerProps={{
        hourCycle: 24,
      }}
    />
  )
}
```

### `DatePicker` vs `DateTimePicker`

- `DatePicker` — calendar only, day granularity.
- `DateTimePicker` — calendar plus time columns, minute granularity by default.

Both share the same props and render the same underlying component; `DatePicker` just pins `pickerProps.granularity` to `"day"`.

### Props

| Prop           | Type                                | Description                                                                 |
| -------------- | ----------------------------------- | ----------------------------------------------------------------------------- |
| `label`        | `string`                             | Visible field label.                                                          |
| `description`  | `string`                             | Helper text rendered below the input.                                         |
| `errorMessage` | `string`                             | Validation error rendered below the input.                                    |
| `className`    | `string`                             | Applied to the root and label wrapper.                                        |
| `value`        | `DateValue \| null`                  | Controlled value ([`@internationalized/date`](https://react-spectrum.adobe.com/internationalized/date/index.html) type). |
| `onChange`     | `(value: DateValue \| null) => void` | Called on any date or time change.                                            |
| `pickerProps`  | `PickerProps`                       | Passed through to the underlying React Aria `DatePicker` — `granularity`, `hourCycle`, `minValue`, `maxValue`, `isDisabled`, etc. |

`granularity` accepts `"day" | "hour" | "minute" | "second"` and controls which time columns render. `hourCycle` accepts `12 | 24`; the AM/PM column only shows up in 12-hour mode.

### With React Hook Form + Zod

```tsx
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { type DateValue } from "react-aria-components"

import { DateTimePicker } from "@/components/datetime-picker/datetime-picker"
import { Field, FieldSet } from "@/components/ui/field"
import { Button } from "@/components/ui/button"

const appointmentSchema = z.object({
  appointment: z.custom<DateValue | null>((val) => val != null, {
    message: "Appointment date and time is required.",
  }),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

export function AppointmentForm() {
  const [submitted, setSubmitted] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { appointment: null },
  })

  const onSubmit = (data: AppointmentFormValues) => {
    setSubmitted(data.appointment?.toString() ?? null)
  }

  return (
    <div className="flex flex-col gap-4">
      {submitted && <p>Submitted: {submitted}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldSet>
          <Field>
            <Controller
              control={control}
              name="appointment"
              render={({ field }) => (
                <DateTimePicker
                  label="Appointment"
                  description="Pick a date and time for your appointment."
                  errorMessage={errors.appointment?.message}
                  value={field.value}
                  onChange={field.onChange}
                  pickerProps={{ hourCycle: 24 }}
                />
              )}
            />
          </Field>
        </FieldSet>

        <Button type="submit">Submit</Button>
      </form>
    </div>
  )
}
```

## Development

The component source lives in `registry/datetime-picker/`. `components/ui/` and `lib/` are dev-only copies of the shadcn `button`, `scroll-area`, and `cn` dependencies so the component can render locally. They are not shipped.

```bash
npm install
npm run storybook        # http://localhost:6006
```

Stories live next to the component in `registry/datetime-picker/datetime-picker.stories.tsx`. Only files listed in `registry.json` are published, so stories never reach users.

### Maintaining this registry

`public/r/*.json` is generated output, not hand-written. It's what the `npx shadcn add` URL above actually serves, with the component source embedded as `content`. After changing anything in `registry/` or `registry.json`, regenerate it before committing:

```bash
npm run registry:build
```

Each file's `target` in `registry.json` controls where it installs in the user's project.

## License

[MIT](./LICENSE)
