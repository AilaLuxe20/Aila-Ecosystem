"use client";

import { useState } from "react";


type Analysis = {
  summary: string;
  riskScore: string;
  risks: string[];
  keyClauses: string[];
  recommendations: string[];
};


type DocumentResult = {
  fileName: string;
  pages: number;
  text: string;
};



export default function AilaLegalAnalyzer() {

  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const [document, setDocument] =
    useState<DocumentResult | null>(null);


  const [analysis, setAnalysis] =
    useState<Analysis | null>(null);


  const [error, setError] =
    useState("");




  function handleFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const selectedFile =
      event.target.files?.[0];


    if (selectedFile) {

      setFile(selectedFile);

      setDocument(null);

      setAnalysis(null);

      setError("");

    }

  }




  async function analyzeDocument() {

    if (!file) return;


    setLoading(true);

    setError("");



    try {


      // STEP 1 - Extract PDF text

      const formData = new FormData();

      formData.append(
        "file",
        file
      );



      const extractResponse =
        await fetch(
          "/products/ailalegal/extract",
          {
            method: "POST",
            body: formData,
          }
        );



      const extracted =
        await extractResponse.json();



      if (!extractResponse.ok) {

        throw new Error(
          extracted.error
        );

      }



      setDocument(extracted);



      // STEP 2 - Analyze extracted text


      const analysisResponse =
        await fetch(
          "/products/ailalegal/analyze",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({

              text: extracted.text

            }),

          }
        );



      const result =
        await analysisResponse.json();



      if (!analysisResponse.ok) {

        throw new Error(
          result.error
        );

      }



      setAnalysis(
        result.analysis
      );



    } catch (err) {


      setError(

        err instanceof Error
          ? err.message
          : "Something went wrong"

      );


    } finally {

      setLoading(false);

    }

  }





  return (

    <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8">


      <h2 className="text-2xl font-semibold">
        Document Intelligence Engine
      </h2>



      <p className="mt-2 text-gray-400">
        Upload legal documents and generate AI-powered analysis.
      </p>




      <label
        htmlFor="legal-document"
        className="mt-6 block text-sm text-gray-300"
      >
        Upload Legal PDF
      </label>



      <input

        id="legal-document"

        type="file"

        accept="application/pdf"

        onChange={handleFile}

        className="mt-3 block w-full"

      />




      {file && (

        <div className="mt-5 rounded-xl bg-black/40 p-4">

          Selected:

          <span className="ml-2 text-blue-400">
            {file.name}
          </span>

        </div>

      )}






      <button

        onClick={analyzeDocument}

        disabled={!file || loading}

        className="mt-6 rounded-xl bg-white px-6 py-3 text-black disabled:opacity-40"

      >

        {loading
          ? "AilaLegal AI Analyzing..."
          : "Analyze Document"}

      </button>





      {error && (

        <div className="mt-5 rounded-xl bg-red-500/10 p-4 text-red-400">

          {error}

        </div>

      )}






      {document && (

        <div className="mt-8 rounded-xl border border-white/10 bg-black/30 p-6">


          <h3 className="text-xl font-semibold">
            Document Processed
          </h3>


          <p className="mt-2 text-gray-300">
            {document.fileName}
          </p>


          <p className="text-gray-400">
            Pages: {document.pages}
          </p>


        </div>

      )}







      {analysis && (

        <div className="mt-8 space-y-6">


          <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-6">

            <h3 className="text-xl font-semibold">
              AI Summary
            </h3>


            <p className="mt-3 text-gray-300">
              {analysis.summary}
            </p>

          </div>






          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-6">

            <h3 className="text-xl font-semibold">
              Risk Score
            </h3>


            <p className="mt-3 text-yellow-400">
              {analysis.riskScore}
            </p>

          </div>







          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">

            <h3 className="text-xl font-semibold">
              Detected Risks
            </h3>


            <ul className="mt-3 list-disc pl-5 text-gray-300">

              {analysis.risks.map(
                (risk, index) => (

                  <li key={index}>
                    {risk}
                  </li>

                )
              )}

            </ul>

          </div>







          <div className="rounded-xl border border-white/10 bg-white/5 p-6">

            <h3 className="text-xl font-semibold">
              Key Clauses
            </h3>


            <ul className="mt-3 list-disc pl-5 text-gray-300">

              {analysis.keyClauses.map(
                (clause, index) => (

                  <li key={index}>
                    {clause}
                  </li>

                )
              )}

            </ul>

          </div>







          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-6">

            <h3 className="text-xl font-semibold">
              Recommendations
            </h3>


            <ul className="mt-3 list-disc pl-5 text-gray-300">

              {analysis.recommendations.map(
                (item, index) => (

                  <li key={index}>
                    {item}
                  </li>

                )
              )}

            </ul>

          </div>



        </div>

      )}



    </div>

  );

}