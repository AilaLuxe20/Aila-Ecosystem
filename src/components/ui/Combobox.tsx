"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { toggleItem } from "@/lib/utils/array";
import { useControllableState } from "@/hooks/use-controllable-state";

import { Chip } from "./Badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./Command";
import { useFieldControl } from "./Field";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { fieldBase, focusRing, type ControlSize } from "./variants";

/** A selectable option. */
export interface ComboboxOption {
  /** Value stored when the option is chosen. */
  readonly value: string;
  /** Visible text. */
  readonly label: string;
  /** Supporting text shown beneath the label. */
  readonly description?: string;
  /** Icon rendered before the label. */
  readonly icon?: React.ReactNode;
  /** Prevents selection. */
  readonly disabled?: boolean;
  /** Groups the option under a heading. */
  readonly group?: string;
}

/** Props shared by the single and multi-select variants. */
interface ComboboxBaseProps {
  /** The options to choose from. */
  readonly options: readonly ComboboxOption[];
  /** Text shown when nothing is selected. */
  readonly placeholder?: string;
  /** Placeholder for the filter field. */
  readonly searchPlaceholder?: string;
  /** Message shown when the filter matches nothing. */
  readonly emptyMessage?: string;
  /** Control height. Defaults to `"md"`. */
  readonly size?: ControlSize;
  /** Marks the control invalid. */
  readonly invalid?: boolean;
  /** Prevents interaction. */
  readonly disabled?: boolean;
  /** Additional classes for the trigger. */
  readonly className?: string;
}

/** Props for {@link Combobox}. */
export interface ComboboxProps extends ComboboxBaseProps {
  /** Controlled value. */
  readonly value?: string | null;
  /** Initial value when uncontrolled. */
  readonly defaultValue?: string | null;
  /** Called when the selection changes. */
  readonly onValueChange?: (value: string | null) => void;
  /** Allows clearing the selection by re-selecting the current option. */
  readonly clearable?: boolean;
}

/**
 * Groups options by their `group` field, preserving declaration order.
 *
 * @param options - The options to group.
 * @returns Entries of group heading to options. Ungrouped options use `""`.
 */
function groupOptions(
  options: readonly ComboboxOption[],
): ReadonlyArray<readonly [string, readonly ComboboxOption[]]> {
  const groups = new Map<string, ComboboxOption[]>();

  for (const option of options) {
    const key = option.group ?? "";
    const bucket = groups.get(key);
    if (bucket) bucket.push(option);
    else groups.set(key, [option]);
  }

  return [...groups.entries()];
}

/**
 * A searchable single-select control.
 *
 * Unlike {@link Select}, the option list is filterable, which is what makes it
 * usable past roughly a dozen options.
 *
 * @param props - Options, value, and presentation settings.
 * @returns The combobox control.
 *
 * @example
 * <Combobox options={countries} value={country} onValueChange={setCountry} />
 */
