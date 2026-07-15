"use client";

import AvatarOrb from "./AvatarOrb";
import AvatarThinking from "./AvatarThinking";
import AvatarStatus from "./AvatarStatus";

export default function AilaAvatar() {
  return (
    <div className="fixed bottom-10 right-10 z-50">

      <div className="relative">

        <AvatarOrb />

        <AvatarThinking />

        <AvatarStatus />

      </div>

    </div>
  );
}