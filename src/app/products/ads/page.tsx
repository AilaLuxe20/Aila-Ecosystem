import { ProductWorkspace } from "@/components/platform/ProductWorkspace";

export default function AdsPage() {
  return (
    <ProductWorkspace
      title="Aila Ads"
      description="Advertising platform for campaign management, audience targeting, and AI-powered ad optimization."
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-8">
          <h2 className="text-2xl font-semibold text-white">
            Aila Ads — Foundation Ready
          </h2>
          <p className="mt-3 max-w-2xl text-neutral-400">
            The platform foundation for Aila Ads has been registered.
            Product manifest, metadata, navigation, workspace, and route
            registration are in place. Business logic and features will be
            added in subsequent phases.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Campaign Manager", status: "Planned" },
            { label: "Audience Targeting", status: "Planned" },
            { label: "AI Optimization", status: "Planned" },
            { label: "Creative Studio", status: "Planned" },
            { label: "Performance Analytics", status: "Planned" },
            { label: "Media Buying", status: "Planned" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/[0.06] bg-black/30 p-4"
            >
              <span className="text-xs uppercase tracking-wider text-amber-400/60">
                {item.status}
              </span>
              <p className="mt-2 text-sm font-medium text-white">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ProductWorkspace>
  );
}
