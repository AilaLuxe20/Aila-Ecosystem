import { prisma } from "@/core/database/prisma";
import { NotFoundError } from "@/lib/errors/app-error";

import {
  FINANCE_LIST_LIMIT,
  type CreateFinanceBudgetBody,
  type CreateFinanceGoalBody,
  type CreateFinanceTransactionBody,
  type ListFinanceQuery,
  type UpdateFinanceBudgetBody,
  type UpdateFinanceGoalBody,
  type UpdateFinanceTransactionBody,
} from "./schema";

export type FinanceTransactionDto = {
  id: string;
  kind: string;
  amountCents: number;
  currency: string;
  category: string;
  note: string | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
};

export type FinanceBudgetDto = {
  id: string;
  category: string;
  limitCents: number;
  period: string;
  spentThisMonth: number;
  createdAt: string;
  updatedAt: string;
};

export type FinanceGoalDto = {
  id: string;
  title: string;
  targetCents: number;
  savedCents: number;
  createdAt: string;
  updatedAt: string;
};

export type FinanceTotalsDto = {
  incomeCents: number;
  expenseCents: number;
  netCents: number;
};

export type FinanceWorkspaceDto = {
  transactions: FinanceTransactionDto[];
  budgets: FinanceBudgetDto[];
  goals: FinanceGoalDto[];
  totals: FinanceTotalsDto;
};

