"use client";

/**
 * DateTime Picker — a shadcn/ui-styled date and time picker built on
 * React Aria Components.
 *
 * Exports:
 * - `DatePicker`     — calendar only (day granularity).
 * - `DateTimePicker` — calendar + time columns (minute granularity by default).
 *
 * Values are `DateValue` objects from `@internationalized/date`, not JS
 * `Date`s. Use `parseDate("2026-03-14")` / `parseDateTime("2026-03-14T15:09")`
 * to create one and `value.toString()` to get an ISO string. Always pass
 * `value` (use `null` for empty) — the picker is controlled only.
 *
 * Inside a shadcn `<Field>`, use it like `<Input>`: give it an `id`, point
 * `<FieldLabel htmlFor>` at it, and skip the `label` / `description` /
 * `errorMessage` props. Form libraries (React Hook Form, TanStack Form,
 * Formisch) wire it exactly like shadcn's `<Input>` docs, except `onChange`
 * receives the value directly instead of an event:
 *
 * - React Hook Form: `<DateTimePicker {...field} id="x" aria-invalid={fieldState.invalid} />`
 * - TanStack Form:   `value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur}`
 * - Formisch:        `<DateTimePicker {...field.props} value={field.input ?? null} onChange={field.onChange} />`
 *
 * Validate with a custom schema type, e.g.
 * `z.custom<DateValue | null>().refine((v) => v !== null, "Required")`.
 *
 * Full examples: https://github.com/mrphilipp7/shadcn-datetime-picker#forms
 */

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
} from "react-aria-components";

import { Button as ShadButton } from "@/components/ui/button";

import { ScrollArea as ShadScrollArea } from "@/components/ui/scroll-area";

import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

import React from "react";

import {
  toCalendarDateTime,
  now,
  getLocalTimeZone,
} from "@internationalized/date";

import { DateTimeContext, useDateTime } from "./datetime-picker-context";

/* =========================================================
   TIME SELECTION DATA ARRAYS
   These are used to render scrollable/selectable time units
========================================================= */

const hoursMilitary = Array.from({ length: 24 }, (_, i) => i);
const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 60 }, (_, i) => i);
const seconds = Array.from({ length: 60 }, (_, i) => i);
const AmPm = ["AM", "PM"];

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
>;

type DateTimePickerProps = {
  /**
   * Built-in visible label. When composing with shadcn `<Field>`, omit
   * this and use `<FieldLabel htmlFor={id}>` instead.
   */
  label?: string;
  /** Built-in helper text. With `<Field>`, use `<FieldDescription>` instead. */
  description?: string;
  /** Built-in error text. With `<Field>`, use `<FieldError>` instead. */
  errorMessage?: string;
  /** Applied to the root element. */
  className?: string;
  /**
   * Controlled value, a `DateValue` from `@internationalized/date`
   * (`CalendarDate` for `DatePicker`, `CalendarDateTime` for
   * `DateTimePicker`). Pass `null` when empty; never omit it.
   */
  value?: DateValue | null;
  /**
   * Called with the new value (not an event) on every date or time change,
   * and with `null` when cleared. Pass a form library's setter directly:
   * RHF `field.onChange`, TanStack `field.handleChange`, Formisch
   * `field.onChange`.
   */
  onChange?: (value: DateValue | null) => void;

  /* -------------------------------------------------------
     Form control props — mirror shadcn <Input> so the picker
     drops into <Field> and form library field bindings
     (React Hook Form, TanStack Form, Formisch) unchanged.
  ------------------------------------------------------- */

  /**
   * Pair with `<FieldLabel htmlFor={id}>` to label the picker. Clicking
   * the label focuses the picker. Must be unique on the page.
   */
  id?: string;
  /** Submits the value as an ISO string with native forms. */
  name?: string;
  /**
   * Called when focus leaves the picker. Moving focus into the calendar
   * popover does not count, so opening it won't mark the field touched.
   */
  onBlur?: () => void;
  /** Called when focus enters the picker. */
  onFocus?: () => void;
  /** Focuses the first segment on mount. */
  autoFocus?: boolean;
  /** Disables the picker. Mapped to React Aria's `isDisabled`. */
  disabled?: boolean;
  /**
   * Shows the invalid styling. Set it from the form library's error state,
   * and set `data-invalid` on the surrounding `<Field>` to match.
   */
  "aria-invalid"?: boolean | "true" | "false";
  /**
   * Resolves to the first editable segment, so form libraries can
   * focus the picker when validation fails.
   */
  ref?: React.Ref<HTMLElement>;

  /**
   * Pass-through props to react-aria DatePicker
   * e.g. granularity, minValue, maxValue, hourCycle, etc.
   *
   * @example
   * pickerProps={{ granularity: "second", hourCycle: 24, minValue: today(getLocalTimeZone()) }}
   */
  pickerProps?: PickerProps;
};

