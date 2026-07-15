"use client";

import { useState } from "react";

export default function DocumentWorkspace() {
  const [fileName, setFileName] = useState("");

  async function upload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setFileName(file.name);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch(
      "/products/ailalegal/extract",
      {
        method: "POST",
        body: form,
      }
    );

    const data = await res.json();

    alert(JSON.stringify(data, null, 2));
  }

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-[#07101f]/70 p-8">

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={upload}
        className="block w-full rounded-2xl border border-white/10 bg-[#0d1729] p-4"
      />

      {fileName && (
        <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1729] p-5">
          {fileName}
        </div>
      )}

    </div>
  );
}
