"use client";

import { useState } from "react";

export function useVision() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  function select(file: File) {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult("");
  }

  async function analyze() {
    if (!image) return;

    setLoading(true);

    const form = new FormData();
    form.append("image", image);

    const res = await fetch(
      "/api/intelligence/vision/analyze",
      {
        method: "POST",
        body: form,
      }
    );

    const data = await res.json();

    setLoading(false);

    if (data.analysis) {
      setResult(data.analysis);
    } else {
      setResult(data.error ?? "No response received.");
    }
  }

  return {
    preview,
    loading,
    result,
    select,
    analyze,
  };
}
