"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";

import ChatInterface from "@/components/ai/ChatInterface";
import { publicCarrierTrackingUrl, SHIPPING_STATUS_TRANSITIONS } from "@/core/shipping/schema";
import type { ShippingShipmentDto } from "@/core/shipping/service";
import { workspaceFetch } from "@/components/workspace/api";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import {
  Button,
  EmptyState,
  Field,
  Input,
  Textarea,
  ToastProvider,
  useToast,
} from "@/components/ui";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  ready: "Ready",
  in_transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function ShippingWorkspaceInner(): React.JSX.Element {
  const { isSignedIn, getToken } = useAuth();
  const toast = useToast();
  const [shipments, setShipments] = useState<ShippingShipmentDto[]>([]);
  const [selected, setSelected] = useState<ShippingShipmentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  const [senderName, setSenderName] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [packageDesc, setPackageDesc] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");
  const selectedRef = useRef<ShippingShipmentDto | null>(null);

  function applyShipment(shipment: ShippingShipmentDto | null) {
    selectedRef.current = shipment;
    setSelected(shipment);
    setSenderName(shipment?.senderName ?? "");
    setSenderAddress(shipment?.senderAddress ?? "");
    setRecipientName(shipment?.recipientName ?? "");
    setRecipientAddress(shipment?.recipientAddress ?? "");
    setPackageDesc(shipment?.packageDesc ?? "");
    setWeightKg(shipment?.weightKg == null ? "" : String(shipment.weightKg));
    setCarrier(shipment?.carrier ?? "");
    setTrackingNumber(shipment?.trackingNumber ?? "");
    setNotes(shipment?.notes ?? "");
  }

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!isSignedIn) return;
      const response = (await workspaceFetch(
        "/api/shipping",
        { method: "GET" },
        signal,
        getToken,
      )) as { data?: { shipments?: ShippingShipmentDto[] } };
      const next = response.data?.shipments ?? [];
      const current = selectedRef.current;
      setShipments(next);
      applyShipment(
        !current ? next[0] ?? null : next.find((item) => item.id === current.id) ?? next[0] ?? null,
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

  async function createShipment() {
    setSaving(true);
    try {
      const response = (await workspaceFetch(
        "/api/shipping",
        {
          method: "POST",
          body: JSON.stringify({
            senderName: "Sender",
            senderAddress: "Address",
            recipientName: "Recipient",
            recipientAddress: "Address",
            packageDesc: "Parcel",
          }),
        },
        undefined,
        getToken,
      )) as { data?: { shipment?: ShippingShipmentDto } };
      toast.success("Shipment created");
      await load();
      if (response.data?.shipment) applyShipment(response.data.shipment);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to create the shipment.");
    } finally {
      setSaving(false);
    }
  }

  function payload() {
    const parsedWeight = weightKg.trim() === "" ? null : Number(weightKg);
    return {
      senderName,
      senderAddress,
      recipientName,
      recipientAddress,
      packageDesc,
      weightKg: parsedWeight != null && Number.isFinite(parsedWeight) ? parsedWeight : null,
      carrier: carrier || null,
      trackingNumber: trackingNumber || null,
      notes: notes || null,
    };
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      await workspaceFetch(
        `/api/shipping/${selected.id}`,
        { method: "PATCH", body: JSON.stringify(payload()) },
        undefined,
        getToken,
      );
      toast.success("Saved");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(status: string) {
    if (!selected) return;
    setSaving(true);
    try {
      await workspaceFetch(
        `/api/shipping/${selected.id}`,
        { method: "PATCH", body: JSON.stringify({ status }) },
        undefined,
        getToken,
      );
      toast.success(`Marked ${STATUS_LABELS[status] ?? status}`);
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to update status.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!selected) return;
    setSaving(true);
    try {
      await workspaceFetch(`/api/shipping/${selected.id}`, { method: "DELETE" }, undefined, getToken);
      applyShipment(null);
      toast.success("Deleted");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete.");
    } finally {
      setSaving(false);
    }
  }

  const nextStatuses =
    selected && selected.status in SHIPPING_STATUS_TRANSITIONS
      ? SHIPPING_STATUS_TRANSITIONS[selected.status as keyof typeof SHIPPING_STATUS_TRANSITIONS]
      : [];
  const trackingUrl = publicCarrierTrackingUrl(carrier, trackingNumber) ?? selected?.trackingUrl ?? null;

  return (
    <WorkspaceShell
      product="Shipping"
      href="/products/shipping"
      accent="amber"
      title="Shipment records"
      description="Addresses, statuses, and tracking numbers you enter. Carrier live tracking is not connected."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={
        <Button leadingIcon={<Plus />} onClick={() => void createShipment()} loading={saving}>
          New shipment
        </Button>
      }
    >
      <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm text-amber-50/85">
        Carrier live tracking is not connected. If you enter a known carrier and tracking number, Aila
        shows that carrier&apos;s public lookup page.
      </div>

      {shipments.length === 0 ? (
        <EmptyState
          title="No shipments"
          description="Create a shipment record, then move it through draft, ready, in transit, or delivered."
          action={<Button onClick={() => void createShipment()}>Create shipment</Button>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <ul className="space-y-2">
            {shipments.map((shipment) => (
              <li key={shipment.id}>
                <button
                  type="button"
                  onClick={() => applyShipment(shipment)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left ${
                    selected?.id === shipment.id
                      ? "border-amber-300/30 bg-amber-300/[0.08]"
                      : "border-white/8 bg-white/[0.03]"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                    {STATUS_LABELS[shipment.status] ?? shipment.status}
                  </p>
                  <p className="mt-1 truncate text-sm font-medium">{shipment.packageDesc}</p>
                  <p className="mt-1 truncate text-xs text-white/45">{shipment.recipientName}</p>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={status === "cancelled" ? "secondary" : "primary"}
                    onClick={() => void setStatus(status)}
                    loading={saving}
                  >
                    Mark {STATUS_LABELS[status] ?? status}
                  </Button>
                ))}
              </div>
              {trackingUrl ? (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-sm text-amber-100 underline underline-offset-4"
                >
                  Look up on {carrier || selected.carrier || "carrier"} (external)
                </a>
              ) : trackingNumber ? (
                <p className="text-sm text-white/50">
                  Tracking number saved. Enter ups, fedex, dhl, usps, or royal-mail to open that
                  carrier&apos;s public page.
                </p>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Sender name">
                  <Input value={senderName} onChange={(event) => setSenderName(event.target.value)} />
                </Field>
                <Field label="Recipient name">
                  <Input
                    value={recipientName}
                    onChange={(event) => setRecipientName(event.target.value)}
                  />
                </Field>
              </div>
              <Field label="Sender address">
                <Textarea
                  value={senderAddress}
                  onChange={(event) => setSenderAddress(event.target.value)}
                  rows={2}
                />
              </Field>
              <Field label="Recipient address">
                <Textarea
                  value={recipientAddress}
                  onChange={(event) => setRecipientAddress(event.target.value)}
                  rows={2}
                />
              </Field>
              <Field label="Package">
                <Input value={packageDesc} onChange={(event) => setPackageDesc(event.target.value)} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Weight (kg)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={weightKg}
                    onChange={(event) => setWeightKg(event.target.value)}
                  />
                </Field>
                <Field label="Carrier">
                  <Input
                    value={carrier}
                    onChange={(event) => setCarrier(event.target.value)}
                    placeholder="ups, fedex, dhl…"
                  />
                </Field>
                <Field label="Tracking number">
                  <Input
                    value={trackingNumber}
                    onChange={(event) => setTrackingNumber(event.target.value)}
                  />
                </Field>
              </div>
              <Field label="Notes">
                <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void save()} loading={saving}>
                  Save
                </Button>
                <Button variant="secondary" onClick={() => void remove()} loading={saving}>
                  Delete
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-10">
        <ChatInterface
          mode="shipping"
          showConversationHistory
          placeholder="Ask about a shipment record..."
        />
      </div>
    </WorkspaceShell>
  );
}

export function ShippingWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <ShippingWorkspaceInner />
    </ToastProvider>
  );
}