/* =========================================================
   EXTERNAL LABEL
   Links a <label htmlFor={id}> rendered outside the picker
   (e.g. shadcn <FieldLabel>). react-aria renders a group, not
   a labelable element, so the browser can't do it natively.
========================================================= */

const getFirstSegment = (group: HTMLElement | null) =>
  group?.querySelector<HTMLElement>('[role="spinbutton"]') ?? null;

function useExternalLabel(
  id: string | undefined,
  groupRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  const [labelId, setLabelId] = React.useState<string>();

  React.useEffect(() => {
    if (!enabled || !id) return;

    const labelEl = Array.from(document.getElementsByTagName("label")).find(
      (el) => el.htmlFor === id,
    );
    if (!labelEl) return;

    if (!labelEl.id) labelEl.id = `${id}-label`;
    setLabelId(labelEl.id);

    // Match native label behavior: clicking it focuses the control
    const focusPicker = () => getFirstSegment(groupRef.current)?.focus();
    labelEl.addEventListener("click", focusPicker);

    return () => {
      labelEl.removeEventListener("click", focusPicker);
      setLabelId(undefined);
    };
  }, [id, enabled, groupRef]);

  return labelId;
}

/* =========================================================
   MAIN COMPONENT
   Date + Time Picker Wrapper
========================================================= */

/**
 * Shared implementation behind `DatePicker` and `DateTimePicker`.
 * Prefer those two exports in app code.
 * @internal
 */
