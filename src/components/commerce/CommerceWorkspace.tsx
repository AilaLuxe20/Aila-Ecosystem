"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import type { CommerceOrderDto, CommerceProductDto } from "@/core/commerce/service";
import { workspaceFetch } from "@/components/workspace/api";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Field,
  Input,
  Textarea,
  ToastProvider,
  useToast,
} from "@/components/ui";

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function CommerceWorkspaceInner(): React.JSX.Element {
  const { isSignedIn } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState<CommerceProductDto[]>([]);
  const [orders, setOrders] = useState<CommerceOrderDto[]>([]);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [productOpen, setProductOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [editing, setEditing] = useState<CommerceProductDto | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [inventory, setInventory] = useState("0");
  const [sku, setSku] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!isSignedIn) return;
    const [productBody, orderBody] = (await Promise.all([
      workspaceFetch("/api/commerce/products", { method: "GET" }, signal),
      workspaceFetch("/api/commerce/orders", { method: "GET" }, signal),
    ])) as [
      { data?: { products?: CommerceProductDto[]; stripeConfigured?: boolean } },
      { data?: { orders?: CommerceOrderDto[] } },
    ];
    setProducts(productBody.data?.products ?? []);
    setStripeConfigured(Boolean(productBody.data?.stripeConfigured));
    setOrders(orderBody.data?.orders ?? []);
    setError(null);
    setLoading(false);
  }, [isSignedIn]);

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

  function openProduct(product?: CommerceProductDto) {
    setEditing(product ?? null);
    setName(product?.name ?? "");
    setDescription(product?.description ?? "");
    setPrice(product ? String(product.priceCents / 100) : "0");
    setInventory(product ? String(product.inventory) : "0");
    setSku(product?.sku ?? "");
    setFormError(null);
    setProductOpen(true);
  }

  async function saveProduct() {
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        name,
        description: description || null,
        priceCents: Math.round(Number(price) * 100),
        inventory: Number(inventory),
        sku: sku || null,
        active: true,
      };
      if (editing) {
        await workspaceFetch(`/api/commerce/products/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Product updated");
      } else {
        await workspaceFetch("/api/commerce/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Product created");
      }
      setProductOpen(false);
      await load();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to save the product.");
    } finally {
      setSubmitting(false);
    }
  }

  async function createOrder() {
    setSubmitting(true);
    setFormError(null);
    try {
      const body = (await workspaceFetch("/api/commerce/orders", {
        method: "POST",
        body: JSON.stringify({
          productId,
          quantity: Number(quantity),
          customerName,
          customerEmail,
        }),
      })) as { data?: { order?: CommerceOrderDto } };
      const checkoutUrl = body.data?.order?.checkoutUrl;
      toast.success("Order created");
      setOrderOpen(false);
      await load();
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
      }
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to create the order.");
    } finally {
      setSubmitting(false);
    }
  }

  async function markPaid(order: CommerceOrderDto) {
    await workspaceFetch(`/api/commerce/orders/${order.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "paid" }),
    });
    toast.success("Order marked paid");
    await load();
  }

  return (
    <WorkspaceShell
      product="Commerce"
      href="/products/commerce"
      accent="emerald"
      title="Catalog and orders"
      description={
        stripeConfigured
          ? "Create products, take orders, and collect card payments with Stripe Checkout."
          : "Create products and orders. Add STRIPE_SECRET_KEY to enable card checkout; until then you can mark orders paid."
      }
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={
        <>
          <Button variant="secondary" onClick={() => { setFormError(null); setOrderOpen(true); }}>
            New order
          </Button>
          <Button leadingIcon={<Plus />} onClick={() => openProduct()}>
            New product
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <h2 className="text-lg font-medium">Products</h2>
          {products.length === 0 ? (
            <EmptyState compact className="mt-6" title="No products" description="Add a product before taking an order." action={<Button size="sm" onClick={() => openProduct()}>Add product</Button>} />
          ) : (
            <ul className="mt-4 space-y-2">
              {products.map((product) => (
                <li key={product.id}>
                  <button type="button" onClick={() => openProduct(product)} className="w-full rounded-xl border border-white/8 px-3 py-3 text-left">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="mt-1 text-xs text-white/50">
                      {money(product.priceCents, product.currency)} · {product.inventory} in stock
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <h2 className="text-lg font-medium">Orders</h2>
          {orders.length === 0 ? (
            <p className="mt-6 text-sm text-white/45">No orders yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {orders.map((order) => (
                <li key={order.id} className="rounded-xl border border-white/8 px-3 py-3">
                  <p className="text-sm font-medium">
                    {order.productName} × {order.quantity}
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    {order.customerName} · {money(order.totalCents, order.currency)} · {order.status}
                  </p>
                  {order.status === "pending" ? (
                    <Button size="sm" className="mt-3" onClick={() => void markPaid(order)}>
                      Mark paid
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Dialog open={productOpen} onOpenChange={setProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
            <DialogDescription>Price is stored in your catalog and used when an order is created.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <Field label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} /></Field>
            <Field label="Price"><Input type="number" min={0} step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} /></Field>
            <Field label="Inventory"><Input type="number" min={0} value={inventory} onChange={(event) => setInventory(event.target.value)} /></Field>
            <Field label="SKU"><Input value={sku} onChange={(event) => setSku(event.target.value)} /></Field>
            <Field label="Description"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} /></Field>
            {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => void saveProduct()} loading={submitting}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New order</DialogTitle>
            <DialogDescription>
              {stripeConfigured ? "Stripe Checkout opens after the order is created." : "Mark the order paid after you receive payment."}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <Field label="Product">
              <select className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm" value={productId} onChange={(event) => setProductId(event.target.value)}>
                <option value="">Select a product</option>
                {products.filter((product) => product.active).map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Quantity"><Input type="number" min={1} value={quantity} onChange={(event) => setQuantity(event.target.value)} /></Field>
            <Field label="Customer name"><Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} /></Field>
            <Field label="Customer email"><Input value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} /></Field>
            {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => void createOrder()} loading={submitting}>Create order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspaceShell>
  );
}

export function CommerceWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <CommerceWorkspaceInner />
    </ToastProvider>
  );
}
