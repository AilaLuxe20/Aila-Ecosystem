import { ProductWorkspace } from "@/components/platform/ProductWorkspace";

export default function CommercePage() {
  return (
    <ProductWorkspace
      title="Aila Commerce"
      description="Commerce operating system for intelligent online stores, inventory, and customer experiences."
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-8">
          <h2 className="text-2xl font-semibold text-white">
            Aila Commerce — Foundation Ready
          </h2>
          <p className="mt-3 max-w-2xl text-neutral-400">
            The platform foundation for Aila Commerce has been registered.
            Product manifest, metadata, navigation, workspace, and route
            registration are in place. Business logic and features will be
            added in subsequent phases.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Storefront Builder", status: "Planned" },
            { label: "Inventory Management", status: "Planned" },
            { label: "AI Pricing", status: "Planned" },
            { label: "Payment Processing", status: "Planned" },
            { label: "Customer Analytics", status: "Planned" },
            { label: "Order Management", status: "Planned" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/[0.06] bg-black/30 p-4"
            >
              <span className="text-xs uppercase tracking-wider text-yellow-400/60">
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
