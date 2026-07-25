"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function DocumentAnalyzer() {
  const [fileName, setFileName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (file) {
      setFileName(file.name);
      setAnalyzed(false);
    }
  }

  function analyzeDocument() {
    if (!fileName) return;

    setAnalyzing(true);
    setAnalyzed(false);

    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 2500);
  }

  return (
    <section className="w-full max-w-5xl mx-auto mt-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8"
      >
        <h2 className="text-2xl font-semibold text-white">
          Document Intelligence
        </h2>

        <p className="text-gray-400 mt-2">
          Upload legal documents and let AilaLegal analyze important details.
        </p>

        <label className="block mt-6 cursor-pointer">
          <div className="border border-dashed border-white/20 rounded-2xl p-10 text-center bg-black/20">
            <div className="text-4xl">
              📄
            </div>

            {fileName ? (
              <p className="text-green-400 mt-3">
                Uploaded: {fileName}
              </p>
            ) : (
              <p className="text-white mt-3">
                Drag & drop your document here
              </p>
            )}
          </div>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleUpload}
            className="hidden"
          />
        </label>

        <button
          onClick={analyzeDocument}
          disabled={!fileName || analyzing}
          className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white disabled:opacity-40"
        >
          {analyzing ? "AI Analyzing Document..." : "Analyze Document"}
        </button>

        {analyzing && (
          <div className="mt-6 text-center text-purple-300">
            Scanning clauses...
            <br />
            Extracting obligations...
            <br />
            Detecting risks...
          </div>
        )}

        {analyzed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
              <h3 className="text-xl text-white font-semibold">
                AI Analysis Report
              </h3>

              <p className="text-gray-400 mt-3">
                Document:
                <span className="text-white"> {fileName}</span>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <ReportCard
                title="Document Overview"
                text="This document contains project information, responsibilities, requirements, and delivery-related terms."
              />

              <ReportCard
                title="Detected Sections"
                text="✓ Project scope
✓ Responsibilities
✓ Technical requirements
✓ Delivery terms"
              />

              <ReportCard
                title="Risk Assessment"
                text="Medium Risk. Some areas may require clarification before agreement."
              />

              <ReportCard
                title="Potential Concerns"
                text="- Unclear responsibilities
- Missing acceptance criteria
- Ownership terms should be reviewed"
              />

              <ReportCard
                title="Key Clauses"
                text="1. Deliverables
2. Payment Terms
3. Intellectual Property
4. Support Obligations"
              />

              <ReportCard
                title="AI Recommendation"
                text="Review highlighted sections carefully and confirm unclear obligations."
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

function ReportCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h4 className="text-white font-semibold">
        {title}
      </h4>

      <p className="text-gray-400 whitespace-pre-line mt-3 text-sm">
        {text}
      </p>
    </div>
  );
}
