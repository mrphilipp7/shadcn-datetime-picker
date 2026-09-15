"use client"

import {
  Button,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePicker as AriaDatePicker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Label,
  Popover,
  Text,
  Calendar,
  type DatePickerProps as AriaDatePickerProps,
  type DateValue,
} from "react-aria-components"

import { Button as ShadButton } from "@/components/ui/button"

import { ScrollArea as ShadScrollArea } from "@/components/ui/scroll-area"

import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

import React from "react"

import {
  toCalendarDateTime,
  now,
  getLocalTimeZone,
} from "@internationalized/date"

import { DateTimeContext, useDateTime } from "./datetime-picker-context"

/* =========================================================
   TIME SELECTION DATA ARRAYS
   These are used to render scrollable/selectable time units
========================================================= */

const hoursMilitary = Array.from({ length: 24 }, (_, i) => i)
const hours = Array.from({ length: 12 }, (_, i) => i + 1)
const minutes = Array.from({ length: 60 }, (_, i) => i)
const seconds = Array.from({ length: 60 }, (_, i) => i)
const AmPm = ["AM", "PM"]

/* =========================================================
   COMPONENT PROPS (wrapper around react-aria DatePicker)
========================================================= */

type PickerProps = Omit<
  AriaDatePickerProps<DateValue>,
  | "shouldCloseOnSelect"
  | "value"
  | "onChange"
  | "children"
  | "isOpen"
  | "onOpenChange"
  | "className"
  | "defaultOpen"
  | "defaultValue"
>

type DateTimePickerProps = {
  label?: string
  description?: string
  errorMessage?: string
  className?: string
  value?: DateValue | null
  onChange?: (value: DateValue | null) => void

  /**
   * Pass-through props to react-aria DatePicker
   * e.g. granularity, minValue, maxValue, hourCycle, etc.
   */
  pickerProps?: PickerProps
}

/* =========================================================
   MAIN COMPONENT
   Date + Time Picker Wrapper
========================================================= */

