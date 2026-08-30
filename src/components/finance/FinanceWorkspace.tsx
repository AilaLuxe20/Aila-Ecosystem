"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import ChatInterface from "@/components/ai/ChatInterface";
import type {
  FinanceBudgetDto,
  FinanceGoalDto,
  FinanceTotalsDto,
  FinanceTransactionDto,
} from "@/core/finance/service";
import { workspaceFetch } from "@/components/workspace/api";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import {
  Button,
  EmptyState,
  Field,
  Input,
  ToastProvider,
  useToast,
} from "@/components/ui";

const selectClass = "w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm";

function money(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function todayDateInput() {
  const offset = new Date().getTimezoneOffset() * 60_000;
  return new Date(Date.now() - offset).toISOString().slice(0, 10);
}

function dollarsToCents(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}

function FinanceWorkspaceInner(): React.JSX.Element {
  const { isSignedIn, getToken } = useAuth();
  const toast = useToast();
  const [transactions, setTransactions] = useState<FinanceTransactionDto[]>([]);
  const [budgets, setBudgets] = useState<FinanceBudgetDto[]>([]);
  const [goals, setGoals] = useState<FinanceGoalDto[]>([]);
  const [totals, setTotals] = useState<FinanceTotalsDto>({
    incomeCents: 0,
    expenseCents: 0,
    netCents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [occurredAt, setOccurredAt] = useState(todayDateInput);

  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");

  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalSaved, setGoalSaved] = useState("0");

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!isSignedIn) return;
      const response = (await workspaceFetch(
        "/api/finance/workspace",
        { method: "GET" },
        signal,
        getToken,
      )) as {
        data?: {
          transactions?: FinanceTransactionDto[];
          budgets?: FinanceBudgetDto[];
          goals?: FinanceGoalDto[];
          totals?: FinanceTotalsDto;
        };
      };
      setTransactions(response.data?.transactions ?? []);
      setBudgets(response.data?.budgets ?? []);
      setGoals(response.data?.goals ?? []);
      setTotals(
        response.data?.totals ?? { incomeCents: 0, expenseCents: 0, netCents: 0 },
      );
      setError(null);
      setLoading(false);
    },
    [getToken, isSignedIn],
  );

  useEffect(() => {
    if (!isSignedIn) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void load(controller.signal).catch((caught: unknown) => {
        if (controller.signal.aborted) return;
        setError(caught);
        setLoading(false);
      });
    }, 0);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [isSignedIn, load]);

  async function addTransaction() {
    setSaving(true);
    try {
      await workspaceFetch(
        "/api/finance/transactions",
        {
          method: "POST",
          body: JSON.stringify({
            kind,
            amountCents: dollarsToCents(amount),
            category,
            note: note || null,
            occurredAt: new Date(`${occurredAt}T12:00:00`).toISOString(),
          }),
        },
        undefined,
        getToken,
      );
      setAmount("");
      setNote("");
      toast.success(kind === "income" ? "Income added" : "Expense added");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save the transaction.");
    } finally {
      setSaving(false);
    }
  }

  async function addBudget() {
    setSaving(true);
    try {
      await workspaceFetch(
        "/api/finance/budgets",
        {
          method: "POST",
          body: JSON.stringify({
            category: budgetCategory,
            limitCents: dollarsToCents(budgetLimit),
            period: "month",
          }),
        },
        undefined,
        getToken,
      );
      setBudgetCategory("");
      setBudgetLimit("");
      toast.success("Budget saved");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save the budget.");
    } finally {
      setSaving(false);
    }
  }

  async function addGoal() {
    setSaving(true);
    try {
      await workspaceFetch(
        "/api/finance/goals",
        {
          method: "POST",
          body: JSON.stringify({
            title: goalTitle,
            targetCents: dollarsToCents(goalTarget),
            savedCents: dollarsToCents(goalSaved),
          }),
        },
        undefined,
        getToken,
      );
      setGoalTitle("");
      setGoalTarget("");
      setGoalSaved("0");
      toast.success("Goal saved");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save the goal.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(path: string) {
    try {
      await workspaceFetch(path, { method: "DELETE" }, undefined, getToken);
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete.");
    }
  }

  return (
    <WorkspaceShell
      product="Finance"
      href="/products/finance"
      accent="emerald"
      title="Money you enter"
      description="Income, expenses, budgets, and goals stored on your account. No bank is connected."
      loading={loading}
      error={error}
      onRetry={() => void load()}
    >
      <div className="mb-6 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] px-4 py-3 text-sm text-emerald-50/85">
        No bank is connected. Totals and progress use amounts you type here.
      </div>

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">Income this month (UTC)</p>
          <p className="mt-2 text-2xl font-medium">{money(totals.incomeCents)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">Expenses this month (UTC)</p>
          <p className="mt-2 text-2xl font-medium">{money(totals.expenseCents)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">Net this month (UTC)</p>
          <p className="mt-2 text-2xl font-medium">{money(totals.netCents)}</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <h2 className="text-lg font-medium">Add income or expense</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Kind">
              <select
                className={selectClass}
                value={kind}
                onChange={(event) => setKind(event.target.value === "income" ? "income" : "expense")}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </Field>
            <Field label="Amount">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </Field>
            <Field label="Category">
              <Input value={category} onChange={(event) => setCategory(event.target.value)} />
            </Field>
            <Field label="Date">
              <Input
                type="date"
                value={occurredAt}
                onChange={(event) => setOccurredAt(event.target.value)}
              />
            </Field>
          </div>
          <Field label="Note">
            <Input value={note} onChange={(event) => setNote(event.target.value)} />
          </Field>
          <Button leadingIcon={<Plus />} onClick={() => void addTransaction()} loading={saving}>
            Add {kind}
          </Button>
          {transactions.length === 0 ? (
            <EmptyState
              compact
              title="No transactions"
              description="Add an expense or income. Nothing is imported from a bank."
            />
          ) : (
            <ul className="space-y-2">
              {transactions.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 px-4 py-3"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                      {item.kind} · {item.category}
                    </p>
                    <p className="mt-1 font-medium">{money(item.amountCents, item.currency)}</p>
                    {item.note ? <p className="mt-1 text-sm text-white/50">{item.note}</p> : null}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void remove(`/api/finance/transactions/${item.id}`)}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <h2 className="text-lg font-medium">Budgets</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Category">
                <Input
                  value={budgetCategory}
                  onChange={(event) => setBudgetCategory(event.target.value)}
                />
              </Field>
              <Field label="Monthly limit">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={budgetLimit}
                  onChange={(event) => setBudgetLimit(event.target.value)}
                />
              </Field>
            </div>
            <Button leadingIcon={<Plus />} onClick={() => void addBudget()} loading={saving}>
              Add budget
            </Button>
            {budgets.length === 0 ? (
              <EmptyState
                compact
                title="No budgets"
                description="Set a monthly category limit. Progress uses expenses you entered this month."
              />
            ) : (
              <ul className="space-y-3">
                {budgets.map((budget) => {
                  const percent =
                    budget.limitCents === 0
                      ? 0
                      : Math.min(100, Math.round((budget.spentThisMonth / budget.limitCents) * 100));
                  return (
                    <li key={budget.id} className="rounded-2xl border border-white/8 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{budget.category}</p>
                          <p className="mt-1 text-sm text-white/50">
                            {money(budget.spentThisMonth)} of {money(budget.limitCents)} this month
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => void remove(`/api/finance/budgets/${budget.id}`)}
                        >
                          Delete
                        </Button>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={
                            budget.spentThisMonth > budget.limitCents
                              ? "h-full bg-rose-300"
                              : "h-full bg-emerald-300"
                          }
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <h2 className="text-lg font-medium">Goals</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Title">
                <Input value={goalTitle} onChange={(event) => setGoalTitle(event.target.value)} />
              </Field>
              <Field label="Target">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={goalTarget}
                  onChange={(event) => setGoalTarget(event.target.value)}
                />
              </Field>
              <Field label="Saved">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={goalSaved}
                  onChange={(event) => setGoalSaved(event.target.value)}
                />
              </Field>
            </div>
            <Button leadingIcon={<Plus />} onClick={() => void addGoal()} loading={saving}>
              Add goal
            </Button>
            {goals.length === 0 ? (
              <EmptyState compact title="No goals" description="Save a target and how much you have set aside." />
            ) : (
              <ul className="space-y-3">
                {goals.map((goal) => {
                  const percent =
                    goal.targetCents === 0
                      ? 0
                      : Math.min(100, Math.round((goal.savedCents / goal.targetCents) * 100));
                  return (
                    <li key={goal.id} className="rounded-2xl border border-white/8 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{goal.title}</p>
                          <p className="mt-1 text-sm text-white/50">
                            {money(goal.savedCents)} of {money(goal.targetCents)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => void remove(`/api/finance/goals/${goal.id}`)}
                        >
                          Delete
                        </Button>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full bg-emerald-300" style={{ width: `${percent}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      <div className="mt-10">
        <ChatInterface
          mode="finance"
          showConversationHistory
          placeholder="Ask about a budget or expense..."
        />
      </div>
    </WorkspaceShell>
  );
}

export function FinanceWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <FinanceWorkspaceInner />
    </ToastProvider>
  );
}
