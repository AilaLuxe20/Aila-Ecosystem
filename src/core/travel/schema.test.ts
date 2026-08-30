import assert from "node:assert/strict";
import { test } from "node:test";

import { createTravelTripSchema, travelItemSchema } from "./schema";

test("trips require a title and destination", () => {
  assert.equal(createTravelTripSchema.safeParse({ title: "", destination: "Lisbon" }).success, false);
  const parsed = createTravelTripSchema.safeParse({
    title: "August break",
    destination: "Lisbon",
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.status, "planning");
    assert.deepEqual(parsed.data.items, []);
  }
});

test("trip items only accept known kinds", () => {
  assert.equal(
    travelItemSchema.safeParse({ kind: "booking", title: "Hotel" }).success,
    false,
  );
  const parsed = travelItemSchema.safeParse({
    kind: "stay",
    title: "Alfama guesthouse",
    details: "Paid separately — not booked in Aila",
  });
  assert.equal(parsed.success, true);
});

test("end date cannot precede start date", () => {
  assert.equal(
    createTravelTripSchema.safeParse({
      title: "Weekend",
      destination: "Porto",
      startsOn: "2026-09-10",
      endsOn: "2026-09-08",
    }).success,
    false,
  );
});
