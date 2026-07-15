type Props = {
  analysis: string;
};

export default function VisionAnalysis({
  analysis,
}: Props) {
  if (!analysis) return null;

  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-[#07101f] p-8">

      <h2 className="mb-6 text-2xl font-bold">
        Aila Vision
      </h2>

      <div className="whitespace-pre-wrap leading-8 text-white/80">
        {analysis}
      </div>

    </section>
  );
}
