"use client";

import { createContext, useContext, useMemo } from "react";

import { Field } from "@/components/ui/Field";

import type { FormApi, FormValues } from "./types";

/**
 * Form context and the field registry.
 *
 * {@link FormField} is the registry: it is the single place that binds a design
 * system control to a path in the form state, which is why no component in the
 * design system needs to know the form engine exists.
 */

const FormContext = createContext<FormApi<FormValues> | null>(null);

/**
 * Accesses the enclosing form.
 *
 * @returns The form API.
 * @throws {Error} When used outside a {@link FormProvider}.
 */
export function useFormContext<TValues extends FormValues>(): FormApi<TValues> {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider.");
  }

  return context as unknown as FormApi<TValues>;
}

/** Props for {@link FormProvider}. */
export interface FormProviderProps<TValues extends FormValues> {
  /** The form returned by `useForm`. */
  readonly form: FormApi<TValues>;
  readonly children: React.ReactNode;
}

/**
 * Makes a form available to descendants.
 *
 * @param props - The form and its children.
 * @returns The provider element.
 */
export function FormProvider<TValues extends FormValues>({
  form,
  children,
}: FormProviderProps<TValues>): React.JSX.Element {
  return (
    <FormContext.Provider value={form as unknown as FormApi<FormValues>}>
      {children}
    </FormContext.Provider>
  );
}

/** Props passed to a {@link FormField} render function. */
export interface FieldRenderProps<T> {
  /** Current value at the path. */
  readonly value: T;
  /** Writes a new value. */
  readonly onChange: (value: T) => void;
  /** Marks the field touched, triggering blur validation. */
  readonly onBlur: () => void;
  /** Element ID, matching the label's `htmlFor`. */
  readonly id: string;
  /** Current validation message, if the field has been touched. */
  readonly error: string | undefined;
  /** True when the value differs from its initial value. */
  readonly isDirty: boolean;
  /** True when the field has been blurred at least once. */
  readonly isTouched: boolean;
}

/** Props for {@link FormField}. */
export interface FormFieldProps<T> {
  /** Dot path into the form values. */
  readonly name: string;
  /** Visible label. */
  readonly label?: React.ReactNode;
  /** Helper text shown beneath the control. */
  readonly description?: React.ReactNode;
  /** Marks the field required in the label and to assistive technology. */
  readonly required?: boolean;
  /** Renders the control. */
  readonly children: (props: FieldRenderProps<T>) => React.ReactNode;
}

/**
 * Binds a control to a path in the enclosing form.
 *
 * Errors are shown only after a field has been touched or a submit has been
 * attempted — surfacing "required" the moment a form renders is noise, not
 * feedback.
 *
 * @param props - Path, label, and a render function for the control.
 * @returns The wired field.
 *
 * @example
 * <FormField<string> name="email" label="Email" required>
 *   {({ value, onChange, onBlur, id }) => (
 *     <Input id={id} value={value} onBlur={onBlur} onChange={(e) => onChange(e.target.value)} />
 *   )}
 * </FormField>
 */
export function FormField<T>({
  name,
  label,
  description,
  required,
  children,
}: FormFieldProps<T>): React.JSX.Element {
  const form = useFormContext();

  const value = form.getValue<T>(name);
  const isTouched = form.touched[name] === true;
  const showError = isTouched || form.submitCount > 0;
  const error = showError ? form.errors[name] : undefined;

  const renderProps = useMemo<FieldRenderProps<T>>(
    () => ({
      value,
      onChange: (next: T) => form.setValue(name, next),
      onBlur: () => form.setTouched(name),
      id: `form-${name.replace(/\./g, "-")}`,
      error,
      isDirty: form.isFieldDirty(name),
      isTouched,
    }),
    [value, form, name, error, isTouched],
  );

  return (
    <Field
      label={label}
      description={description}
      error={error}
      required={required}
      htmlFor={renderProps.id}
    >
      {children(renderProps)}
    </Field>
  );
}

/** Props for {@link FieldArray}. */
export interface FieldArrayProps<T> {
  /** Dot path to the array. */
  readonly name: string;
  /** Renders the list and its controls. */
  readonly children: (api: {
    /** Current items. */
    readonly items: readonly T[];
    /** Appends an item. */
    readonly append: (item: T) => void;
    /** Removes the item at an index. */
    readonly remove: (index: number) => void;
    /** Reorders an item. */
    readonly move: (from: number, to: number) => void;
    /** Builds the dot path to a field within an item. */
    readonly pathFor: (index: number, field?: string) => string;
  }) => React.ReactNode;
}

/**
 * Manages a repeating group of fields.
 *
 * `pathFor` produces the dot paths for nested controls, so each row's fields
 * bind to the correct index without the caller constructing path strings.
 *
 * @param props - Array path and a render function.
 * @returns The rendered list.
 *
 * @example
 * <FieldArray<Recipient> name="recipients">
 *   {({ items, append, remove, pathFor }) => (
 *     <>
 *       {items.map((_, index) => (
 *         <FormField key={index} name={pathFor(index, "email")} label="Email">
 *           {(field) => <Input value={String(field.value)} onChange={(e) => field.onChange(e.target.value)} />}
 *         </FormField>
 *       ))}
 *       <Button onClick={() => append({ email: "" })}>Add recipient</Button>
 *     </>
 *   )}
 * </FieldArray>
 */
export function FieldArray<T>({ name, children }: FieldArrayProps<T>): React.JSX.Element {
  const form = useFormContext();
  const raw = form.getValue<readonly T[] | undefined>(name);
  const items = Array.isArray(raw) ? raw : [];

  return (
    <>
      {children({
        items,
        append: (item) => form.appendItem(name, item),
        remove: (index) => form.removeItem(name, index),
        move: (from, to) => form.moveItem(name, from, to),
        pathFor: (index, field) => (field ? `${name}.${index}.${field}` : `${name}.${index}`),
      })}
    </>
  );
}

/** Props for {@link ConditionalField}. */
export interface ConditionalFieldProps {
  /** Decides whether the children render, given the current values. */
  readonly when: (values: FormValues) => boolean;
  readonly children: React.ReactNode;
}

/**
 * Renders its children only when a condition over the form values holds.
 *
 * @param props - The predicate and the children to gate.
 * @returns The children, or nothing.
 *
 * @example
 * <ConditionalField when={(values) => values.billingType === "company"}>
 *   <FormField name="vatNumber" label="VAT number">{…}</FormField>
 * </ConditionalField>
 */
export function ConditionalField({ when, children }: ConditionalFieldProps): React.ReactNode {
  const form = useFormContext();
  return when(form.values) ? children : null;
}
