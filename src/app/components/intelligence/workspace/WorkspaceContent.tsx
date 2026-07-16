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

