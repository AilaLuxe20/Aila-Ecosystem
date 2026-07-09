"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface AilaLegalContextType {
  fileName: string;
  setFileName: (name: string) => void;

  analyzed: boolean;
  setAnalyzed: (value: boolean) => void;
}


const AilaLegalContext =
  createContext<AilaLegalContextType | undefined>(undefined);



export function AilaLegalProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [fileName, setFileName] = useState("");

  const [analyzed, setAnalyzed] = useState(false);


  return (
    <AilaLegalContext.Provider
      value={{
        fileName,
        setFileName,
        analyzed,
        setAnalyzed,
      }}
    >
      {children}
    </AilaLegalContext.Provider>
  );

}



export function useAilaLegal() {

  const context = useContext(AilaLegalContext);


  if (!context) {
    throw new Error(
      "useAilaLegal must be used inside AilaLegalProvider"
    );
  }


  return context;

}