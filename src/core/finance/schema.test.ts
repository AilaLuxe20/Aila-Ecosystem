import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createFinanceBudgetSchema,
  createFinanceGoalSchema,
  createFinanceTransactionSchema,
} from "./schema";

test("transactions require a positive amount and a known kind", () => {
  assert.equal(
    createFinanceTransactionSchema.safeParse({
      kind: "transfer",
      amountCents: 100,
      category: "Food",
      occurredAt: "2026-08-01T12:00:00.000Z",
    }).success,
    false,
  );
  assert.equal(
    createFinanceTransactionSchema.safeParse({
      kind: "expense",
      amountCents: 0,
      category: "Food",
      occurredAt: "2026-08-01T12:00:00.000Z",
    }).success,
    false,
  );
  const parsed = createFinanceTransactionSchema.safeParse({
    kind: "expense",
    amountCents: 1250,
    category: "Food",
    occurredAt: "2026-08-01T12:00:00.000Z",
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.currency, "usd");
  }
});

test("budgets default to a monthly period", () => {
  const parsed = createFinanceBudgetSchema.safeParse({
    category: "Groceries",
    limitCents: 20_000,
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.period, "month");
  }
});

test("goals default saved amount to zero", () => {
  const parsed = createFinanceGoalSchema.safeParse({
    title: "Emergency fund",
    targetCents: 100_000,
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.savedCents, 0);
  }
});