export function Combobox({
  options,
  value,
  defaultValue = null,
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search…",
  emptyMessage = "No results found.",
  size = "md",
  invalid,
  disabled,
  clearable = false,
  className,
}: ComboboxProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useControllableState<string | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const field = useFieldControl({ invalid, disabled });
  const isInvalid = field["aria-invalid"] ?? false;

  const current = useMemo(
    () => options.find((option) => option.value === selected) ?? null,
    [options, selected],
  );

  const handleSelect = useCallback(
    (next: string) => {
      setSelected(clearable && next === selected ? null : next);
      setOpen(false);
    },
    [setSelected, clearable, selected],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={field.id}
        role="combobox"
        aria-expanded={open}
        aria-describedby={field["aria-describedby"]}
        disabled={field.disabled}
        className={cn(
          fieldBase({ size, invalid: isInvalid }),
          "flex items-center justify-between gap-2 text-start",
          className,
        )}
      >
        <span className={cn("flex min-w-0 items-center gap-2 truncate", !current && "text-white/30")}>
          {current?.icon ? (
            <span className="shrink-0 text-white/45 [&_svg]:size-4">{current.icon}</span>
          ) : null}
          {current?.label ?? placeholder}
        </span>

        <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-white/35" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />

          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>

            {groupOptions(options).map(([heading, groupItems]) => (
              <CommandGroup key={heading || "ungrouped"} heading={heading || undefined}>
                {groupItems.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.description ?? ""}`}
                    disabled={option.disabled}
                    icon={option.icon}
                    description={option.description}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <span className="flex-1">{option.label}</span>
                    {option.value === selected ? (
                      <Check aria-hidden className="size-4 text-brand-400" />
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Props for {@link MultiSelect}. */
export interface MultiSelectProps extends ComboboxBaseProps {
  /** Controlled values. */
  readonly value?: readonly string[];
  /** Initial values when uncontrolled. */
  readonly defaultValue?: readonly string[];
  /** Called when the selection changes. */
  readonly onValueChange?: (value: readonly string[]) => void;
  /** How many chips to show before collapsing into a count. Defaults to 3. */
  readonly maxVisibleChips?: number;
}

/**
 * A searchable multi-select control.
 *
 * Selections render as removable chips in the trigger. The popover stays open
 * while selecting, since choosing several values is the expected flow.
 *
 * @param props - Options, values, and presentation settings.
 * @returns The multi-select control.
 *
 * @example
 * <MultiSelect options={tags} value={selected} onValueChange={setSelected} />
 */
export function MultiSelect({
  options,
  value,
  defaultValue = [],
  onValueChange,
  placeholder = "Select options",
  searchPlaceholder = "Search…",
  emptyMessage = "No results found.",
  size = "md",
  invalid,
  disabled,
  maxVisibleChips = 3,
  className,
}: MultiSelectProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useControllableState<readonly string[]>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const field = useFieldControl({ invalid, disabled });
  const isInvalid = field["aria-invalid"] ?? false;

  const selectedOptions = useMemo(
    () => options.filter((option) => selected.includes(option.value)),
    [options, selected],
  );

  const visible = selectedOptions.slice(0, maxVisibleChips);
  const overflow = selectedOptions.length - visible.length;

  const toggle = useCallback(
    (optionValue: string) => setSelected(toggleItem([...selected], optionValue)),
    [setSelected, selected],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={field.id}
        role="combobox"
        aria-expanded={open}
        aria-describedby={field["aria-describedby"]}
        disabled={field.disabled}
        className={cn(
          fieldBase({ size, invalid: isInvalid }),
          "flex h-auto min-h-9 items-center justify-between gap-2 py-1.5 text-start",
          className,
        )}
      >
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {selectedOptions.length === 0 ? (
            <span className="text-white/30">{placeholder}</span>
          ) : (
            <>
              {visible.map((option) => (
                <Chip
                  key={option.value}
                  size="sm"
                  tone="brand"
                  onRemove={() => toggle(option.value)}
                  removeLabel={`Remove ${option.label}`}
                >
                  {option.label}
                </Chip>
              ))}

              {overflow > 0 ? (
                <span className="text-xs text-white/45">+{overflow} more</span>
              ) : null}
            </>
          )}
        </span>

        <span className="flex shrink-0 items-center gap-1">
          {selectedOptions.length > 0 ? (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear all selections"
              onClick={(event) => {
                event.stopPropagation();
                setSelected([]);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                event.stopPropagation();
                setSelected([]);
              }}
              className={cn("rounded p-0.5 text-white/35 hover:text-white", focusRing)}
            >
              <X aria-hidden className="size-3.5" />
            </span>
          ) : null}

          <ChevronsUpDown aria-hidden className="size-4 text-white/35" />
        </span>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />

          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>

            {groupOptions(options).map(([heading, groupItems]) => (
              <CommandGroup key={heading || "ungrouped"} heading={heading || undefined}>
                {groupItems.map((option) => {
                  const isSelected = selected.includes(option.value);

                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.description ?? ""}`}
                      disabled={option.disabled}
                      icon={option.icon}
                      description={option.description}
                      onSelect={() => toggle(option.value)}
                    >
                      <span className="flex-1">{option.label}</span>
                      <span
                        className={cn(
                          "grid size-4 place-items-center rounded-[0.25rem] border",
                          isSelected
                            ? "border-brand-500 bg-brand-500 text-brand-950"
                            : "border-hairline-strong",
                        )}
                      >
                        {isSelected ? (
                          <Check aria-hidden className="size-3" strokeWidth={3} />
                        ) : null}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
