"use client";

import { Eye, EyeOff, Search, X } from "lucide-react";
import { forwardRef, useId, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { scorePasswordStrength, type PasswordStrength } from "@/lib/utils/validation";

import { useFieldControl } from "./Field";
import { fieldBase, focusRing, type ControlSize } from "./variants";

/** Props shared by every text-entry control. */
interface TextControlBaseProps {
  /** Control height and text size. Defaults to `"md"`. */
  readonly size?: ControlSize;
  /** Marks the control invalid, overriding the enclosing field. */
  readonly invalid?: boolean;
}

/** Props for {@link Input}. */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    TextControlBaseProps {
  /** Element rendered inside the control, before the text. */
  readonly leadingIcon?: React.ReactNode;
  /** Element rendered inside the control, after the text. */
  readonly trailingIcon?: React.ReactNode;
}

/** Horizontal padding added when an icon occupies one side. */
const ICON_PADDING: Record<ControlSize, { leading: string; trailing: string }> = {
  xs: { leading: "ps-7", trailing: "pe-7" },
  sm: { leading: "ps-8", trailing: "pe-8" },
  md: { leading: "ps-9", trailing: "pe-9" },
  lg: { leading: "ps-11", trailing: "pe-11" },
};

/**
 * A single-line text input.
 *
 * When rendered inside a {@link Field} it inherits the field's ID, description,
 * and error wiring automatically.
 *
 * @param props - Size, icons, validity, and input attributes.
 * @returns The input element, wrapped when icons are present.
 *
 * @example
 * <Input placeholder="Search" leadingIcon={<Search />} />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, size = "md", invalid, leadingIcon, trailingIcon, disabled, required, ...props },
  ref,
) {
  const field = useFieldControl({ invalid, required, disabled, id: props.id });
  const isInvalid = field["aria-invalid"] ?? false;

  const control = (
    <input
      ref={ref}
      className={cn(
        fieldBase({ size, invalid: isInvalid }),
        leadingIcon && ICON_PADDING[size].leading,
        trailingIcon && ICON_PADDING[size].trailing,
        className,
      )}
      {...field}
      {...props}
    />
  );

  if (!leadingIcon && !trailingIcon) return control;

  return (
    <div className="relative w-full">
      {leadingIcon ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 start-0 grid w-9 place-items-center text-white/35 [&_svg]:size-4"
        >
          {leadingIcon}
        </span>
      ) : null}

      {control}

      {trailingIcon ? (
        <span className="absolute inset-y-0 end-0 grid w-9 place-items-center text-white/35 [&_svg]:size-4">
          {trailingIcon}
        </span>
      ) : null}
    </div>
  );
});

/** Props for {@link SearchInput}. */
export interface SearchInputProps extends Omit<InputProps, "leadingIcon" | "type"> {
  /** Invoked when the clear control is pressed. */
  readonly onClear?: () => void;
}

/**
 * A text input styled for search, with a clear control once text is present.
 *
 * Uses `type="search"` so mobile keyboards show a Search action key.
 *
 * @param props - Clear handler plus input attributes.
 * @returns The search input.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { onClear, value, className, ...props },
  ref,
) {
  const hasValue = typeof value === "string" && value.length > 0;

  return (
    <Input
      ref={ref}
      type="search"
      value={value}
      leadingIcon={<Search />}
      className={cn("[&::-webkit-search-cancel-button]:appearance-none", className)}
      trailingIcon={
        hasValue && onClear ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className={cn("pointer-events-auto rounded p-0.5 hover:text-white", focusRing)}
          >
            <X aria-hidden className="size-3.5" />
          </button>
        ) : undefined
      }
      {...props}
    />
  );
});

/** Props for {@link PasswordInput}. */
export interface PasswordInputProps extends Omit<InputProps, "type" | "trailingIcon"> {
  /** Renders a strength meter beneath the control. */
  readonly showStrength?: boolean;
}

/** Labels and bar colours for each strength score. */
const STRENGTH_META: Record<PasswordStrength, { label: string; className: string }> = {
  0: { label: "Too weak", className: "bg-danger" },
  1: { label: "Weak", className: "bg-danger" },
  2: { label: "Fair", className: "bg-warning" },
  3: { label: "Good", className: "bg-info" },
  4: { label: "Strong", className: "bg-success" },
};

/**
 * A password input with a visibility toggle and optional strength meter.
 *
 * The toggle is `aria-pressed` rather than a checkbox, and the strength meter
 * is announced politely so a screen reader hears the rating change without
 * being interrupted mid-word on every keystroke.
 *
 * @param props - Strength meter flag plus input attributes.
 * @returns The password input.
 *
 * @example
 * <PasswordInput showStrength value={password} onChange={onChange} />
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ showStrength = false, value, className, ...props }, ref) {
    const [revealed, setRevealed] = useState(false);
    const meterId = useId();

    const text = typeof value === "string" ? value : "";
    const score = scorePasswordStrength(text);
    const meta = STRENGTH_META[score];

    return (
      <div className="w-full space-y-1.5">
        <Input
          ref={ref}
          type={revealed ? "text" : "password"}
          value={value}
          autoComplete="current-password"
          aria-describedby={showStrength && text.length > 0 ? meterId : undefined}
          className={className}
          trailingIcon={
            <button
              type="button"
              onClick={() => setRevealed((current) => !current)}
              aria-label={revealed ? "Hide password" : "Show password"}
              aria-pressed={revealed}
              className={cn("pointer-events-auto rounded p-0.5 hover:text-white", focusRing)}
            >
              {revealed ? (
                <EyeOff aria-hidden className="size-4" />
              ) : (
                <Eye aria-hidden className="size-4" />
              )}
            </button>
          }
          {...props}
        />

        {showStrength && text.length > 0 ? (
          <div id={meterId} aria-live="polite" className="space-y-1">
            <div className="flex gap-1" aria-hidden>
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-normal",
                    index < score ? meta.className : "bg-white/10",
                  )}
                />
              ))}
            </div>
            <p className="text-2xs text-white/45">Password strength: {meta.label}</p>
          </div>
        ) : null}
      </div>
    );
  },
);

/** Props for {@link Textarea}. */
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    TextControlBaseProps {
  /** Grows the control to fit its content instead of scrolling. */
  readonly autoResize?: boolean;
  /** Renders a live character count against `maxLength`. */
  readonly showCount?: boolean;
}

/**
 * A multi-line text input.
 *
 * With `autoResize`, the height is reset to `auto` before reading
 * `scrollHeight` — without that reset the element can only ever grow, never
 * shrink when text is deleted.
 *
 * @param props - Auto-resize, character count, and textarea attributes.
 * @returns The textarea element.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    className,
    size = "md",
    invalid,
    autoResize = false,
    showCount = false,
    maxLength,
    value,
    onChange,
    disabled,
    required,
    rows = 3,
    ...props
  },
  ref,
) {
  const field = useFieldControl({ invalid, required, disabled, id: props.id });
  const isInvalid = field["aria-invalid"] ?? false;
  const length = typeof value === "string" ? value.length : 0;

  return (
    <div className="w-full space-y-1">
      <textarea
        ref={ref}
        rows={rows}
        maxLength={maxLength}
        value={value}
        onChange={(event) => {
          if (autoResize) {
            const element = event.currentTarget;
            element.style.height = "auto";
            element.style.height = `${element.scrollHeight}px`;
          }
          onChange?.(event);
        }}
        className={cn(
          fieldBase({ size, invalid: isInvalid }),
          "min-h-[calc(var(--spacing)*20)] resize-y py-2 leading-relaxed",
          autoResize && "resize-none overflow-hidden",
          className,
        )}
        {...field}
        {...props}
      />

      {showCount && maxLength ? (
        <p
          aria-live="polite"
          className={cn(
            "text-end text-2xs",
            length >= maxLength ? "text-danger" : "text-white/40",
          )}
        >
          {length} / {maxLength}
        </p>
      ) : null}
    </div>
  );
});
