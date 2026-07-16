"use client";

import Image from "next/image";
import ImageUpload from "./ImageUpload";
import { useVision } from "@/hooks/useVision";

export default function VisionPanel() {
  const {
    preview,
    loading,
    result,
    select,
    analyze,
  } = useVision();

  return (
    <div className="space-y-6 rounded-[32px] border border-white/10 bg-[#07101f]/70 p-8 backdrop-blur-xl">

      <ImageUpload onSelectAction={select} />

      {preview && (
        <Image
          src={preview}
          alt="Preview"
          width={1200}
          height={800}
          unoptimized
          className="w-full rounded-3xl border border-white/10"
        />
      )}

      <button
        onClick={analyze}
        disabled={loading || !preview}
        className="w-full rounded-2xl bg-cyan-500 py-4 text-lg font-bold transition hover:bg-cyan-400 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze Image"}
      </button>

      {result && (
        <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1729] p-6">
          <h2 className="mb-3 text-xl font-bold">
            Aila Vision Analysis
          </h2>

          <p className="whitespace-pre-wrap text-white/80">
            {result}
          </p>
        </div>
      )}

    </div>
  );
}