export function SlotPicker({
  id,
  name,
  label,
  description,
  errorMessage,
  className,
  value,
  onChange,
  onBlur,
  onFocus,
  autoFocus,
  disabled,
  "aria-invalid": ariaInvalid,
  ref,
  pickerProps,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const groupRef = React.useRef<HTMLDivElement>(null);

  const externalLabelId = useExternalLabel(id, groupRef, !label);

  React.useImperativeHandle(
    ref,
    () => getFirstSegment(groupRef.current) as HTMLElement,
  );

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
    [value, onChange, pickerProps?.granularity, pickerProps?.hourCycle, isOpen],
  );

  /* ---------------------------------------------------------
     Granularity flags (controls time UI rendering)
  --------------------------------------------------------- */

  const isDayOnly =
    pickerProps?.granularity === "day" || !pickerProps?.granularity;

  const showHour =
    pickerProps?.granularity === "hour" ||
    pickerProps?.granularity === "minute" ||
    pickerProps?.granularity === "second";

  const showMinute =
    pickerProps?.granularity === "minute" ||
    pickerProps?.granularity === "second";

  const showSecond = pickerProps?.granularity === "second";

  const showAmPm = showHour && ctxValue.hourCycle === 12;

  /* ---------------------------------------------------------
     react-aria requires either a visible <Label> or an
     aria-label/aria-labelledby — fall back to a generic
     aria-label when no visible label is provided.
  --------------------------------------------------------- */

  const labelledBy =
    [pickerProps?.["aria-labelledby"], externalLabelId]
      .filter(Boolean)
      .join(" ") || undefined;

  const hasAccessibleLabel = Boolean(
    label || pickerProps?.["aria-label"] || labelledBy,
  );

  // Only force invalid; leaving it undefined keeps react-aria's own
  // validation (minValue, maxValue, isRequired) working.
  const isInvalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    pickerProps?.isInvalid ||
    undefined;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <DateTimeContext.Provider value={ctxValue}>
      <AriaDatePicker
        {...pickerProps}
        {...(!hasAccessibleLabel && { "aria-label": "Date" })}
        id={id ?? pickerProps?.id}
        name={name ?? pickerProps?.name}
        aria-labelledby={labelledBy}
        autoFocus={autoFocus ?? pickerProps?.autoFocus}
        isDisabled={disabled ?? pickerProps?.isDisabled}
        isInvalid={isInvalid}
        onBlur={onBlur ?? pickerProps?.onBlur}
        onFocus={onFocus ?? pickerProps?.onFocus}
        value={value}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        shouldCloseOnSelect={false}
        onChange={(v) => onChange?.(v)}
        className={cn(
          "group/field flex w-full flex-col gap-3 data-[invalid=true]:text-destructive",
          className,
        )}
        shouldForceLeadingZeros={pickerProps?.shouldForceLeadingZeros ?? true}
      >
        {/* =====================================================
            LABEL
        ===================================================== */}
        {label && (
          <Label
            className={cn(
              "flex w-fit items-center gap-2 text-sm leading-snug font-medium select-none",
              "group-data-[disabled=true]/field:opacity-50",
            )}
          >
            {label}
          </Label>
        )}

        {/* =====================================================
            INPUT FIELD
        ===================================================== */}
        <Group
          ref={groupRef}
          className={cn(
            "relative flex h-9 w-full min-w-0 items-center gap-1 rounded-md border border-input bg-transparent py-1 pr-1 pl-2.5 shadow-xs",
            "text-base transition-[color,box-shadow] outline-none md:text-sm dark:bg-input/30",
            "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
            "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
            "data-invalid:border-destructive data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40",
          )}
        >
          <DateInput className="flex w-full min-w-0 items-center gap-0.5 text-foreground">
            {(segment) => (
              <DateSegment
                segment={segment}
                className={cn(
                  "rounded-sm px-0.5 py-0.5 tabular-nums outline-none",
                  "data-placeholder:text-muted-foreground",
                  "focus:bg-accent focus:text-accent-foreground",
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
              "enabled:cursor-pointer",
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
              "text-sm leading-normal font-normal text-muted-foreground",
              "last:mt-0 nth-last-2:-mt-1",
              "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
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
          className={cn(
            "z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden",
            "data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95",
            "data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95",
            "data-[placement=bottom]:slide-in-from-top-2 data-[placement=top]:slide-in-from-bottom-2",
            "data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2",
          )}
          shouldCloseOnInteractOutside={(element) => {
            return !element.closest("[data-datetime-picker]");
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
                    onChange?.(date);
                    setIsOpen(false);
                  } else {
                    const hasExistingTime = value && "hour" in value;
                    const timeSource = hasExistingTime
                      ? value
                      : now(getLocalTimeZone()).set({
                          hour: 0,
                          minute: 0,
                          second: 0,
                        });
                    const toDateTime = toCalendarDateTime(date, timeSource);
                    onChange?.(toDateTime);
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
                          "bg-primary text-primary-foreground",
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
  );
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
  );
};

/* =========================================================
   HOUR / MINUTE / SECOND / AMPM SCROLL COMPONENTS
========================================================= */

/* ------------------ HOUR  ------------------ */
const HourScrollArea = () => {
  const { value, onChange, granularity, hourCycle, isOpen } = useDateTime();
  const selectedRef = React.useRef<HTMLButtonElement | null>(null);

  React.useLayoutEffect(() => {
    if (isOpen) selectedRef.current?.scrollIntoView({ block: "center" });
  }, [isOpen]);

  if (
    granularity !== "hour" &&
    granularity !== "minute" &&
    granularity !== "second"
  ) {
    return null;
  }

  return hourCycle === 24 ? (
    <>
      {[...hoursMilitary].map((hour) => {
        const selected = value && "hour" in value ? value.hour === hour : false;

        return (
          <ShadButton
            key={hour}
            ref={selected ? selectedRef : undefined}
            variant={selected ? "default" : "ghost"}
            className="h-9 w-9"
            onClick={() => {
              if (!value || !("hour" in value)) return;
              onChange(value.set({ hour }));
            }}
          >
            {hour.toString().padStart(2, "0")}
          </ShadButton>
        );
      })}
    </>
  ) : (
    <>
      {[...hours].reverse().map((hour) => {
        const currentHour =
          value && "hour" in value ? ((value.hour + 11) % 12) + 1 : null;
        const selected = currentHour === hour;

        return (
          <ShadButton
            key={hour}
            ref={selected ? selectedRef : undefined}
            variant={selected ? "default" : "ghost"}
            className="h-9 w-9"
            onClick={() => {
              if (!value || !("hour" in value)) return;

              const isPM = value.hour >= 12;
              let normalizedHour = hour % 12;
              if (isPM) normalizedHour += 12;

              onChange(value.set({ hour: normalizedHour }));
            }}
          >
            {hour.toString().padStart(2, "0")}
          </ShadButton>
        );
      })}
    </>
  );
};

/* ---------------- MINUTE ---------------- */
const MinuteScrollArea = () => {
  const { value, onChange, granularity, isOpen } = useDateTime();
  const selectedRef = React.useRef<HTMLButtonElement | null>(null);

  React.useLayoutEffect(() => {
    if (isOpen) selectedRef.current?.scrollIntoView({ block: "center" });
  }, [isOpen]);

  if (granularity !== "minute" && granularity !== "second") return null;

  return (
    <>
      {[...minutes].map((min) => {
        const selected =
          value && "minute" in value ? value.minute === min : false;

        return (
          <ShadButton
            key={min}
            ref={selected ? selectedRef : undefined}
            variant={selected ? "default" : "ghost"}
            className="h-9 w-9"
            onClick={() => {
              if (!value || !("minute" in value)) return;
              onChange(value.set({ minute: min }));
            }}
          >
            {min.toString().padStart(2, "0")}
          </ShadButton>
        );
      })}
    </>
  );
};

/* ---------------- SECOND ---------------- */
const SecondScrollArea = () => {
  const { value, onChange, granularity, isOpen } = useDateTime();
  const selectedRef = React.useRef<HTMLButtonElement | null>(null);

  React.useLayoutEffect(() => {
    if (isOpen) selectedRef.current?.scrollIntoView({ block: "center" });
  }, [isOpen]);

  if (granularity !== "second") return null;

  return (
    <>
      {[...seconds].map((sec) => {
        const selected =
          value && "second" in value ? value.second === sec : false;

        return (
          <ShadButton
            key={sec}
            ref={selected ? selectedRef : undefined}
            variant={selected ? "default" : "ghost"}
            className="h-9 w-9"
            onClick={() => {
              if (!value || !("second" in value)) return;
              onChange(value.set({ second: sec }));
            }}
          >
            {sec.toString().padStart(2, "0")}
          </ShadButton>
        );
      })}
    </>
  );
};

/* ---------------- AM / PM ---------------- */
const AmPmScrollArea = () => {
  const { value, onChange, granularity, hourCycle } = useDateTime();

  if (
    hourCycle !== 12 ||
    (granularity !== "hour" &&
      granularity !== "minute" &&
      granularity !== "second")
  ) {
    return null;
  }

  return (
    <>
      {AmPm.map((ampm) => {
        const selected =
          value && "hour" in value
            ? ampm === "AM"
              ? value.hour < 12
              : value.hour >= 12
            : false;

        return (
          <ShadButton
            key={ampm}
            variant={selected ? "default" : "ghost"}
            className="h-9 w-9"
            onClick={() => {
              if (!value || !("hour" in value)) return;

              let newHour = value.hour;
              if (ampm === "PM" && newHour < 12) newHour += 12;
              if (ampm === "AM" && newHour >= 12) newHour -= 12;

              onChange(value.set({ hour: newHour }));
            }}
          >
            {ampm}
          </ShadButton>
        );
      })}
    </>
  );
};

/* =========================================================
   FOOTER ACTIONS (CLEAR / OK)
========================================================= */

const DialogFooter = () => {
  const { granularity, close, onChange } = useDateTime();

  if (
    granularity !== "hour" &&
    granularity !== "minute" &&
    granularity !== "second"
  ) {
    return null;
  }

  return (
    <footer>
      <div className="my-2 h-px w-full rounded-full bg-border" />
      <div className="flex justify-end gap-2">
        <ShadButton
          variant="ghost"
          className="cursor-pointer"
          onClick={() => {
            onChange(null);
            close();
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
  );
};

/* =========================================================
   EXPORT MAIN COMPONENTS AS DATEPICKER + DATETIMEPICKER
    - DatePicker = day granularity only
    - DateTimePicker = day + time granularity (default: minute)
========================================================= */

/**
 * Date-only picker: segmented input plus a calendar popover. Selecting a
 * day closes the popover. Produces a `CalendarDate` (e.g. `2026-03-14`).
 *
 * @example
 * const [value, setValue] = useState<DateValue | null>(null)
 *
 * <Field>
 *   <FieldLabel htmlFor="birthday">Birthday</FieldLabel>
 *   <DatePicker id="birthday" value={value} onChange={setValue} />
 * </Field>
 */
const DatePicker = (props: DateTimePickerProps) => {
  const invalidGranularity = props.pickerProps?.granularity;

  // Warn if user tries to pass a granularity other than "day"
  React.useEffect(() => {
    if (invalidGranularity && invalidGranularity !== "day") {
      console.warn(
        "DatePicker only supports day granularity. Overriding granularity to 'day'.",
      );
    }
  }, [invalidGranularity]);

  return (
    <SlotPicker
      {...props}
      pickerProps={{
        ...props.pickerProps,
        granularity: "day",
      }}
    />
  );
};

/**
 * Date and time picker: segmented input plus a calendar and scrollable
 * hour / minute / (second) / (AM-PM) columns, with Clear and Ok actions.
 * Produces a `CalendarDateTime` (e.g. `2026-03-14T15:09:00`).
 *
 * Defaults to minute granularity and a 12-hour clock; change with
 * `pickerProps={{ granularity: "hour" | "minute" | "second", hourCycle: 12 | 24 }}`.
 *
 * @example
 * // React Hook Form + shadcn Field
 * <Controller
 *   name="appointment"
 *   control={form.control}
 *   render={({ field, fieldState }) => (
 *     <Field data-invalid={fieldState.invalid}>
 *       <FieldLabel htmlFor="appointment">Appointment</FieldLabel>
 *       <DateTimePicker {...field} id="appointment" aria-invalid={fieldState.invalid} />
 *       {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
 *     </Field>
 *   )}
 * />
 */
const DateTimePicker = (props: DateTimePickerProps) => (
  <SlotPicker
    {...props}
    pickerProps={{
      ...props.pickerProps,
      granularity: props.pickerProps?.granularity ?? "minute",
    }}
  />
);

export { DatePicker, DateTimePicker };
export type { DateTimePickerProps };
