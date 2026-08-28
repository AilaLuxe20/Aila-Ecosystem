"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import type { AdsCampaignDto } from "@/core/ads/service";
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

function AdsWorkspaceInner(): React.JSX.Element {
  const { isSignedIn } = useAuth();
  const toast = useToast();
  const [campaigns, setCampaigns] = useState<AdsCampaignDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdsCampaignDto | null>(null);
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("awareness");
  const [budget, setBudget] = useState("50");
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [targetingNotes, setTargetingNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!isSignedIn) return;
    const response = (await workspaceFetch("/api/ads/campaigns", { method: "GET" }, signal)) as {
      data?: { campaigns?: AdsCampaignDto[] };
    };
    setCampaigns(response.data?.campaigns ?? []);
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

  function openCampaign(campaign?: AdsCampaignDto) {
    setEditing(campaign ?? null);
    setName(campaign?.name ?? "");
    setObjective(campaign?.objective ?? "awareness");
    setBudget(campaign ? String(campaign.budgetCents / 100) : "50");
    setHeadline(campaign?.headline ?? "");
    setBody(campaign?.body ?? "");
    setTargetingNotes(campaign?.targetingNotes ?? "");
    setFormError(null);
    setOpen(true);
  }

  async function save() {
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        name,
        objective,
        budgetCents: Math.round(Number(budget) * 100),
        headline,
        body,
        targetingNotes: targetingNotes || null,
      };
      if (editing) {
        await workspaceFetch(`/api/ads/campaigns/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Campaign updated");
      } else {
        await workspaceFetch("/api/ads/campaigns", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Campaign created");
      }
      setOpen(false);
      await load();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to save the campaign.");
    } finally {
      setSubmitting(false);
    }
  }

  async function setStatus(campaign: AdsCampaignDto, status: "active" | "paused" | "ended") {
    await workspaceFetch(`/api/ads/campaigns/${campaign.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    toast.success(status === "active" ? "Campaign launched" : `Campaign ${status}`);
    await load();
  }

  return (
    <WorkspaceShell
      product="Ads"
      href="/products/ads"
      accent="amber"
      title="Campaign planner"
      description="Plan, launch, pause, and end campaigns in Aila. This stores your ad plans and copy. It does not buy ads on Google or Meta."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={<Button leadingIcon={<Plus />} onClick={() => openCampaign()}>New campaign</Button>}
    >
      {campaigns.length === 0 ? (
        <EmptyState title="No campaigns" description="Write the campaign, then launch it to mark it active." action={<Button onClick={() => openCampaign()}>Create campaign</Button>} />
      ) : (
        <ul className="space-y-3">
          {campaigns.map((campaign) => (
            <li key={campaign.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button type="button" className="text-left" onClick={() => openCampaign(campaign)}>
                  <p className="text-sm uppercase tracking-[0.16em] text-white/40">{campaign.status}</p>
                  <h2 className="mt-1 text-lg font-medium">{campaign.name}</h2>
                  <p className="mt-2 text-sm text-white/70">{campaign.headline}</p>
                </button>
                <div className="flex flex-wrap gap-2">
                  {campaign.status === "draft" || campaign.status === "paused" ? (
                    <Button size="sm" onClick={() => void setStatus(campaign, "active")}>Launch</Button>
                  ) : null}
                  {campaign.status === "active" ? (
                    <Button size="sm" variant="secondary" onClick={() => void setStatus(campaign, "paused")}>Pause</Button>
                  ) : null}
                  {campaign.status !== "ended" ? (
                    <Button size="sm" variant="secondary" onClick={() => void setStatus(campaign, "ended")}>End</Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit campaign" : "New campaign"}</DialogTitle>
            <DialogDescription>Launching a campaign records the live status on your account. It does not place ads with an ad network.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <Field label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} /></Field>
            <Field label="Objective">
              <select className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm" value={objective} onChange={(event) => setObjective(event.target.value)}>
                <option value="awareness">Awareness</option>
                <option value="traffic">Traffic</option>
                <option value="leads">Leads</option>
                <option value="sales">Sales</option>
              </select>
            </Field>
            <Field label="Budget"><Input type="number" min={1} value={budget} onChange={(event) => setBudget(event.target.value)} /></Field>
            <Field label="Headline"><Input value={headline} onChange={(event) => setHeadline(event.target.value)} /></Field>
            <Field label="Body"><Textarea value={body} onChange={(event) => setBody(event.target.value)} /></Field>
            <Field label="Targeting notes"><Textarea value={targetingNotes} onChange={(event) => setTargetingNotes(event.target.value)} /></Field>
            {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => void save()} loading={submitting}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspaceShell>
  );
}

export function AdsWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <AdsWorkspaceInner />
    </ToastProvider>
  );
}
