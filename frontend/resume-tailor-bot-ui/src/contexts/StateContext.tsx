import React, { createContext, useContext, useState } from 'react';

interface StateContextType {
  resumeFile: File | null;
  setResumeFile: React.Dispatch<React.SetStateAction<File | null>>;
  jdText: string;
  setJdText: React.Dispatch<React.SetStateAction<string>>;
  responseText: string;
  setResponseText: React.Dispatch<React.SetStateAction<string>>;
  topK: number;
  setTopK: React.Dispatch<React.SetStateAction<number>>;
  includeProjects: boolean;
  setIncludeProjects: React.Dispatch<React.SetStateAction<boolean>>;
  bulletStyle: BulletStyle;
  setBulletStyle: React.Dispatch<React.SetStateAction<BulletStyle>>;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  onFiles: (files: FileList | null) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  clearAll: () => void;
  handleTailor: () => void;
  handleCopy: () => Promise<void>;
}

type BulletStyle = "concise" | "balanced" | "detailed";

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider = ({ children }: { children: React.ReactNode }) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState<string>("");
  const [responseText, setResponseText] = useState<string>("");
  const [topK, setTopK] = useState<number>(3);
  const [includeProjects, setIncludeProjects] = useState<boolean>(true);
  const [bulletStyle, setBulletStyle] = useState<BulletStyle>("balanced");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    setError("");
    setResumeFile(f);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const clearAll = () => {
    setResumeFile(null);
    setJdText("");
    setResponseText("");
    setTopK(3);
    setIncludeProjects(true);
    setBulletStyle("balanced");
    setError("");
    setMessage("");
  };

  const handleTailor = () => {
  setMessage("Tailor action pressed. Wire this up to FastAPI endpoint.");
  setTimeout(() => setMessage("") , 3000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(responseText);
  setMessage("Copied response to clipboard.");
  setTimeout(() => setMessage("") , 1500);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const value: StateContextType = {
    resumeFile,
    setResumeFile,
    jdText,
    setJdText,
    responseText,
    setResponseText,
    topK,
    setTopK,
    includeProjects,
    setIncludeProjects,
    bulletStyle,
    setBulletStyle,
    message,
    setMessage,
    error,
    setError,
    onFiles,
    onDrop,
    onDragOver,
    clearAll,
    handleTailor,
    handleCopy,
  };

  return (
    <StateContext.Provider value={value}>
      {children}
    </StateContext.Provider>
  );
};


export function useStateContext() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return context;
}
