import { ProductWorkspace } from "@/components/platform/ProductWorkspace";

export default function SocialPage() {
  return (
    <ProductWorkspace
      title="Aila Social"
      description="Social media platform for community building, content creation, and intelligent social experiences."
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-8">
          <h2 className="text-2xl font-semibold text-white">
            Aila Social — Foundation Ready
          </h2>
          <p className="mt-3 max-w-2xl text-neutral-400">
            The platform foundation for Aila Social has been registered.
            Product manifest, metadata, navigation, workspace, and route
            registration are in place. Business logic and features will be
            added in subsequent phases.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Community Hub", status: "Planned" },
            { label: "Content Studio", status: "Planned" },
            { label: "Social Graph", status: "Planned" },
            { label: "AI Moderation", status: "Planned" },
            { label: "Engagement Analytics", status: "Planned" },
            { label: "Messaging", status: "Planned" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/[0.06] bg-black/30 p-4"
            >
              <span className="text-xs uppercase tracking-wider text-purple-400/60">
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