export function SlotPicker({
  label,
  description,
  errorMessage,
  className,
  value,
  onChange,
  pickerProps,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  /* ---------------------------------------------------------
     Context value shared across calendar + time subcomponents
  --------------------------------------------------------- */

  const ctxValue = React.useMemo(
    () => ({
      value: value ?? null,
      onChange: (v: DateValue | null) => onChange?.(v),
      granularity: pickerProps?.granularity ?? "day",
      hourCycle: pickerProps?.hourCycle ?? 12,
      close: () => setIsOpen(false),
      isOpen,
    }),
    [value, onChange, pickerProps?.granularity, pickerProps?.hourCycle, isOpen]
  )

  /* ---------------------------------------------------------
     Granularity flags (controls time UI rendering)
  --------------------------------------------------------- */

  const isDayOnly =
    pickerProps?.granularity === "day" || !pickerProps?.granularity

  const showHour =
    pickerProps?.granularity === "hour" ||
    pickerProps?.granularity === "minute" ||
    pickerProps?.granularity === "second"

  const showMinute =
    pickerProps?.granularity === "minute" ||
    pickerProps?.granularity === "second"

  const showSecond = pickerProps?.granularity === "second"

  const showAmPm = showHour && ctxValue.hourCycle === 12

  /* ---------------------------------------------------------
     react-aria requires either a visible <Label> or an
     aria-label/aria-labelledby — fall back to a generic
     aria-label when no visible label is provided.
  --------------------------------------------------------- */

  const hasAccessibleLabel = Boolean(
    label || pickerProps?.["aria-label"] || pickerProps?.["aria-labelledby"]
  )

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <DateTimeContext.Provider value={ctxValue}>
      <AriaDatePicker
        {...pickerProps}
        {...(!hasAccessibleLabel && { "aria-label": "Date" })}
        value={value}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        shouldCloseOnSelect={false}
        onChange={(v) => onChange?.(v)}
        className={cn("flex flex-col gap-2", className)}
        shouldForceLeadingZeros={pickerProps?.shouldForceLeadingZeros ?? true}
      >
        {/* =====================================================
            LABEL
        ===================================================== */}
        {label && (
          <Label
            className={cn(
              "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-2.5 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10",
              "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
              className
            )}
          >
            {label}
          </Label>
        )}

        {/* =====================================================
            INPUT FIELD
        ===================================================== */}
        <Group
          className={cn(
            "relative flex h-8 w-full items-center gap-1 rounded-lg border border-input bg-transparent px-2.5 py-1",
            "text-sm transition-colors outline-none",
            "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
            "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
            "dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
          )}
        >
          <DateInput
            className={cn(
              "flex w-full min-w-0 items-center gap-0.5 text-sm text-foreground",
              "placeholder:text-muted-foreground"
            )}
          >
            {(segment) => (
              <DateSegment
                segment={segment}
                className={cn(
                  "rounded-sm px-0.5 py-0.5 tabular-nums outline-none",
                  "focus:bg-accent focus:text-accent-foreground",
                  "aria-invalid:text-destructive"
                )}
              />
            )}
          </DateInput>

          <Button
            className={cn(
              "ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md",
              "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "disabled:pointer-events-none disabled:opacity-50",
              "enabled:cursor-pointer"
            )}
            onClick={() => setIsOpen(true)}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </Group>

        {/* =====================================================
            DESCRIPTION / ERROR
        ===================================================== */}
        {description && (
          <Text
            slot="description"
            className={cn(
              "text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
              "last:mt-0 nth-last-2:-mt-1",
              "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
              className
            )}
          >
            {description}
          </Text>
        )}

        {errorMessage && (
          <Text
            slot="errorMessage"
            className="text-sm font-normal text-destructive"
          >
            {errorMessage}
          </Text>
        )}

        {/* =====================================================
            POPUP CALENDAR + TIME PICKER
        ===================================================== */}
        <Popover
          className="z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md"
          shouldCloseOnInteractOutside={(element) => {
            return !element.closest("[data-datetime-picker]")
          }}
        >
          <Dialog className="outline-none">
            <div
              data-datetime-picker
              className="flex flex-row overflow-hidden"
              style={
                {
                  maxHeight:
                    "var(--radix-popover-content-available-height, 600px)",
                } as React.CSSProperties
              }
            >
              {/* ---------------- CALENDAR ---------------- */}
              <Calendar
                onChange={(date) => {
                  if (isDayOnly) {
                    onChange?.(date)
                    setIsOpen(false)
                  } else {
                    const hasExistingTime = value && "hour" in value
                    const timeSource = hasExistingTime
                      ? value
                      : now(getLocalTimeZone()).set({
                          hour: 0,
                          minute: 0,
                          second: 0,
                        })
                    const toDateTime = toCalendarDateTime(date, timeSource)
                    onChange?.(toDateTime)
                  }
                }}
              >
                <header className="mb-4 flex items-center justify-between">
                  <Heading className="text-sm font-medium" />
                  <div className="flex items-center gap-1">
                    <Button
                      slot="previous"
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      slot="next"
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </header>

                <CalendarGrid className="border-collapse">
                  {(date) => (
                    <CalendarCell
                      date={date}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors",
                        "outside-month:text-muted-foreground",
                        "hover:bg-accent hover:text-accent-foreground",
                        "data-[selected=true]:bg-primary",
                        "data-[selected=true]:text-primary-foreground",
                        "focus-visible:ring-2 focus-visible:ring-ring",
                        "focus-visible:outline-none",
                        "data-disabled:opacity-40",
                        "data-disabled:hover:bg-transparent",
                        "data-disabled:hover:text-muted-foreground",
                        "data-disabled:text-muted-foreground",
                        "data-unavailable:text-muted-foreground data-unavailable:line-through",
                        "data-unavailable:hover:bg-transparent",
                        "data-today:bg-accent",
                        "data-today:text-accent-foreground",
                        "data-[selected=true]:data-today:bg-primary",
                        "data-[selected=true]:data-today:text-primary-foreground",
                        value &&
                          date.compare(value) === 0 &&
                          "bg-primary text-primary-foreground"
                      )}
                    />
                  )}
                </CalendarGrid>
              </Calendar>

              {/* ---------------- TIME PANES ---------------- */}
              {!isDayOnly && (
                <>
                  {/* Vertical divider between calendar and time columns */}
                  <div className="mx-3 w-px self-stretch rounded-full bg-border" />

                  {/* Time columns — always side by side, always vertical scroll */}
                  <div className="flex h-(--calendar-height,300px) min-h-0 flex-row divide-x">
                    {showHour && (
                      <TimeColumn>
                        <HourScrollArea />
                      </TimeColumn>
                    )}

                    {showMinute && (
                      <TimeColumn>
                        <MinuteScrollArea />
                      </TimeColumn>
                    )}

                    {showSecond && (
                      <TimeColumn>
                        <SecondScrollArea />
                      </TimeColumn>
                    )}

                    {showAmPm && (
                      <TimeColumn>
                        <AmPmScrollArea />
                      </TimeColumn>
                    )}
                  </div>
                </>
              )}
            </div>
            <DialogFooter />
          </Dialog>
        </Popover>
      </AriaDatePicker>
    </DateTimeContext.Provider>
  )
}