function serializeTransaction(record: {
  id: string;
  kind: string;
  amountCents: number;
  currency: string;
  category: string;
  note: string | null;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}): FinanceTransactionDto {
  return {
    id: record.id,
    kind: record.kind,
    amountCents: record.amountCents,
    currency: record.currency,
    category: record.category,
    note: record.note,
    occurredAt: record.occurredAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function serializeGoal(record: {
  id: string;
  title: string;
  targetCents: number;
  savedCents: number;
  createdAt: Date;
  updatedAt: Date;
}): FinanceGoalDto {
  return {
    id: record.id,
    title: record.title,
    targetCents: record.targetCents,
    savedCents: record.savedCents,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function utcMonthBounds(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

export function formatFinanceAiContext(workspace: FinanceWorkspaceDto): string {
  return [
    "AILA FINANCE SNAPSHOT",
    "No bank is connected. Totals use amounts the user entered.",
    `This month (UTC): income ${workspace.totals.incomeCents} cents, expenses ${workspace.totals.expenseCents} cents, net ${workspace.totals.netCents} cents.`,
    `Budgets: ${
      workspace.budgets.length
        ? workspace.budgets
            .map((budget) => `${budget.category} ${budget.spentThisMonth}/${budget.limitCents}`)
            .join("; ")
        : "none"
    }`,
    `Goals: ${
      workspace.goals.length
        ? workspace.goals
            .map((goal) => `${goal.title} ${goal.savedCents}/${goal.targetCents}`)
            .join("; ")
        : "none"
    }`,
    `Recent transactions: ${
      workspace.transactions.length
        ? workspace.transactions
            .slice(0, 12)
            .map((item) => `${item.kind} ${item.amountCents} ${item.currency} ${item.category}`)
            .join("; ")
        : "none"
    }`,
  ].join("\n");
}

export async function listFinanceTransactions(userId: string, query: ListFinanceQuery = {}) {
  const records = await prisma.financeTransaction.findMany({
    where: { userId },
    orderBy: { occurredAt: "desc" },
    take: query.limit ?? FINANCE_LIST_LIMIT,
  });
  return records.map(serializeTransaction);
}

export async function createFinanceTransaction(userId: string, body: CreateFinanceTransactionBody) {
  return serializeTransaction(
    await prisma.financeTransaction.create({
      data: {
        userId,
        kind: body.kind,
        amountCents: body.amountCents,
        currency: body.currency,
        category: body.category,
        note: body.note,
        occurredAt: new Date(body.occurredAt),
      },
    }),
  );
}

export async function updateFinanceTransaction(
  userId: string,
  id: string,
  body: UpdateFinanceTransactionBody,
) {
  const existing = await prisma.financeTransaction.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Transaction");

  return serializeTransaction(
    await prisma.financeTransaction.update({
      where: { id },
      data: {
        ...(body.kind !== undefined ? { kind: body.kind } : {}),
        ...(body.amountCents !== undefined ? { amountCents: body.amountCents } : {}),
        ...(body.currency !== undefined ? { currency: body.currency } : {}),
        ...(body.category !== undefined ? { category: body.category } : {}),
        ...(body.note !== undefined ? { note: body.note ? body.note : null } : {}),
        ...(body.occurredAt !== undefined ? { occurredAt: new Date(body.occurredAt) } : {}),
      },
    }),
  );
}

export async function deleteFinanceTransaction(userId: string, id: string) {
  const existing = await prisma.financeTransaction.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Transaction");
  await prisma.financeTransaction.delete({ where: { id } });
}

export async function listFinanceBudgets(userId: string, query: ListFinanceQuery = {}) {
  const workspace = await getFinanceWorkspace(userId);
  return workspace.budgets.slice(0, query.limit ?? FINANCE_LIST_LIMIT);
}

export async function createFinanceBudget(userId: string, body: CreateFinanceBudgetBody) {
  const record = await prisma.financeBudget.create({
    data: {
      userId,
      category: body.category,
      limitCents: body.limitCents,
      period: body.period,
    },
  });
  const workspace = await getFinanceWorkspace(userId);
  return workspace.budgets.find((budget) => budget.id === record.id) ?? {
    id: record.id,
    category: record.category,
    limitCents: record.limitCents,
    period: record.period,
    spentThisMonth: 0,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function updateFinanceBudget(userId: string, id: string, body: UpdateFinanceBudgetBody) {
  const existing = await prisma.financeBudget.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Budget");

  await prisma.financeBudget.update({
    where: { id },
    data: {
      ...(body.category !== undefined ? { category: body.category } : {}),
      ...(body.limitCents !== undefined ? { limitCents: body.limitCents } : {}),
      ...(body.period !== undefined ? { period: body.period } : {}),
    },
  });

  const workspace = await getFinanceWorkspace(userId);
  const budget = workspace.budgets.find((item) => item.id === id);
  if (!budget) throw new NotFoundError("Budget");
  return budget;
}

export async function deleteFinanceBudget(userId: string, id: string) {
  const existing = await prisma.financeBudget.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Budget");
  await prisma.financeBudget.delete({ where: { id } });
}

export async function listFinanceGoals(userId: string, query: ListFinanceQuery = {}) {
  const records = await prisma.financeGoal.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? FINANCE_LIST_LIMIT,
  });
  return records.map(serializeGoal);
}

export async function createFinanceGoal(userId: string, body: CreateFinanceGoalBody) {
  return serializeGoal(
    await prisma.financeGoal.create({
      data: {
        userId,
        title: body.title,
        targetCents: body.targetCents,
        savedCents: body.savedCents,
      },
    }),
  );
}

export async function updateFinanceGoal(userId: string, id: string, body: UpdateFinanceGoalBody) {
  const existing = await prisma.financeGoal.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Goal");

  return serializeGoal(
    await prisma.financeGoal.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.targetCents !== undefined ? { targetCents: body.targetCents } : {}),
        ...(body.savedCents !== undefined ? { savedCents: body.savedCents } : {}),
      },
    }),
  );
}

export async function deleteFinanceGoal(userId: string, id: string) {
  const existing = await prisma.financeGoal.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Goal");
  await prisma.financeGoal.delete({ where: { id } });
}

export async function getFinanceWorkspace(
  userId: string,
  now = new Date(),
): Promise<FinanceWorkspaceDto> {
  const { start, end } = utcMonthBounds(now);

  const [transactions, monthTransactions, budgets, goals] = await Promise.all([
    prisma.financeTransaction.findMany({
      where: { userId },
      orderBy: { occurredAt: "desc" },
      take: FINANCE_LIST_LIMIT,
    }),
    prisma.financeTransaction.findMany({
      where: { userId, occurredAt: { gte: start, lt: end } },
      select: { kind: true, amountCents: true, category: true },
    }),
    prisma.financeBudget.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: FINANCE_LIST_LIMIT,
    }),
    prisma.financeGoal.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: FINANCE_LIST_LIMIT,
    }),
  ]);

  const incomeCents = monthTransactions
    .filter((item) => item.kind === "income")
    .reduce((sum, item) => sum + item.amountCents, 0);
  const expenseCents = monthTransactions
    .filter((item) => item.kind === "expense")
    .reduce((sum, item) => sum + item.amountCents, 0);

  const spentByCategory = new Map<string, number>();
  for (const item of monthTransactions) {
    if (item.kind !== "expense") continue;
    const key = item.category.trim().toLowerCase();
    spentByCategory.set(key, (spentByCategory.get(key) ?? 0) + item.amountCents);
  }

  return {
    transactions: transactions.map(serializeTransaction),
    budgets: budgets.map((budget) => ({
      id: budget.id,
      category: budget.category,
      limitCents: budget.limitCents,
      period: budget.period,
      spentThisMonth: spentByCategory.get(budget.category.trim().toLowerCase()) ?? 0,
      createdAt: budget.createdAt.toISOString(),
      updatedAt: budget.updatedAt.toISOString(),
    })),
    goals: goals.map(serializeGoal),
    totals: {
      incomeCents,
      expenseCents,
      netCents: incomeCents - expenseCents,
    },
  };
}
