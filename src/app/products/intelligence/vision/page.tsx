import VisionPanel from "@/app/components/vision/VisionPanel";

export default function VisionPage() {
  return (
    <main className="min-h-screen bg-[#030712] px-6 py-20">
      <div className="mx-auto max-w-6xl">

        <h1 className="mb-4 text-5xl font-bold">
          Aila Vision
        </h1>

        <p className="mb-12 text-white/60">
          Upload an image and let Aila understand it.
        </p>

        <VisionPanel />

      </div>
    </main>
  );
}