/* =========================================================
   TIME COLUMN WRAPPER
   Vertical scroll area for a single time unit column
========================================================= */

const TimeColumn = ({ children }: { children: React.ReactNode }) => {
  return (
    <ShadScrollArea className="h-full w-auto">
      <div className="flex flex-col p-2">{children}</div>
    </ShadScrollArea>
  )
}

/* =========================================================
   HOUR / MINUTE / SECOND / AMPM SCROLL COMPONENTS
========================================================= */

/* ------------------ HOUR  ------------------ */
const HourScrollArea = () => {
  const { value, onChange, granularity, hourCycle, isOpen } = useDateTime()
  const selectedRef = React.useRef<HTMLButtonElement | null>(null)

  React.useLayoutEffect(() => {
    if (isOpen) selectedRef.current?.scrollIntoView({ block: "center" })
  }, [isOpen])

  if (
    granularity !== "hour" &&
    granularity !== "minute" &&
    granularity !== "second"
  ) {
    return null
  }

  return hourCycle === 24 ? (
    <>
      {[...hoursMilitary].map((hour) => {
        const selected = value && "hour" in value ? value.hour === hour : false

        return (
          <ShadButton
            key={hour}
            ref={selected ? selectedRef : undefined}
            variant={selected ? "default" : "ghost"}
            className="h-9 w-9"
            onClick={() => {
              if (!value || !("hour" in value)) return
              onChange(value.set({ hour }))
            }}
          >
            {hour.toString().padStart(2, "0")}
          </ShadButton>
        )
      })}
    </>
  ) : (
    <>
      {[...hours].reverse().map((hour) => {
        const currentHour =
          value && "hour" in value ? ((value.hour + 11) % 12) + 1 : null
        const selected = currentHour === hour

        return (
          <ShadButton
            key={hour}
            ref={selected ? selectedRef : undefined}
            variant={selected ? "default" : "ghost"}
            className="h-9 w-9"
            onClick={() => {
              if (!value || !("hour" in value)) return

              const isPM = value.hour >= 12
              let normalizedHour = hour % 12
              if (isPM) normalizedHour += 12

              onChange(value.set({ hour: normalizedHour }))
            }}
          >
            {hour.toString().padStart(2, "0")}
          </ShadButton>
        )
      })}
    </>
  )
}

/* ---------------- MINUTE ---------------- */
const MinuteScrollArea = () => {
  const { value, onChange, granularity, isOpen } = useDateTime()
  const selectedRef = React.useRef<HTMLButtonElement | null>(null)

  React.useLayoutEffect(() => {
    if (isOpen) selectedRef.current?.scrollIntoView({ block: "center" })
  }, [isOpen])

  if (granularity !== "minute" && granularity !== "second") return null

  return (
    <>
      {[...minutes].map((min) => {
        const selected =
          value && "minute" in value ? value.minute === min : false

        return (
          <ShadButton
            key={min}
            ref={selected ? selectedRef : undefined}
            variant={selected ? "default" : "ghost"}
            className="h-9 w-9"
            onClick={() => {
              if (!value || !("minute" in value)) return
              onChange(value.set({ minute: min }))
            }}
          >
            {min.toString().padStart(2, "0")}
          </ShadButton>
        )
      })}
    </>
  )
}

