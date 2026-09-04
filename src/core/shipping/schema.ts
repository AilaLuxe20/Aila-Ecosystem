import { z } from "zod";

export const SHIPPING_LIST_LIMIT = 80;
export const SHIPPING_ID_MAX = 64;
export const SHIPPING_STATUSES = ["draft", "ready", "in_transit", "delivered", "cancelled"] as const;

export const KNOWN_CARRIERS = ["ups", "fedex", "dhl", "usps", "royal-mail"] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null));

const optionalWeightKg = z
  .number()
  .finite()
  .min(0)
  .max(99_999)
  .nullable()
  .optional()
  .transform((value) => (value === undefined ? undefined : value));

export const shippingIdSchema = z.string().trim().min(1).max(SHIPPING_ID_MAX);

export const listShippingQuerySchema = z
  .object({
    status: z.enum(SHIPPING_STATUSES).optional(),
    limit: z.coerce.number().int().min(1).max(SHIPPING_LIST_LIMIT).optional(),
  })
  .strict();

export const createShippingShipmentSchema = z
  .object({
    senderName: z.string().trim().min(1, "Sender name is required.").max(160),
    senderAddress: z.string().trim().min(1, "Sender address is required.").max(2_000),
    recipientName: z.string().trim().min(1, "Recipient name is required.").max(160),
    recipientAddress: z.string().trim().min(1, "Recipient address is required.").max(2_000),
    packageDesc: z.string().trim().min(1, "Package description is required.").max(500),
    weightKg: optionalWeightKg,
    carrier: optionalText(80),
    trackingNumber: optionalText(80),
    status: z.enum(SHIPPING_STATUSES).optional().default("draft"),
    notes: optionalText(4_000),
  })
  .strict();

export const updateShippingShipmentSchema = z
  .object({
    senderName: z.string().trim().min(1).max(160).optional(),
    senderAddress: z.string().trim().min(1).max(2_000).optional(),
    recipientName: z.string().trim().min(1).max(160).optional(),
    recipientAddress: z.string().trim().min(1).max(2_000).optional(),
    packageDesc: z.string().trim().min(1).max(500).optional(),
    weightKg: z.number().finite().min(0).max(99_999).nullable().optional(),
    carrier: z.string().trim().max(80).optional().nullable(),
    trackingNumber: z.string().trim().max(80).optional().nullable(),
    status: z.enum(SHIPPING_STATUSES).optional(),
    notes: z.string().trim().max(4_000).optional().nullable(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.senderName === undefined &&
      value.senderAddress === undefined &&
      value.recipientName === undefined &&
      value.recipientAddress === undefined &&
      value.packageDesc === undefined &&
      value.weightKg === undefined &&
      value.carrier === undefined &&
      value.trackingNumber === undefined &&
      value.status === undefined &&
      value.notes === undefined
    ) {
      ctx.addIssue({ code: "custom", message: "At least one field is required." });
    }
  });

export function normalizeCarrier(carrier: string | null | undefined): string | null {
  if (!carrier) return null;
  const key = carrier.trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (key === "royalmail") return "royal-mail";
  return key || null;
}

const CARRIER_TRACKING_URL: Record<(typeof KNOWN_CARRIERS)[number], (trackingNumber: string) => string> =
  {
    ups: (trackingNumber) => `https://www.ups.com/track?tracknum=${encodeURIComponent(trackingNumber)}`,
    fedex: (trackingNumber) =>
      `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`,
    dhl: (trackingNumber) =>
      `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${encodeURIComponent(trackingNumber)}`,
    usps: (trackingNumber) =>
      `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber)}`,
    "royal-mail": (trackingNumber) =>
      `https://www.royalmail.com/track-your-item#/tracking-results/${encodeURIComponent(trackingNumber)}`,
  };

export function publicCarrierTrackingUrl(
  carrier: string | null | undefined,
  trackingNumber: string | null | undefined,
): string | null {
  const number = trackingNumber?.trim();
  const key = normalizeCarrier(carrier);
  if (!number || !key) return null;
  if (!(KNOWN_CARRIERS as readonly string[]).includes(key)) return null;
  return CARRIER_TRACKING_URL[key as (typeof KNOWN_CARRIERS)[number]](number);
}

export const SHIPPING_STATUS_TRANSITIONS: Record<(typeof SHIPPING_STATUSES)[number], (typeof SHIPPING_STATUSES)[number][]> =
  {
    draft: ["ready", "cancelled"],
    ready: ["in_transit", "draft", "cancelled"],
    in_transit: ["delivered", "cancelled"],
    delivered: [],
    cancelled: ["draft"],
  };

export type CreateShippingShipmentBody = z.infer<typeof createShippingShipmentSchema>;
export type UpdateShippingShipmentBody = z.infer<typeof updateShippingShipmentSchema>;
export type ListShippingQuery = z.infer<typeof listShippingQuerySchema>;
