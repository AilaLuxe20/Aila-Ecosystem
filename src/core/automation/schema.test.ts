import assert from "node:assert/strict";
import { test } from "node:test";

import { createAutomationRuleSchema } from "./schema";

test("manual task automation is valid", () => {
  const parsed = createAutomationRuleSchema.safeParse({
    name: "Follow up",
    triggerType: "manual",
    actionType: "business_task",
    actionPayload: { title: "Call the client" },
  });
  assert.equal(parsed.success, true);
});

test("interval automation requires hours", () => {
  const parsed = createAutomationRuleSchema.safeParse({
    name: "Hourly ping",
    triggerType: "interval",
    actionType: "business_task",
    actionPayload: { title: "Check inbox" },
  });
  assert.equal(parsed.success, false);
});

test("email automation requires a recipient", () => {
  const parsed = createAutomationRuleSchema.safeParse({
    name: "Notify",
    triggerType: "manual",
    actionType: "email",
    actionPayload: { subject: "Hi", body: "Hello" },
  });
  assert.equal(parsed.success, false);
});
