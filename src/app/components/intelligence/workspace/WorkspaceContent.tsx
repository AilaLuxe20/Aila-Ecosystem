"use client";

import VisionPanel from "@/app/components/vision/VisionPanel";
import ChatWorkspace from "./ChatWorkspace";
import VoiceWorkspace from "./VoiceWorkspace";
import DocumentWorkspace from "@/app/components/documents/DocumentWorkspace";
import WebsiteGenerator from "@/app/components/generator/WebsiteGenerator";

type Props = {
  tab: string;
};

export default function WorkspaceContent({
  tab,
}: Props) {
  switch (tab) {
    case "chat":
      return <ChatWorkspace />;

    case "voice":
      return <VoiceWorkspace />;

    case "vision":
      return <VisionPanel />;

    case "documents":
      return <DocumentWorkspace />;

    case "website":
      return <WebsiteGenerator />;

    default:
      return <ChatWorkspace />;
  }
}

function WorkspacePlaceholder({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0d1729] p-10 text-center">
      <h2 className="text-3xl font-bold">{title}</h2>

      <p className="mt-4 text-white/60">
        {text}
      </p>
    </div>
  );
}




