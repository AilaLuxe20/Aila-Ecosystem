"use client";

import { Label as LabelPrimitive } from "radix-ui";
import { createContext, forwardRef, useContext, useId } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Field scaffolding: label, description, error, and the wiring that connects
 * them to a control.
 *
 * Accessible field markup requires several IDs to line up — `id`,
 * `aria-describedby`, `aria-invalid`, `aria-errormessage`. Getting that right
 * by hand at every call site is where accessibility bugs come from, so
 * {@link Field} generates the IDs once and {@link useFieldControl} hands the
 * correct attributes to the control.
 */

/** Values shared between a field and its control. */
interface FieldContextValue {
  readonly controlId: string;
  readonly descriptionId: string;
  readonly errorId: string;
  readonly hasError: boolean;
  readonly hasDescription: boolean;
  readonly required: boolean;
  readonly disabled: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * Reads the enclosing field context.
 *
 * @returns The context, or `null` when the control is used standalone.
 */
export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext);
}

/** ARIA attributes a control should spread onto itself. */
export interface FieldControlAttributes {
  readonly id: string | undefined;
  readonly "aria-describedby": string | undefined;
  readonly "aria-invalid": boolean | undefined;
  readonly "aria-required": boolean | undefined;
  readonly disabled: boolean | undefined;
}

/**
 * Produces the ARIA attributes linking a control to its field.
 *
 * Falls back to the control's own props when rendered outside a {@link Field},
 * so every control works standalone.
 *
 * @param overrides - Props supplied directly to the control.
 * @returns Attributes to spread onto the control element.
 */
export function useFieldControl(
  overrides: {
    id?: string;
    describedBy?: string;
    invalid?: boolean;
    required?: boolean;
    disabled?: boolean;
  } = {},
): FieldControlAttributes {
  const field = useFieldContext();

  const describedBy =
    [
      field?.hasDescription ? field.descriptionId : null,
      field?.hasError ? field.errorId : null,
      overrides.describedBy ?? null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return {
    id: overrides.id ?? field?.controlId,
    "aria-describedby": describedBy,
    "aria-invalid": overrides.invalid ?? field?.hasError ? true : undefined,
    "aria-required": overrides.required ?? field?.required ? true : undefined,
    disabled: overrides.disabled ?? field?.disabled,
  };
}

/** Props for {@link Field}. */
export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visible label text. */
  readonly label?: React.ReactNode;
  /** Helper text shown beneath the control. */
  readonly description?: React.ReactNode;
  /** Validation message. Its presence marks the control invalid. */
  readonly error?: React.ReactNode;
  /** Marks the field required and appends an indicator to the label. */
  readonly required?: boolean;
  /** Disables the label styling and the control. */
  readonly disabled?: boolean;
  /** Explicit control ID. Generated when omitted. */
  readonly htmlFor?: string;
}

/**
 * Wraps a control with its label, description, and error message.
 *
 * The error replaces the description rather than stacking beneath it, so the
 * field never grows taller when validation fails and the layout stays stable.
 *
 * @param props - Label, description, error, and div attributes.
 * @returns The field wrapper.
 *
 * @example
 * <Field label="Email" error={errors.email} required>
 *   <Input type="email" />
 * </Field>
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  {
    label,
    description,
    error,
    required = false,
    disabled = false,
    htmlFor,
    className,
    children,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const controlId = htmlFor ?? `field-${generatedId}`;

  const context: FieldContextValue = {
    controlId,
    descriptionId: `${controlId}-description`,
    errorId: `${controlId}-error`,
    hasError: Boolean(error),
    hasDescription: Boolean(description) && !error,
    required,
    disabled,
  };

  return (
    <FieldContext.Provider value={context}>
      <div ref={ref} className={cn("flex w-full flex-col gap-1.5", className)} {...props}>
        {label ? (
          <FieldLabel htmlFor={controlId} required={required} disabled={disabled}>
            {label}
          </FieldLabel>
        ) : null}

        {children}

        {error ? (
          <p id={context.errorId} role="alert" className="text-xs text-danger">
            {error}
          </p>
        ) : description ? (
          <p id={context.descriptionId} className="text-xs text-white/45">
            {description}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
});

/** Props for {@link FieldLabel}. */
export interface FieldLabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  /** Appends a required indicator. */
  readonly required?: boolean;
  /** Dims the label to match a disabled control. */
  readonly disabled?: boolean;
}

/**
 * A form label bound to a control.
 *
 * @param props - Required and disabled flags plus label attributes.
 * @returns The label element.
 */
export const FieldLabel = forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  FieldLabelProps
>(function FieldLabel({ className, required, disabled, children, ...props }, ref) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-xs font-medium text-white/70 select-none",
        disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span aria-hidden className="ms-0.5 text-danger">
          *
        </span>
      ) : null}
    </LabelPrimitive.Root>
  );
});
