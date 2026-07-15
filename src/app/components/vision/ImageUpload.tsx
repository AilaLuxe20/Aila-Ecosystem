"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

type Props = {
  onSelectAction: (file: File) => void;
};

export default function ImageUpload({
  onSelectAction,
}: Props) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onSelectAction(acceptedFiles[0]);
      }
    },
    [onSelectAction]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={
        "rounded-3xl border-2 border-dashed p-10 text-center transition cursor-pointer " +
        (isDragActive
          ? "border-cyan-400 bg-cyan-500/10"
          : "border-white/10 bg-[#0d1729]")
      }
    >
      <input {...getInputProps()} />

      <UploadCloud
        size={54}
        className="mx-auto text-cyan-400"
      />

      <h3 className="mt-6 text-2xl font-bold">
        Upload Image
      </h3>

      <p className="mt-3 text-white/60">
        Drag & Drop or Click
      </p>
    </div>
  );
}


