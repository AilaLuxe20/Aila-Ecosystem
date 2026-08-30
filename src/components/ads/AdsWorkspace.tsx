"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import ChatInterface from "@/components/ai/ChatInterface";
import type {
  AdsCampaignDto,
  AdsCreativeDto,
  AdsLandingAnalysisDto,
  AdsRecommendationDto,
  AdsWorkspaceDto,
} from "@/core/ads/service";
import { ADS_CURRENCIES, ADS_INTENDED_PLATFORMS } from "@/core/ads/schema";
import { useWorkspaceApi } from "@/components/workspace/api";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  ToastProvider,
  useToast,
} from "@/components/ui";

const SELECT_CLASS = "w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm";

const TIMEZONES = [
  "UTC",
  "Africa/Lagos",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

type CampaignForm = {
  name: string;
  objective: string;
  budget: string;
  plannedSpend: string;
  headline: string;
  body: string;
  targetingNotes: string;
  audience: string;
  location: string;
  landingPageUrl: string;
  conversionGoal: string;
  callToAction: string;
  currency: string;
  timezone: string;
  intendedPlatform: string;
  startsAt: string;
  endsAt: string;
};

type CampaignDetail = {
  campaign: AdsCampaignDto;
  creatives: AdsCreativeDto[];
  landingAnalyses: AdsLandingAnalysisDto[];
  recommendations: AdsRecommendationDto[];
};

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInput(value: string): string | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function emptyForm(): CampaignForm {
  return {
    name: "",
    objective: "traffic",
    budget: "50",
    plannedSpend: "50",
    headline: "",
    body: "",
    targetingNotes: "",
    audience: "",
    location: "",
    landingPageUrl: "",
    conversionGoal: "",
    callToAction: "",
    currency: "usd",
    timezone: "UTC",
    intendedPlatform: "",
    startsAt: "",
    endsAt: "",
  };
}

function formFromCampaign(campaign: AdsCampaignDto): CampaignForm {
  return {
    name: campaign.name,
    objective: campaign.objective,
    budget: String(campaign.budgetCents / 100),
    plannedSpend: String((campaign.plannedSpendCents ?? campaign.budgetCents) / 100),
    headline: campaign.headline,
    body: campaign.body,
    targetingNotes: campaign.targetingNotes ?? "",
    audience: campaign.audience ?? "",
    location: campaign.location ?? "",
    landingPageUrl: campaign.landingPageUrl ?? "",
    conversionGoal: campaign.conversionGoal ?? "",
    callToAction: campaign.callToAction ?? "",
    currency: campaign.currency,
    timezone: campaign.timezone,
    intendedPlatform: campaign.intendedPlatform ?? "",
    startsAt: toLocalInput(campaign.startsAt),
    endsAt: toLocalInput(campaign.endsAt),
  };
}

function payloadFromForm(form: CampaignForm) {
  return {
    name: form.name,
    objective: form.objective,
    budgetCents: Math.round(Number(form.budget) * 100),
    plannedSpendCents: Math.round(Number(form.plannedSpend) * 100),
    headline: form.headline,
    body: form.body,
    targetingNotes: form.targetingNotes || null,
    audience: form.audience || null,
    location: form.location || null,
    landingPageUrl: form.landingPageUrl || null,
    conversionGoal: form.conversionGoal || null,
    callToAction: form.callToAction || null,
    currency: form.currency,
    timezone: form.timezone,
    intendedPlatform: form.intendedPlatform || null,
    startsAt: fromLocalInput(form.startsAt),
    endsAt: fromLocalInput(form.endsAt),
  };
}

function AdsWorkspaceInner(): React.JSX.Element {
  const { isSignedIn } = useAuth();
  const api = useWorkspaceApi();
  const toast = useToast();
  const [workspace, setWorkspace] = useState<AdsWorkspaceDto | null>(null);
  const [detail, setDetail] = useState<CampaignDetail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignForm>(emptyForm);
  const [createForm, setCreateForm] = useState<CampaignForm>(emptyForm);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("campaign");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);
  const [working, setWorking] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [creativeHeadline, setCreativeHeadline] = useState("");
  const [creativeBody, setCreativeBody] = useState("");
  const [audienceBrief, setAudienceBrief] = useState("");
  const [analysisNotes, setAnalysisNotes] = useState<string[]>([]);
  const [analysisSummary, setAnalysisSummary] = useState<string | null>(null);

  const loadWorkspace = useCallback(async (signal?: AbortSignal) => {
    if (!isSignedIn) return;
    const response = (await api("/api/ads/workspace", { method: "GET" }, signal)) as {
      data?: { workspace?: AdsWorkspaceDto };
    };
    setWorkspace(response.data?.workspace ?? null);
    setError(null);
    setLoading(false);
  }, [api, isSignedIn]);

  const loadDetail = useCallback(async (id: string) => {
    const response = (await api(`/api/ads/campaigns/${id}`, { method: "GET" })) as {
      data?: CampaignDetail;
    };
    if (!response.data?.campaign) return;
    setDetail(response.data);
    setForm(formFromCampaign(response.data.campaign));
  }, [api]);

  useEffect(() => {
    if (!isSignedIn) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void loadWorkspace(controller.signal).catch((caught: unknown) => {
        if (controller.signal.aborted) return;
        setError(caught);
        setLoading(false);
      });
    }, 0);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [isSignedIn, loadWorkspace]);

  async function selectCampaign(campaign: AdsCampaignDto) {
    setSelectedId(campaign.id);
    setTab("campaign");
    setAnalysisNotes([]);
    setAnalysisSummary(null);
    await loadDetail(campaign.id);
  }

  async function createCampaign() {
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = payloadFromForm(createForm);
      const response = (await api("/api/ads/campaigns", {
        method: "POST",
        body: JSON.stringify(payload),
      })) as { data?: { campaign?: AdsCampaignDto } };
      toast.success("Campaign created");
      setOpen(false);
      setCreateForm(emptyForm());
      await loadWorkspace();
      if (response.data?.campaign) {
        await selectCampaign(response.data.campaign);
      }
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to create the campaign.");
    } finally {
      setSubmitting(false);
    }
  }

  async function saveCampaign() {
    if (!selectedId) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await api(`/api/ads/campaigns/${selectedId}`, {
        method: "PATCH",
        body: JSON.stringify(payloadFromForm(form)),
      });
      toast.success("Campaign saved");
      await Promise.all([loadWorkspace(), loadDetail(selectedId)]);
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to save the campaign.");
    } finally {
      setSubmitting(false);
    }
  }

  async function setStatus(campaign: AdsCampaignDto, status: "active" | "paused" | "ended") {
    await api(`/api/ads/campaigns/${campaign.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    toast.success(status === "active" ? "Campaign marked active" : `Campaign ${status}`);
    await loadWorkspace();
    if (selectedId === campaign.id) {
      await loadDetail(campaign.id);
    }
  }

  async function generateCopy() {
    if (!selectedId) return;
    setWorking("generate");
    try {
      await api("/api/ads/generate", {
        method: "POST",
        body: JSON.stringify({ campaignId: selectedId, count: 3 }),
      });
      toast.success("Ad copy generated");
      await Promise.all([loadWorkspace(), loadDetail(selectedId)]);
      setTab("creatives");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to generate copy.");
    } finally {
      setWorking(null);
    }
  }

  async function saveCreative() {
    if (!selectedId) return;
    setWorking("creative");
    try {
      await api(`/api/ads/campaigns/${selectedId}/creatives`, {
        method: "POST",
        body: JSON.stringify({ headline: creativeHeadline, body: creativeBody }),
      });
      setCreativeHeadline("");
      setCreativeBody("");
      toast.success("Creative saved");
      await Promise.all([loadWorkspace(), loadDetail(selectedId)]);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save the creative.");
    } finally {
      setWorking(null);
    }
  }

  async function applyCreative(creative: AdsCreativeDto) {
    if (!selectedId) return;
    await api(`/api/ads/campaigns/${selectedId}/creatives/${creative.id}/apply`, {
      method: "POST",
    });
    toast.success("Campaign copy updated");
    await loadDetail(selectedId);
  }

  async function suggestAudience(apply: boolean) {
    if (!selectedId) return;
    setWorking("audience");
    try {
      const response = (await api("/api/ads/audience", {
        method: "POST",
        body: JSON.stringify({ campaignId: selectedId, brief: audienceBrief || undefined, apply }),
      })) as {
        data?: {
          suggestion?: { audience: string; location: string | null; rationale: string };
        };
      };
      const suggestion = response.data?.suggestion;
      if (suggestion) {
        setForm((current) => ({
          ...current,
          audience: apply ? suggestion.audience : current.audience,
          location: apply && suggestion.location ? suggestion.location : current.location,
        }));
        toast.success(apply ? "Audience saved on the campaign" : "Audience suggestion ready");
      }
      await Promise.all([loadWorkspace(), loadDetail(selectedId)]);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to suggest an audience.");
    } finally {
      setWorking(null);
    }
  }

  async function analyzeCampaign() {
    if (!selectedId) return;
    setWorking("analyze");
    try {
      const response = (await api("/api/ads/analyze", {
        method: "POST",
        body: JSON.stringify({ campaignId: selectedId }),
      })) as {
        data?: { analysis?: { notes: string[] }; summary?: string | null };
      };
      setAnalysisNotes(response.data?.analysis?.notes ?? []);
      setAnalysisSummary(response.data?.summary ?? null);
      toast.success("Stored campaign analysed");
      await loadDetail(selectedId);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to analyse the campaign.");
    } finally {
      setWorking(null);
    }
  }

  async function analyzeLanding() {
    if (!selectedId) return;
    setWorking("landing");
    try {
      await api("/api/ads/landing-page", {
        method: "POST",
        body: JSON.stringify({
          campaignId: selectedId,
          url: form.landingPageUrl,
        }),
      });
      toast.success("Landing page fetch finished");
      await Promise.all([loadWorkspace(), loadDetail(selectedId)]);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to fetch the landing page.");
    } finally {
      setWorking(null);
    }
  }

  const campaigns = workspace?.campaigns ?? [];
  const selected = campaigns.find((campaign) => campaign.id === selectedId) ?? detail?.campaign;

  return (
    <WorkspaceShell
      product="Ads"
      href="/products/ads"
      accent="amber"
      title="Advertising workspace"
      description="Plan campaigns, generate copy, and analyse what is stored on your account. Live impressions, spend, and ROAS appear only after a real ad-network connection."
      loading={loading}
      error={error}
      onRetry={() => void loadWorkspace()}
      actions={<Button leadingIcon={<Plus />} onClick={() => { setCreateForm(emptyForm()); setFormError(null); setOpen(true); }}>New campaign</Button>}
    >
      {workspace ? (
        <div className="mb-6 grid gap-3 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">Platform connections</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {workspace.connections.map((connection) => (
                <span
                  key={connection.platform}
                  className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3 py-1 text-xs text-amber-100"
                >
                  {connection.label}: Not connected
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-white/50">
              Aila Ads does not buy ads on Meta, Google, TikTok, or LinkedIn in this release. Performance numbers are never invented.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">{workspace.plan} plan</p>
            <p className="mt-3 text-sm text-white/70">
              Campaigns {workspace.usage.campaigns}/{workspace.quotas.campaigns} · Creatives {workspace.usage.creatives}/{workspace.quotas.creatives}
            </p>
            <p className="mt-2 text-sm text-white/50">
              AI today: {workspace.usage.generateToday}/{workspace.quotas.generatePerDay} copy · {workspace.usage.audienceToday}/{workspace.quotas.audiencePerDay} audience · {workspace.usage.landingToday}/{workspace.quotas.landingPerDay} landing pages
            </p>
            {workspace.plan === "free" ? (
              <Link href="/billing?product=ads" className="mt-3 inline-block text-sm text-amber-200 hover:text-white">
                Upgrade for higher Ads limits
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns"
          description="Create a campaign plan, generate copy, and keep the work on your account."
          action={<Button onClick={() => setOpen(true)}>Create campaign</Button>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <ul className="space-y-3">
            {campaigns.map((campaign) => (
              <li key={campaign.id}>
                <button
                  type="button"
                  onClick={() => void selectCampaign(campaign)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedId === campaign.id
                      ? "border-amber-300/30 bg-amber-300/[0.07]"
                      : "border-white/8 bg-white/[0.03] hover:border-white/16"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-white/40">{campaign.status}</p>
                  <h2 className="mt-1 text-lg font-medium">{campaign.name}</h2>
                  <p className="mt-2 text-sm text-white/70">{campaign.headline || "No headline yet"}</p>
                  <p className="mt-2 text-xs text-white/40">
                    {(campaign.budgetCents / 100).toFixed(2)} {campaign.currency.toUpperCase()} · {campaign.objective}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/40">{selected.status}</p>
                  <h2 className="mt-1 text-xl font-medium">{selected.name}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.status === "draft" || selected.status === "paused" ? (
                    <Button size="sm" onClick={() => void setStatus(selected, "active")}>Mark active</Button>
                  ) : null}
                  {selected.status === "active" ? (
                    <Button size="sm" variant="secondary" onClick={() => void setStatus(selected, "paused")}>Pause</Button>
                  ) : null}
                  {selected.status !== "ended" ? (
                    <Button size="sm" variant="secondary" onClick={() => void setStatus(selected, "ended")}>End</Button>
                  ) : null}
                </div>
              </div>
              <p className="mt-2 text-sm text-white/45">
                Marking a campaign active records status on your account. It does not place ads with a network.
              </p>

              <Tabs value={tab} onValueChange={setTab} className="mt-5">
                <TabsList variant="underline" className="flex-wrap">
                  <TabsTrigger value="campaign" variant="underline">Campaign</TabsTrigger>
                  <TabsTrigger value="creatives" variant="underline">Creatives</TabsTrigger>
                  <TabsTrigger value="audience" variant="underline">Audience</TabsTrigger>
                  <TabsTrigger value="performance" variant="underline">Performance</TabsTrigger>
                  <TabsTrigger value="landing" variant="underline">Landing</TabsTrigger>
                  <TabsTrigger value="assistant" variant="underline">Assistant</TabsTrigger>
                </TabsList>

                <TabsContent value="campaign" className="space-y-3">
                  <Field label="Name"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Objective">
                      <select className={SELECT_CLASS} value={form.objective} onChange={(event) => setForm({ ...form, objective: event.target.value })}>
                        <option value="awareness">Awareness</option>
                        <option value="traffic">Traffic</option>
                        <option value="leads">Leads</option>
                        <option value="sales">Sales</option>
                      </select>
                    </Field>
                    <Field label="Intended platform">
                      <select className={SELECT_CLASS} value={form.intendedPlatform} onChange={(event) => setForm({ ...form, intendedPlatform: event.target.value })}>
                        <option value="">Not selected</option>
                        {ADS_INTENDED_PLATFORMS.map((platform) => (
                          <option key={platform} value={platform}>{platform}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Currency">
                      <select className={SELECT_CLASS} value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })}>
                        {ADS_CURRENCIES.map((currency) => (
                          <option key={currency} value={currency}>{currency.toUpperCase()}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Planned budget"><Input type="number" min={1} value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} /></Field>
                    <Field label="Planned spend"><Input type="number" min={0} value={form.plannedSpend} onChange={(event) => setForm({ ...form, plannedSpend: event.target.value })} /></Field>
                  </div>
                  <Field label="Timezone">
                    <select className={SELECT_CLASS} value={form.timezone} onChange={(event) => setForm({ ...form, timezone: event.target.value })}>
                      {TIMEZONES.map((zone) => (
                        <option key={zone} value={zone}>{zone}</option>
                      ))}
                    </select>
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Starts"><Input type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} /></Field>
                    <Field label="Ends"><Input type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} /></Field>
                  </div>
                  <Field label="Location"><Input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></Field>
                  <Field label="Conversion goal"><Input value={form.conversionGoal} onChange={(event) => setForm({ ...form, conversionGoal: event.target.value })} /></Field>
                  <Field label="Call to action"><Input value={form.callToAction} onChange={(event) => setForm({ ...form, callToAction: event.target.value })} /></Field>
                  <Field label="Landing page URL"><Input value={form.landingPageUrl} onChange={(event) => setForm({ ...form, landingPageUrl: event.target.value })} /></Field>
                  <Field label="Headline"><Input value={form.headline} onChange={(event) => setForm({ ...form, headline: event.target.value })} /></Field>
                  <Field label="Body"><Textarea value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} /></Field>
                  <Field label="Targeting notes"><Textarea value={form.targetingNotes} onChange={(event) => setForm({ ...form, targetingNotes: event.target.value })} /></Field>
                  {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
                  <Button onClick={() => void saveCampaign()} loading={submitting}>Save campaign</Button>
                </TabsContent>

                <TabsContent value="creatives" className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => void generateCopy()} loading={working === "generate"}>Generate ad copy</Button>
                    <p className="self-center text-sm text-white/45">AI copy is stored as creatives. It is not live ad performance.</p>
                  </div>
                  <div className="space-y-3 rounded-2xl border border-white/8 p-4">
                    <Field label="Headline"><Input value={creativeHeadline} onChange={(event) => setCreativeHeadline(event.target.value)} /></Field>
                    <Field label="Body"><Textarea value={creativeBody} onChange={(event) => setCreativeBody(event.target.value)} /></Field>
                    <Button variant="secondary" onClick={() => void saveCreative()} loading={working === "creative"}>Save your copy</Button>
                  </div>
                  {(detail?.creatives ?? []).length === 0 ? (
                    <p className="text-sm text-white/50">No creatives stored yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {detail?.creatives.map((creative) => (
                        <li key={creative.id} className="rounded-2xl border border-white/8 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                            {creative.source === "ai" ? "AI generated" : "Written by you"}
                            {creative.variantLabel ? ` · ${creative.variantLabel}` : ""}
                          </p>
                          <p className="mt-2 font-medium">{creative.headline}</p>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-white/70">{creative.body}</p>
                          <Button className="mt-3" size="sm" variant="secondary" onClick={() => void applyCreative(creative)}>
                            Use on campaign
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </TabsContent>

                <TabsContent value="audience" className="space-y-4">
                  <p className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm text-amber-100">
                    Audience suggestions are AI, labelled separately from real platform audience data. No ad network is connected.
                  </p>
                  <Field label="Audience currently saved"><Textarea value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })} /></Field>
                  <Field label="Brief for the assistant"><Textarea value={audienceBrief} onChange={(event) => setAudienceBrief(event.target.value)} /></Field>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => void suggestAudience(false)} loading={working === "audience"}>Suggest audience</Button>
                    <Button variant="secondary" onClick={() => void suggestAudience(true)} loading={working === "audience"}>Suggest and save</Button>
                    <Button variant="secondary" onClick={() => void saveCampaign()} loading={submitting}>Save audience</Button>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <div className="rounded-2xl border border-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/40">Live metrics</p>
                    <p className="mt-2 text-lg font-medium">Not connected</p>
                    <p className="mt-2 text-sm text-white/55">
                      Impressions, clicks, spend, CTR, and ROAS are unavailable until a real platform API is connected. Aila will not invent them.
                    </p>
                    <p className="mt-3 text-sm text-white/70">
                      Planned budget {(selected.budgetCents / 100).toFixed(2)} {selected.currency.toUpperCase()} · Planned spend {((selected.plannedSpendCents ?? selected.budgetCents) / 100).toFixed(2)} · Actual spend from networks: unavailable
                    </p>
                  </div>
                  <Button onClick={() => void analyzeCampaign()} loading={working === "analyze"}>Analyse stored campaign</Button>
                  {analysisSummary ? <p className="whitespace-pre-wrap text-sm text-white/70">{analysisSummary}</p> : null}
                  {analysisNotes.length > 0 ? (
                    <ul className="list-disc space-y-2 pl-5 text-sm text-white/70">
                      {analysisNotes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  ) : null}
                  {(detail?.recommendations ?? []).filter((item) => item.kind === "analysis").slice(0, 3).map((item) => (
                    <pre key={item.id} className="whitespace-pre-wrap rounded-2xl border border-white/8 p-4 text-sm text-white/60">
                      {item.content}
                    </pre>
                  ))}
                </TabsContent>

                <TabsContent value="landing" className="space-y-4">
                  <Field
                    label="Landing page URL"
                    description="Aila fetches the URL from the server. If the fetch fails, there is no analysis."
                  >
                    <Input value={form.landingPageUrl} onChange={(event) => setForm({ ...form, landingPageUrl: event.target.value })} />
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => void saveCampaign()} loading={submitting}>Save URL</Button>
                    <Button onClick={() => void analyzeLanding()} loading={working === "landing"}>Fetch and analyse</Button>
                  </div>
                  {(detail?.landingAnalyses ?? []).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/8 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/40">{item.fetchStatus}</p>
                      <p className="mt-2 text-sm text-white/70">{item.url}</p>
                      {item.title ? <p className="mt-2 font-medium">{item.title}</p> : null}
                      {item.errorMessage ? <p className="mt-2 text-sm text-red-300">{item.errorMessage}</p> : null}
                      {item.analysis ? <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">{item.analysis}</p> : null}
                      {!item.analysis && item.fetchStatus !== "success" ? (
                        <p className="mt-3 text-sm text-white/50">No analysis, because the page was not fetched.</p>
                      ) : null}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="assistant">
                  <ChatInterface
                    mode="ads"
                    containerClassName="h-[560px]"
                    messagesHeight="h-[360px]"
                    headerSubtitle="Advertising assistant for stored campaign plans"
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <EmptyState title="Select a campaign" description="Open a campaign to edit copy, audience, landing page, and stored analysis." />
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New campaign</DialogTitle>
            <DialogDescription>
              This creates a campaign plan on your account. It does not buy ads on Google or Meta.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <Field label="Name"><Input value={createForm.name} onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })} /></Field>
            <Field label="Objective">
              <select className={SELECT_CLASS} value={createForm.objective} onChange={(event) => setCreateForm({ ...createForm, objective: event.target.value })}>
                <option value="awareness">Awareness</option>
                <option value="traffic">Traffic</option>
                <option value="leads">Leads</option>
                <option value="sales">Sales</option>
              </select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Currency">
                <select className={SELECT_CLASS} value={createForm.currency} onChange={(event) => setCreateForm({ ...createForm, currency: event.target.value })}>
                  {ADS_CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>{currency.toUpperCase()}</option>
                  ))}
                </select>
              </Field>
              <Field label="Budget"><Input type="number" min={1} value={createForm.budget} onChange={(event) => setCreateForm({ ...createForm, budget: event.target.value })} /></Field>
            </div>
            {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => void createCampaign()} loading={submitting}>Create</Button>
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
