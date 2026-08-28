"use client";

import { useCallback, useMemo, useState } from "react";

import { clamp } from "@/lib/utils/number";

import type { FormApi, FormValues } from "./types";

/**
 * Multi-step form navigation.
 *
 * A wizard is a view over one form, not several: all values live in a single
 * form state, and each step declares which paths it owns. That is what lets a
 * user move backwards without losing input and lets the final submit validate
 * the whole object at once.
 */

/** One step of a wizard. */
export interface WizardStep<TValues extends FormValues> {
  /** Stable identifier. */
  readonly id: string;
  /** Short name shown in the stepper. */
  readonly label: string;
  /** Supporting detail shown in the stepper. */
  readonly description?: string;
  /** Dot paths this step is responsible for. */
  readonly fields: readonly string[];
  /** Hides the step when it does not apply to the current values. */
  readonly when?: (values: TValues) => boolean;
}

/** Wizard state and controls. */
export interface WizardApi<TValues extends FormValues> {
  /** Steps applicable to the current values, in order. */
  readonly steps: readonly WizardStep<TValues>[];
  /** Zero-based index of the current step. */
  readonly currentIndex: number;
  /** The current step. */
  readonly currentStep: WizardStep<TValues>;
  readonly isFirstStep: boolean;
  readonly isLastStep: boolean;
  /** Fraction of steps completed, from 0 to 1. */
  readonly progress: number;
  /** Validates the current step and advances when it passes. */
  readonly next: () => Promise<boolean>;
  /** Returns to the previous step without validating. */
  readonly previous: () => void;
  /** Jumps to a step. Forward jumps validate every step in between. */
  readonly goTo: (index: number) => Promise<boolean>;
  /** Validates only the fields owned by the current step. */
  readonly validateCurrentStep: () => Promise<boolean>;
}

/**
 * Adds step navigation to a form.
 *
 * `next` validates only the current step's fields, so a user is never blocked
 * by an error on a step they have not reached.
 *
 * @param form - The form being stepped through.
 * @param steps - Step definitions, in order.
 * @returns The wizard API.
 *
 * @example
 * const form = useForm({ initialValues, schema, onSubmit });
 * const wizard = useWizard(form, steps);
 * <Stepper steps={wizard.steps} activeStep={wizard.currentIndex} />
 */
export function useWizard<TValues extends FormValues>(
  form: FormApi<TValues>,
  steps: readonly WizardStep<TValues>[],
): WizardApi<TValues> {
  const [currentIndex, setCurrentIndex] = useState(0);

  const applicableSteps = useMemo(
    () => steps.filter((step) => step.when?.(form.values) ?? true),
    [steps, form.values],
  );

  const safeIndex = clamp(currentIndex, 0, Math.max(0, applicableSteps.length - 1));
  const currentStep = applicableSteps[safeIndex];

  const validateStep = useCallback(
    async (step: WizardStep<TValues>): Promise<boolean> => {
      const results = await Promise.all(step.fields.map((path) => form.validateField(path)));

      // Touch every field on the step so any failure becomes visible, even for
      // fields the user skipped past without focusing.
      for (const path of step.fields) form.setTouched(path);

      return results.every(Boolean);
    },
    [form],
  );

  const validateCurrentStep = useCallback(
    () => (currentStep ? validateStep(currentStep) : Promise.resolve(true)),
    [currentStep, validateStep],
  );

  const next = useCallback(async (): Promise<boolean> => {
    if (!currentStep) return false;

    const valid = await validateStep(currentStep);
    if (!valid) return false;

    setCurrentIndex((index) => Math.min(index + 1, applicableSteps.length - 1));
    return true;
  }, [currentStep, validateStep, applicableSteps.length]);

  const previous = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, []);

  const goTo = useCallback(
    async (target: number): Promise<boolean> => {
      const destination = clamp(target, 0, applicableSteps.length - 1);

      // Moving backwards is always allowed; moving forwards must clear every
      // step being skipped over.
      if (destination <= safeIndex) {
        setCurrentIndex(destination);
        return true;
      }

      for (let index = safeIndex; index < destination; index += 1) {
        const step = applicableSteps[index];
        if (!step) continue;

        const valid = await validateStep(step);
        if (!valid) {
          setCurrentIndex(index);
          return false;
        }
      }

      setCurrentIndex(destination);
      return true;
    },
    [applicableSteps, safeIndex, validateStep],
  );

  return {
    steps: applicableSteps,
    currentIndex: safeIndex,
    currentStep,
    isFirstStep: safeIndex === 0,
    isLastStep: safeIndex === applicableSteps.length - 1,
    progress: applicableSteps.length === 0 ? 0 : (safeIndex + 1) / applicableSteps.length,
    next,
    previous,
    goTo,
    validateCurrentStep,
  };
}
