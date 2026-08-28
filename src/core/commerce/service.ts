import Stripe from "stripe";

import { getAppUrl, getStripeSecretKey } from "@/core/config";
import { prisma } from "@/core/database/prisma";
import {
  ConfigurationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors/app-error";

import { COMMERCE_LIST_LIMIT, type CreateCommerceOrderBody, type CreateCommerceProductBody, type ListCommerceQuery, type UpdateCommerceOrderBody, type UpdateCommerceProductBody } from "./schema";

export type CommerceProductDto = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  sku: string | null;
  inventory: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CommerceOrderDto = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  customerName: string;
  customerEmail: string;
  status: string;
  totalCents: number;
  currency: string;
  checkoutUrl: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function serializeProduct(record: {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  sku: string | null;
  inventory: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): CommerceProductDto {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    priceCents: record.priceCents,
    currency: record.currency,
    sku: record.sku,
    inventory: record.inventory,
    active: record.active,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function serializeOrder(record: {
  id: string;
  productId: string;
  quantity: number;
  customerName: string;
  customerEmail: string;
  status: string;
  totalCents: number;
  currency: string;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  product: { name: string };
}): CommerceOrderDto {
  return {
    id: record.id,
    productId: record.productId,
    productName: record.product.name,
    quantity: record.quantity,
    customerName: record.customerName,
    customerEmail: record.customerEmail,
    status: record.status,
    totalCents: record.totalCents,
    currency: record.currency,
    checkoutUrl: null,
    paidAt: record.paidAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function getStripe() {
  const key = getStripeSecretKey();

  if (!key) {
    return null;
  }

  return new Stripe(key);
}

export function isStripeConfigured() {
  return Boolean(getStripeSecretKey());
}

export async function listUserCommerceProducts(userId: string, query: ListCommerceQuery) {
  const records = await prisma.commerceProduct.findMany({
    where: {
      userId,
      ...(query.active === "true" ? { active: true } : {}),
      ...(query.active === "false" ? { active: false } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { sku: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? COMMERCE_LIST_LIMIT,
  });

  return records.map(serializeProduct);
}

export async function createUserCommerceProduct(userId: string, body: CreateCommerceProductBody) {
  const record = await prisma.commerceProduct.create({
    data: {
      userId,
      name: body.name,
      description: body.description,
      priceCents: body.priceCents,
      currency: body.currency,
      sku: body.sku,
      inventory: body.inventory,
      active: body.active,
    },
  });

  return serializeProduct(record);
}

export async function updateUserCommerceProduct(
  userId: string,
  id: string,
  body: UpdateCommerceProductBody,
) {
  const existing = await prisma.commerceProduct.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Product");
  }

  const record = await prisma.commerceProduct.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.priceCents !== undefined ? { priceCents: body.priceCents } : {}),
      ...(body.currency !== undefined ? { currency: body.currency } : {}),
      ...(body.sku !== undefined ? { sku: body.sku } : {}),
      ...(body.inventory !== undefined ? { inventory: body.inventory } : {}),
      ...(body.active !== undefined ? { active: body.active } : {}),
    },
  });

  return serializeProduct(record);
}

export async function deleteUserCommerceProduct(userId: string, id: string) {
  const existing = await prisma.commerceProduct.findFirst({ where: { id, userId } });

  if (!existing) {
    throw new NotFoundError("Product");
  }

  const orderCount = await prisma.commerceOrder.count({ where: { productId: id } });

  if (orderCount > 0) {
    throw new ConflictError({
      message: "This product has orders. Archive it instead of deleting.",
    });
  }

  await prisma.commerceProduct.delete({ where: { id } });
}

export async function listUserCommerceOrders(userId: string, query: ListCommerceQuery) {
  const records = await prisma.commerceOrder.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
    },
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: query.limit ?? COMMERCE_LIST_LIMIT,
  });

  return records.map(serializeOrder);
}

export async function createUserCommerceOrder(userId: string, body: CreateCommerceOrderBody) {
  const product = await prisma.commerceProduct.findFirst({
    where: { id: body.productId, userId },
  });

  if (!product || !product.active) {
    throw new NotFoundError("Product");
  }

  if (product.inventory < body.quantity) {
    throw new ValidationError(
      { quantity: "Not enough inventory for this order." },
      { message: "Not enough inventory for this order." },
    );
  }

  const totalCents = product.priceCents * body.quantity;

  const order = await prisma.commerceOrder.create({
    data: {
      userId,
      productId: product.id,
      quantity: body.quantity,
      customerName: body.customerName,
      customerEmail: body.customerEmail.toLowerCase(),
      status: "pending",
      totalCents,
      currency: product.currency,
    },
    include: { product: { select: { name: true } } },
  });

  const stripe = getStripe();

  if (!stripe) {
    return serializeOrder(order);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.customerEmail,
    line_items: [
      {
        quantity: order.quantity,
        price_data: {
          currency: order.currency,
          unit_amount: product.priceCents,
          product_data: { name: product.name },
        },
      },
    ],
    success_url: `${getAppUrl()}/products/commerce?order=success&id=${order.id}`,
    cancel_url: `${getAppUrl()}/products/commerce?order=cancelled&id=${order.id}`,
    metadata: { orderId: order.id, userId },
  });

  await prisma.commerceOrder.update({
    where: { id: order.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return { ...serializeOrder(order), checkoutUrl: session.url };
}

export async function updateUserCommerceOrder(
  userId: string,
  id: string,
  body: UpdateCommerceOrderBody,
) {
  const existing = await prisma.commerceOrder.findFirst({
    where: { id, userId },
    include: { product: true },
  });

  if (!existing) {
    throw new NotFoundError("Order");
  }

  if (existing.status === "paid" && body.status !== "paid") {
    throw new ConflictError({ message: "Paid orders cannot be changed." });
  }

  if (body.status === "paid" && existing.status !== "paid") {
    if (existing.product.inventory < existing.quantity) {
      throw new ValidationError(
        { quantity: "Not enough inventory to mark this order paid." },
        { message: "Not enough inventory to mark this order paid." },
      );
    }

    const [record] = await prisma.$transaction([
      prisma.commerceOrder.update({
        where: { id },
        data: { status: "paid", paidAt: new Date() },
        include: { product: { select: { name: true } } },
      }),
      prisma.commerceProduct.update({
        where: { id: existing.productId },
        data: { inventory: { decrement: existing.quantity } },
      }),
    ]);

    return serializeOrder(record);
  }

  const record = await prisma.commerceOrder.update({
    where: { id },
    data: { status: body.status },
    include: { product: { select: { name: true } } },
  });

  return serializeOrder(record);
}

export async function markCommerceOrderPaidFromStripe(sessionId: string) {
  const existing = await prisma.commerceOrder.findFirst({
    where: { stripeCheckoutSessionId: sessionId },
    include: { product: true },
  });

  if (!existing) {
    throw new NotFoundError("Order");
  }

  if (existing.status === "paid") {
    return serializeOrder({ ...existing, product: { name: existing.product.name } });
  }

  return updateUserCommerceOrder(existing.userId, existing.id, { status: "paid" });
}

export function requireStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new ConfigurationError({
      message: "STRIPE_WEBHOOK_SECRET is required for Stripe webhooks.",
    });
  }

  return secret;
}
