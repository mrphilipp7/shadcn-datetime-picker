import { useState } from "react"
import { type DateValue } from "react-aria-components"

import { FormischExample } from "@/registry/datetime-picker/examples/formisch-example"
import { ReactHookFormExample } from "@/registry/datetime-picker/examples/react-hook-form-example"
import { TanStackFormExample } from "@/registry/datetime-picker/examples/tanstack-form-example"

const examples = {
  "react-hook-form": ReactHookFormExample,
  "tanstack-form": TanStackFormExample,
  formisch: FormischExample,
}

/**
 * Renders one of the registry's form examples and shows what it submits.
 * Takes a key rather than a component because Astro island props must be
 * serializable.
 */
export function FormDemo({ library }: { library: keyof typeof examples }) {
  const [submitted, setSubmitted] = useState<DateValue | null | undefined>()
  const Example = examples[library]

  return (
    <div className="flex flex-col items-center gap-4">
      <Example onSubmit={setSubmitted} />
      <p className="text-muted-foreground text-sm" aria-live="polite">
        {submitted === undefined
          ? "Submit to see the value."
          : `Submitted: ${submitted?.toString() ?? "null"}`}
      </p>
    </div>
  )
}