/* ---------------- SECOND ---------------- */
const SecondScrollArea = () => {
  const { value, onChange, granularity, isOpen } = useDateTime()
  const selectedRef = React.useRef<HTMLButtonElement | null>(null)

  React.useLayoutEffect(() => {
    if (isOpen) selectedRef.current?.scrollIntoView({ block: "center" })
  }, [isOpen])

  if (granularity !== "second") return null

  return (
    <>
      {[...seconds].map((sec) => {
        const selected =
          value && "second" in value ? value.second === sec : false

        return (
          <ShadButton
            key={sec}
            ref={selected ? selectedRef : undefined}
            variant={selected ? "default" : "ghost"}
            className="h-9 w-9"
            onClick={() => {
              if (!value || !("second" in value)) return
              onChange(value.set({ second: sec }))
            }}
          >
            {sec.toString().padStart(2, "0")}
          </ShadButton>
        )
      })}
    </>
  )
}

/* ---------------- AM / PM ---------------- */
const AmPmScrollArea = () => {
  const { value, onChange, granularity, hourCycle } = useDateTime()

  if (
    hourCycle !== 12 ||
    (granularity !== "hour" &&
      granularity !== "minute" &&
      granularity !== "second")
  ) {
    return null
  }

  return (
    <>
      {AmPm.map((ampm) => {
        const selected =
          value && "hour" in value
            ? ampm === "AM"
              ? value.hour < 12
              : value.hour >= 12
            : false

        return (
          <ShadButton
            key={ampm}
            variant={selected ? "default" : "ghost"}
            className="h-9 w-9"
            onClick={() => {
              if (!value || !("hour" in value)) return

              let newHour = value.hour
              if (ampm === "PM" && newHour < 12) newHour += 12
              if (ampm === "AM" && newHour >= 12) newHour -= 12

              onChange(value.set({ hour: newHour }))
            }}
          >
            {ampm}
          </ShadButton>
        )
      })}
    </>
  )
}

/* =========================================================
   FOOTER ACTIONS (CLEAR / OK)
========================================================= */

const DialogFooter = () => {
  const { granularity, close, onChange } = useDateTime()

  if (
    granularity !== "hour" &&
    granularity !== "minute" &&
    granularity !== "second"
  ) {
    return null
  }

  return (
    <footer>
      <div className="my-2 h-px w-full rounded-full bg-border" />
      <div className="flex justify-end gap-2">
        <ShadButton
          variant="ghost"
          className="cursor-pointer"
          onClick={() => {
            onChange(null)
            close()
          }}
        >
          Clear
        </ShadButton>
        <ShadButton
          variant="ghost"
          className="cursor-pointer"
          onClick={() => close()}
        >
          Ok
        </ShadButton>
      </div>
    </footer>
  )
}

/* =========================================================
   EXPORT MAIN COMPONENTS AS DATEPICKER + DATETIMEPICKER
    - DatePicker = day granularity only
    - DateTimePicker = day + time granularity (default: minute)
========================================================= */

const DatePicker = (props: DateTimePickerProps) => {
  const invalidGranularity = props.pickerProps?.granularity

  // Warn if user tries to pass a granularity other than "day"
  React.useEffect(() => {
    if (invalidGranularity && invalidGranularity !== "day") {
      console.warn(
        "DatePicker only supports day granularity. Overriding granularity to 'day'."
      )
    }
  }, [invalidGranularity])

  return (
    <SlotPicker
      {...props}
      pickerProps={{
        ...props.pickerProps,
        granularity: "day",
      }}
    />
  )
}

const DateTimePicker = (props: DateTimePickerProps) => (
  <SlotPicker
    {...props}
    pickerProps={{
      ...props.pickerProps,
      granularity: props.pickerProps?.granularity ?? "minute",
    }}
  />
)

export { DatePicker, DateTimePicker }
