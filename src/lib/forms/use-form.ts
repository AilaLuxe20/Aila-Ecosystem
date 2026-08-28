"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { INTERACTION_CONFIG, STORAGE_KEYS } from "@/lib/config/app";
import { toAppError } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/logger/logger";
import { deepEqual, getPath, setPath } from "@/lib/utils/object";
import {
  insertAt as insertArrayItem,
  moveItem as moveArrayItem,
  removeAt as removeArrayItem,
} from "@/lib/utils/array";
import { flattenZodError } from "@/lib/utils/validation";
import { useIsMounted } from "@/hooks/use-mounted";
import { useLatestRef } from "@/hooks/use-latest-ref";

import type {
  FormApi,
  FormErrors,
  FormValues,
  SubmissionStatus,
  TouchedFields,
  FormConfig,
} from "./types";

/**
 * The form engine.
 *
 * A deliberately self-contained implementation rather than a wrapper around a
 * third-party library, because the platform requires draft persistence,
 * autosave, and path-addressed array editing as first-class features rather
 * than as add-ons layered on someone else's state model.
 */

const formLogger = createLogger("forms");

/**
 * Reads a persisted draft.
 *
 * @param key - Draft key.
 * @returns The stored values, or `null` when absent or unreadable.
 */
function readDraft<TValues>(key: string): TValues | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEYS.formDraftPrefix}${key}`);
    return raw === null ? null : (JSON.parse(raw) as TValues);
  } catch {
    return null;
  }
}

/**
 * Writes a draft.
 *
 * @param key - Draft key.
 * @param values - Values to persist.
 */
function writeDraft(key: string, values: unknown): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      `${STORAGE_KEYS.formDraftPrefix}${key}`,
      JSON.stringify(values),
    );
  } catch (error) {
    formLogger.warn("Failed to persist form draft.", { key, error: String(error) });
  }
}

/**
 * Removes a draft.
 *
 * @param key - Draft key.
 */
function deleteDraft(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(`${STORAGE_KEYS.formDraftPrefix}${key}`);
}

/**
 * Creates a fully featured form.
 *
 * Validation is schema-driven: one Zod schema produces every field message via
 * {@link flattenZodError}, whose dot paths line up with the paths used to read
 * and write values. Async validators run afterwards and can only add messages,
 * never clear schema ones.
 *
 * @param config - Initial values, schema, submit handler, and options.
 * @returns The form API.
 *
 * @example
 * const form = useForm({
 *   initialValues: { email: "", password: "" },
 *   schema: signInSchema,
 *   draftKey: "sign-in",
 *   onSubmit: async (values) => { await signIn(values); },
 * });
 */
export function useForm<TValues extends FormValues>(
  config: FormConfig<TValues>,
): FormApi<TValues> {
  const {
    initialValues,
    schema,
    asyncValidators = [],
    validateOn = "blur",
    onSubmit,
    onInvalid,
    resetOnSuccess = false,
    draftKey,
    autosaveIntervalMs = INTERACTION_CONFIG.autosaveIntervalMs,
    onAutosave,
  } = config;

  const [baseline, setBaseline] = useState<TValues>(initialValues);
  const [values, setValuesState] = useState<TValues>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors>({});
  const [touched, setTouchedState] = useState<TouchedFields>({});
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [submitCount, setSubmitCount] = useState(0);
  const [submitError, setSubmitError] = useState<Error | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  const onSubmitRef = useLatestRef(onSubmit);
  const onInvalidRef = useLatestRef(onInvalid);
  const onAutosaveRef = useLatestRef(onAutosave);
  const valuesRef = useLatestRef(values);
  const isMounted = useIsMounted();

  const asyncControllerRef = useRef<AbortController | null>(null);

  // Restore a draft once, after mount. Reading storage during render would
  // desynchronise the server and client markup.
  useEffect(() => {
    if (!draftKey) return;

    const draft = readDraft<TValues>(draftKey);
    if (!draft) return;

    queueMicrotask(() => {
      setValuesState(draft);
      setHasRestoredDraft(true);
    });
    formLogger.debug("Restored form draft.", { draftKey });
  }, [draftKey]);

  const isDirty = useMemo(() => !deepEqual(values, baseline), [values, baseline]);

  // Autosave on an interval rather than on every keystroke: writing to
  // localStorage synchronously blocks the main thread, which is noticeable when
  // it happens on every character.
  useEffect(() => {
    if (!draftKey || !isDirty) return;

    const timer = setInterval(() => {
      writeDraft(draftKey, valuesRef.current);
      onAutosaveRef.current?.(valuesRef.current);
    }, autosaveIntervalMs);

    return () => clearInterval(timer);
  }, [draftKey, isDirty, autosaveIntervalMs, valuesRef, onAutosaveRef]);

  const getValue = useCallback(
    <T = unknown,>(path: string): T => getPath(valuesRef.current, path) as T,
    [valuesRef],
  );

  const runSchema = useCallback(
    (candidate: TValues): FormErrors => {
      if (!schema) return {};

      const parsed = schema.safeParse(candidate);
      return parsed.success ? {} : flattenZodError(parsed.error);
    },
    [schema],
  );

  const runAsyncValidators = useCallback(
    async (candidate: TValues): Promise<FormErrors> => {
      if (asyncValidators.length === 0) return {};

      asyncControllerRef.current?.abort();
      const controller = new AbortController();
      asyncControllerRef.current = controller;

      setIsValidating(true);

      try {
        const results = await Promise.all(
          asyncValidators.map(async (validator) => {
            const message = await validator.validate(candidate, controller.signal);
            return [validator.path, message] as const;
          }),
        );

        if (controller.signal.aborted) return {};

        return Object.fromEntries(
          results.filter((entry): entry is readonly [string, string] => entry[1] !== null),
        );
      } catch (error) {
        if (controller.signal.aborted) return {};
        formLogger.warn("Async validation failed.", { error: String(error) });
        return {};
      } finally {
        if (isMounted() && !controller.signal.aborted) setIsValidating(false);
      }
    },
    [asyncValidators, isMounted],
  );

  const validate = useCallback(async (): Promise<boolean> => {
    const candidate = valuesRef.current;
    const schemaErrors = runSchema(candidate);
    const asyncErrors = await runAsyncValidators(candidate);

    // Schema errors take precedence: an async check on a malformed value is
    // meaningless, so its message must not replace the structural one.
    const combined: FormErrors = { ...asyncErrors, ...schemaErrors };

    if (isMounted()) setErrorsState(combined);
    return Object.keys(combined).length === 0;
  }, [valuesRef, runSchema, runAsyncValidators, isMounted]);

  const validateField = useCallback(
    async (path: string): Promise<boolean> => {
      const schemaErrors = runSchema(valuesRef.current);
      const message = schemaErrors[path];

      setErrorsState((current) => {
        const next = { ...current };
        if (message) next[path] = message;
        else delete next[path];
        return next;
      });

      return message === undefined;
    },
    [runSchema, valuesRef],
  );

  const setValue = useCallback(
    (path: string, value: unknown) => {
      setValuesState((current) => setPath(current, path, value));

      if (validateOn === "change") {
        // Defer so validation reads the committed value rather than the stale one.
        queueMicrotask(() => void validateField(path));
      }
    },
    [validateOn, validateField],
  );

  const setValues = useCallback((partial: Partial<TValues>) => {
    setValuesState((current) => ({ ...current, ...partial }));
  }, []);

  const setError = useCallback((path: string, message: string) => {
    setErrorsState((current) => ({ ...current, [path]: message }));
  }, []);

  const clearErrors = useCallback((path?: string) => {
    setErrorsState((current) => {
      if (path === undefined) return {};
      const next = { ...current };
      delete next[path];
      return next;
    });
  }, []);

  const setTouched = useCallback(
    (path: string, value = true) => {
      setTouchedState((current) => ({ ...current, [path]: value }));
      if (value && validateOn === "blur") void validateField(path);
    },
    [validateOn, validateField],
  );

  const isFieldDirty = useCallback(
    (path: string) => !deepEqual(getPath(valuesRef.current, path), getPath(baseline, path)),
    [valuesRef, baseline],
  );

  const reset = useCallback(
    (next?: TValues) => {
      const target = next ?? initialValues;

      setValuesState(target);
      setBaseline(target);
      setErrorsState({});
      setTouchedState({});
      setStatus("idle");
      setSubmitError(null);
      setHasRestoredDraft(false);

      if (draftKey) deleteDraft(draftKey);
    },
    [initialValues, draftKey],
  );

  const submit = useCallback(
    async (event?: React.FormEvent): Promise<void> => {
      event?.preventDefault();

      setSubmitCount((count) => count + 1);
      setSubmitError(null);

      const schemaErrors = runSchema(valuesRef.current);

      // Touch every failing path so its message becomes visible even if the
      // user never focused that field.
      if (Object.keys(schemaErrors).length > 0) {
        setErrorsState(schemaErrors);
        setTouchedState((current) => ({
          ...current,
          ...Object.fromEntries(Object.keys(schemaErrors).map((path) => [path, true])),
        }));
        setStatus("error");
        onInvalidRef.current?.(schemaErrors);
        return;
      }

      const valid = await validate();
      if (!valid) {
        setStatus("error");
        onInvalidRef.current?.(errors);
        return;
      }

      setStatus("submitting");

      try {
        await onSubmitRef.current(valuesRef.current);
        if (!isMounted()) return;

        setStatus("success");
        if (draftKey) deleteDraft(draftKey);
        if (resetOnSuccess) reset(valuesRef.current);
        else setBaseline(valuesRef.current);
      } catch (caught) {
        if (!isMounted()) return;

        const error = toAppError(caught);
        formLogger.error("Form submission failed.", error);

        setSubmitError(error);
        setStatus("error");
      }
    },
    [
      runSchema,
      valuesRef,
      validate,
      errors,
      onInvalidRef,
      onSubmitRef,
      isMounted,
      draftKey,
      resetOnSuccess,
      reset,
    ],
  );

  const appendItem = useCallback((path: string, item: unknown) => {
    setValuesState((current) => {
      const list = getPath(current, path);
      const array = Array.isArray(list) ? list : [];
      return setPath(current, path, insertArrayItem(array, array.length, item));
    });
  }, []);

  const removeItem = useCallback((path: string, index: number) => {
    setValuesState((current) => {
      const list = getPath(current, path);
      if (!Array.isArray(list)) return current;
      return setPath(current, path, removeArrayItem(list, index));
    });
  }, []);

  const moveItem = useCallback((path: string, from: number, to: number) => {
    setValuesState((current) => {
      const list = getPath(current, path);
      if (!Array.isArray(list)) return current;
      return setPath(current, path, moveArrayItem(list, from, to));
    });
  }, []);

  const clearDraft = useCallback(() => {
    if (draftKey) deleteDraft(draftKey);
    setHasRestoredDraft(false);
  }, [draftKey]);

  useEffect(() => () => asyncControllerRef.current?.abort(), []);

  return {
    values,
    initialValues: baseline,
    errors,
    touched,
    isDirty,
    isValid: Object.keys(errors).length === 0,
    isValidating,
    status,
    submitCount,
    submitError,
    getValue,
    setValue,
    setValues,
    setError,
    setErrors: setErrorsState,
    clearErrors,
    setTouched,
    isFieldDirty,
    validate,
    validateField,
    submit,
    reset,
    appendItem,
    removeItem,
    moveItem,
    clearDraft,
    hasRestoredDraft,
  };
}
