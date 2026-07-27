import { DEFAULT_LOCALE, getNumberFormatter } from "./format";
import { roundTo } from "./number";

/** ISO 4217 currency codes supported by the platform. */
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "AUD", "CAD", "AED", "ZAR"] as const;

/** A supported ISO 4217 currency code. */
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

/** A monetary amount stored in the currency's minor unit (e.g. cents). */
export interface Money {
  /** Amount in minor units. Integer to avoid floating-point drift. */
  readonly amount: number;
  readonly currency: CurrencyCode;
}

/** Number of minor units per major unit, per currency. */
const MINOR_UNITS: Record<CurrencyCode, number> = {
  USD: 100,
  EUR: 100,
  GBP: 100,
  AUD: 100,
  CAD: 100,
  AED: 100,
  ZAR: 100,
};

/**
 * Reports whether a string is a supported currency code.
 *
 * @param value - Candidate code.
 * @returns True when the code is supported.
 */
export function isCurrencyCode(value: string): value is CurrencyCode {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

/**
 * Creates a `Money` value from a major-unit amount, e.g. `12.34` dollars.
 *
 * @param majorUnits - Amount in major units.
 * @param currency - ISO 4217 currency code.
 * @returns A `Money` value stored in minor units.
 */
export function money(majorUnits: number, currency: CurrencyCode): Money {
  return {
    amount: Math.round(majorUnits * MINOR_UNITS[currency]),
    currency,
  };
}

/**
 * Converts a `Money` value to major units.
 *
 * @param value - Monetary amount.
 * @returns The amount in major units.
 */
export function toMajorUnits(value: Money): number {
  return roundTo(value.amount / MINOR_UNITS[value.currency], 2);
}

/**
 * Formats a `Money` value for display.
 *
 * @param value - Monetary amount.
 * @param locale - BCP 47 locale tag.
 * @param options - Additional `Intl.NumberFormat` overrides.
 * @returns The formatted currency string.
 */
export function formatMoney(
  value: Money,
  locale: string = DEFAULT_LOCALE,
  options: Intl.NumberFormatOptions = {},
): string {
  return getNumberFormatter(locale, {
    style: "currency",
    currency: value.currency,
    ...options,
  }).format(toMajorUnits(value));
}

/**
 * Formats a plain number as currency without requiring a `Money` value.
 *
 * @param majorUnits - Amount in major units.
 * @param currency - ISO 4217 currency code.
 * @param locale - BCP 47 locale tag.
 * @returns The formatted currency string.
 */
export function formatCurrency(
  majorUnits: number,
  currency: CurrencyCode = "USD",
  locale: string = DEFAULT_LOCALE,
): string {
  return getNumberFormatter(locale, { style: "currency", currency }).format(majorUnits);
}

/**
 * Formats a monetary amount using compact notation, e.g. `$1.2M`.
 *
 * @param majorUnits - Amount in major units.
 * @param currency - ISO 4217 currency code.
 * @param locale - BCP 47 locale tag.
 * @returns The compact currency string.
 */
export function formatCurrencyCompact(
  majorUnits: number,
  currency: CurrencyCode = "USD",
  locale: string = DEFAULT_LOCALE,
): string {
  return getNumberFormatter(locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(majorUnits);
}

/**
 * Adds two monetary amounts of the same currency.
 *
 * @param left - First amount.
 * @param right - Second amount.
 * @returns The sum.
 * @throws {TypeError} When the currencies differ.
 */
export function addMoney(left: Money, right: Money): Money {
  if (left.currency !== right.currency) {
    throw new TypeError(`Cannot add ${left.currency} to ${right.currency}.`);
  }
  return { amount: left.amount + right.amount, currency: left.currency };
}

/**
 * Subtracts one monetary amount from another of the same currency.
 *
 * @param left - Amount to subtract from.
 * @param right - Amount to subtract.
 * @returns The difference.
 * @throws {TypeError} When the currencies differ.
 */
export function subtractMoney(left: Money, right: Money): Money {
  if (left.currency !== right.currency) {
    throw new TypeError(`Cannot subtract ${right.currency} from ${left.currency}.`);
  }
  return { amount: left.amount - right.amount, currency: left.currency };
}

/**
 * Multiplies a monetary amount by a scalar, rounding to the nearest minor unit.
 *
 * @param value - Monetary amount.
 * @param factor - Scalar multiplier.
 * @returns The scaled amount.
 */
export function multiplyMoney(value: Money, factor: number): Money {
  return { amount: Math.round(value.amount * factor), currency: value.currency };
}

/**
 * Returns the currency symbol for a code in a given locale.
 *
 * @param currency - ISO 4217 currency code.
 * @param locale - BCP 47 locale tag.
 * @returns The symbol, falling back to the code itself.
 */
export function currencySymbol(
  currency: CurrencyCode,
  locale: string = DEFAULT_LOCALE,
): string {
  const parts = getNumberFormatter(locale, {
    style: "currency",
    currency,
  }).formatToParts(0);

  return parts.find((part) => part.type === "currency")?.value ?? currency;
}
