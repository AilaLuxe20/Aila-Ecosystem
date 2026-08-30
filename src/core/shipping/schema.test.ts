import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createShippingShipmentSchema,
  publicCarrierTrackingUrl,
  updateShippingShipmentSchema,
} from "./schema";

const baseShipment = {
  senderName: "Ada",
  senderAddress: "1 Oak Street",
  recipientName: "Grace",
  recipientAddress: "2 Pine Road",
  packageDesc: "Documents",
};

test("shipments require sender, recipient, and a package description", () => {
  assert.equal(createShippingShipmentSchema.safeParse({ senderName: "Ada" }).success, false);
  const parsed = createShippingShipmentSchema.safeParse(baseShipment);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.status, "draft");
    assert.equal(parsed.data.weightKg, undefined);
  }
});

test("updates require at least one field", () => {
  assert.equal(updateShippingShipmentSchema.safeParse({}).success, false);
  assert.equal(updateShippingShipmentSchema.safeParse({ status: "ready" }).success, true);
});

test("known carriers produce an external public tracking URL", () => {
  assert.equal(
    publicCarrierTrackingUrl("ups", "1Z999"),
    "https://www.ups.com/track?tracknum=1Z999",
  );
  assert.equal(
    publicCarrierTrackingUrl("Royal Mail", "AB123"),
    "https://www.royalmail.com/track-your-item#/tracking-results/AB123",
  );
  assert.equal(publicCarrierTrackingUrl("unknown", "AB123"), null);
  assert.equal(publicCarrierTrackingUrl("ups", ""), null);
});
