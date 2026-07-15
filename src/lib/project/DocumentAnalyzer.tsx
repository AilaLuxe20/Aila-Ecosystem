"use client";

import { useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  Loader2,
} from "lucide-react";


export default function DocumentAnalyzer() {

  const [file, setFile] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(false);


  function handleAnalyze() {

    setAnalyzing(true);

    setTimeout(() => {

      setAnalyzing(false);
      setResult(true);

    }, 2000);

  }



  return (

    <div
      className="
      rounded-3xl
      border
      border-white/10
      bg-white/5
      backdrop-blur-xl
      p-8
      "
    >


      <div className="flex items-center gap-3">

        <FileText className="text-cyan-400"/>

        <h2 className="text-xl font-semibold">
          Document Analyzer
        </h2>

      </div>




      <p className="mt-3 text-gray-400">
        Upload legal documents and let Aila Intelligence extract clauses,
        obligations and risks.
      </p>




      {/* Upload Area */}

      <label
        className="
        mt-6
        flex
        cursor-pointer
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-white/20
        p-8
        hover:bg-white/5
        transition
        "
      >

        <UploadCloud
          size={40}
          className="text-gray-400"
        />


        <p className="mt-3 text-sm text-gray-400">
          Click to upload PDF or DOC files
        </p>



        <input
          type="file"
          className="hidden"
          onChange={(e)=>{

            const selected = e.target.files?.[0];

            if(selected){
              setFile(selected.name);
            }

          }}
        />


      </label>





      {file && (

        <div
          className="
          mt-5
          rounded-xl
          bg-white/5
          p-4
          "
        >

          <p className="text-sm">
            Uploaded:
          </p>


          <p className="mt-1 text-cyan-400">
            {file}
          </p>


        </div>

      )}






      <button

        onClick={handleAnalyze}

        disabled={!file || analyzing}

        className="
        mt-6
        flex
        w-full
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-white
        px-5
        py-3
        font-semibold
        text-black
        disabled:opacity-40
        "

      >

        {
          analyzing ? (

            <>
              <Loader2 className="animate-spin"/>
              Analyzing...
            </>

          ) : (

            <>
              Analyze Document
            </>

          )
        }


      </button>






      {result && (

        <div
          className="
          mt-6
          rounded-2xl
          border
          border-green-400/20
          bg-green-400/10
          p-5
          "
        >

          <div className="flex items-center gap-2">

            <CheckCircle
              className="text-green-400"
            />


            <p className="font-semibold">
              Analysis Complete
            </p>

          </div>



          <ul
            className="
            mt-4
            space-y-2
            text-sm
            text-gray-300
            "
          >

            <li>
              ✓ Contract summary generated
            </li>

            <li>
              ✓ Important clauses identified
            </li>

            <li>
              ✓ Risk areas detected
            </li>


          </ul>


        </div>

      )}



    </div>

  );

}