"use client";

import {
  LayoutDashboard,
  FileText,
  Bot,
  ShieldAlert,
  BarChart3,
  Settings,
} from "lucide-react";

const menu = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Documents",
    icon: FileText,
  },
  {
    name: "AI Assistant",
    icon: Bot,
  },
  {
    name: "Risk Analysis",
    icon: ShieldAlert,
  },
  {
    name: "Reports",
    icon: BarChart3,
  },
  {
    name: "Settings",
    icon: Settings,
  },
];

export default function LegalSidebar() {
  return (
    <aside
      className="
      w-72
      min-h-screen
      bg-black/80
      backdrop-blur-xl
      border-r
      border-white/10
      p-6
      text-white
      "
    >

      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold">
          AilaLegal
        </h1>

        <p className="text-sm text-gray-400">
          AI Legal Intelligence
        </p>
      </div>


      {/* Navigation */}
      <nav className="space-y-3">

        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className="
              flex
              items-center
              gap-4
              w-full
              rounded-xl
              px-4
              py-3
              text-gray-300
              hover:bg-white/10
              hover:text-white
              transition
              "
            >
              <Icon size={20}/>

              <span>
                {item.name}
              </span>

            </button>
          );
        })}

      </nav>


      {/* Bottom */}
      <div
        className="
        mt-10
        rounded-xl
        bg-gradient-to-br
        from-white/10
        to-transparent
        p-4
        "
      >

        <p className="text-sm text-gray-400">
          Powered by
        </p>

        <p className="font-semibold">
          Aila Intelligence
        </p>

      </div>


    </aside>
  );
}