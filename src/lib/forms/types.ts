import type { z } from "zod";

/**
 * Form engine contracts.
 *
 * Values are held as a plain object and addressed by dot path, which is what
 * allows array fields and nested objects to be edited through one uniform API
 * rather than a special case per shape.
 */

/** Any object usable as form values. */
export type FormValues = Record<string, unknown>;

/** Validation messages keyed by dot path. */
export type FormErrors = Readonly<Record<string, string>>;

/** Which paths the user has interacted with, keyed by dot path. */
export type TouchedFields = Readonly<Record<string, boolean>>;

/** Lifecycle of a submission. */
export type SubmissionStatus = "idle" | "submitting" | "success" | "error";

/** State of a form at a point in time. */
export interface FormState<TValues extends FormValues> {
  /** Current values. */
  readonly values: TValues;
  /** Values the form was initialised or last reset with. */
  readonly initialValues: TValues;
  /** Current validation messages. */
  readonly errors: FormErrors;
  /** Paths the user has blurred at least once. */
  readonly touched: TouchedFields;
  /** True when any value differs from its initial value. */
  readonly isDirty: boolean;
  /** True when there are no validation messages. */
  readonly isValid: boolean;
  /** True while async validation is running. */
  readonly isValidating: boolean;
  /** Lifecycle of the most recent submission. */
  readonly status: SubmissionStatus;
  /** How many times submission has been attempted. */
  readonly submitCount: number;
  /** Error from the most recent failed submission. */
  readonly submitError: Error | null;
}

/** When validation runs. */
export type ValidationTrigger = "change" | "blur" | "submit";

/** An async check that cannot be expressed in a Zod schema. */
export interface AsyncValidator<TValues extends FormValues> {
  /** Path the resulting message is attached to. */
  readonly path: string;
  /**
   * Runs the check.
   *
   * @param values - Current form values.
   * @param signal - Aborts when a newer run supersedes this one.
   * @returns An error message, or `null` when valid.
   */
  readonly validate: (values: TValues, signal: AbortSignal) => Promise<string | null>;
  /** Debounce interval before running. Defaults to 400ms. */
  readonly debounceMs?: number;
}

/** Configuration for {@link useForm}. */
export interface FormConfig<TValues extends FormValues> {
  /** Starting values. */
  readonly initialValues: TValues;
  /** Schema validating the whole form. */
  readonly schema?: z.ZodType<unknown>;
  /** Checks that require a round trip, such as uniqueness. */
  readonly asyncValidators?: readonly AsyncValidator<TValues>[];
  /** When validation runs. Defaults to `"blur"`. */
  readonly validateOn?: ValidationTrigger;
  /**
   * Called on a valid submit.
   *
   * Throwing marks the submission failed and surfaces the error.
   */
  readonly onSubmit: (values: TValues) => void | Promise<void>;
  /** Called when submission is attempted with validation errors. */
  readonly onInvalid?: (errors: FormErrors) => void;
  /** Resets the form to the submitted values after success. Defaults to false. */
  readonly resetOnSuccess?: boolean;
  /** Enables draft persistence and autosave under this key. */
  readonly draftKey?: string;
  /** Interval between autosaves, in milliseconds. */
  readonly autosaveIntervalMs?: number;
  /** Called when an autosave writes a draft. */
  readonly onAutosave?: (values: TValues) => void;
}

/** The API returned by {@link useForm}. */
export interface FormApi<TValues extends FormValues> extends FormState<TValues> {
  /** Reads the value at a dot path. */
  readonly getValue: <T = unknown>(path: string) => T;
  /** Writes the value at a dot path. */
  readonly setValue: (path: string, value: unknown) => void;
  /** Merges a partial set of values. */
  readonly setValues: (values: Partial<TValues>) => void;
  /** Sets a validation message on a path. */
  readonly setError: (path: string, message: string) => void;
  /** Replaces every validation message. */
  readonly setErrors: (errors: FormErrors) => void;
  /** Clears the message on a path, or all of them when omitted. */
  readonly clearErrors: (path?: string) => void;
  /** Marks a path as touched. */
  readonly setTouched: (path: string, touched?: boolean) => void;
  /** Reports whether a path differs from its initial value. */
  readonly isFieldDirty: (path: string) => boolean;
  /** Runs validation and reports whether the form is valid. */
  readonly validate: () => Promise<boolean>;
  /** Validates a single path and reports whether it is valid. */
  readonly validateField: (path: string) => Promise<boolean>;
  /** Submits the form. Safe to pass directly to `onSubmit`. */
  readonly submit: (event?: React.FormEvent) => Promise<void>;
  /** Resets to the initial values, or to the values supplied. */
  readonly reset: (values?: TValues) => void;
  /** Appends an item to the array at a path. */
  readonly appendItem: (path: string, item: unknown) => void;
  /** Removes the item at an index from the array at a path. */
  readonly removeItem: (path: string, index: number) => void;
  /** Moves an item within the array at a path. */
  readonly moveItem: (path: string, from: number, to: number) => void;
  /** Discards any persisted draft. */
  readonly clearDraft: () => void;
  /** True when a draft was restored on mount. */
  readonly hasRestoredDraft: boolean;
}
