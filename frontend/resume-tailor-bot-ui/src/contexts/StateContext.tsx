import React, { createContext, useContext, useEffect, useState } from "react";
import type {
  BulletStyle,
  Experience,
  Projects,
} from "../types/StateContextTypes";

interface StateContextType {
  resumeFile: File | null;
  setResumeFile: React.Dispatch<React.SetStateAction<File | null>>;
  jdText: string;
  setJdText: React.Dispatch<React.SetStateAction<string>>;
  responseText: string;
  setResponseText: React.Dispatch<React.SetStateAction<string>>;
  topK: number;
  setTopK: React.Dispatch<React.SetStateAction<number>>;
  rewrite: boolean;
  setRewrite: React.Dispatch<React.SetStateAction<boolean>>;
  bulletStyle: BulletStyle;
  setBulletStyle: React.Dispatch<React.SetStateAction<BulletStyle>>;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  experiences: Experience[];
  setExperiences: React.Dispatch<React.SetStateAction<Experience[]>>;
  projects: Projects[];
  setProjects: React.Dispatch<React.SetStateAction<Projects[]>>;
  skills: string[];
  setSkills: React.Dispatch<React.SetStateAction<string[]>>;
  onFiles: (files: FileList | null) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  clearAll: () => void;
  handleTailor: () => void;
  handleCopy: () => Promise<void>;
  addExperience: () => void;
  updateExperience: (id: string, updated: Experience) => void;
  deleteExperience: (id: string) => void;
  addProject: () => void;
  updateProject: (id: string, updated: Projects) => void;
  deleteProject: (id: string) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider = ({ children }: { children: React.ReactNode }) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState<string>("");
  const [responseText, setResponseText] = useState<string>("");
  const [topK, setTopK] = useState<number>(3);
  const [rewrite, setRewrite] = useState<boolean>(true);
  const [bulletStyle, setBulletStyle] = useState<BulletStyle>("balanced");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Projects[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    console.log("Experiences:", experiences);
    console.log("Projects:", projects);
    console.log("Skills:", skills);
  }, [experiences, projects, skills]);

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
    setRewrite(true);
    setBulletStyle("balanced");
    setError("");
    setMessage("");
    setExperiences([]);
    setProjects([]);
    setSkills([]);
  };

  const handleTailor = () => {
    // Build items array from experiences and projects
    const items = [
      ...experiences.map((exp) => ({
        id: exp.id,
        type: "experience",
        company: exp.company,
        role: exp.role,
        name: null,
        start: exp.startDate || null,
        end: exp.endDate || null,
        bullets: exp.bullets
          ? exp.bullets
              .split("\n")
              .map((b) => b.trim())
              .filter((b) => b)
          : [],
      })),
      ...projects.map((proj) => ({
        id: proj.id,
        type: "project",
        company: null,
        role: null,
        name: proj.name,
        start: null,
        end: null,
        bullets: proj.bullets
          ? proj.bullets
              .split("\n")
              .map((b) => b.trim())
              .filter((b) => b)
          : [],
      })),
    ];

    const payload = {
      rewrite: rewrite,
      job_description: jdText,
      top_x: topK,
      skills,
      items,
    };

    // Call backend endpoint and print response
    fetch(`${import.meta.env.VITE_API_BASE}/api/tailor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          console.error("Tailor request failed with status:", res.status);
          setMessage("Tailor request failed.");
          setTimeout(() => setMessage(""), 3000);
        }
        return res.json();
      })
      .then((data) => {
        setResponseText(JSON.stringify(data, null, 2));
      })
      .catch((err) => {
        console.error("Tailor error:", err);
        setMessage("Tailor request failed.");
        setTimeout(() => setMessage(""), 3000);
      });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(responseText);
      setMessage("Copied response to clipboard.");
      setTimeout(() => setMessage(""), 1500);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const addExperience = () => {
    setExperiences((exps) => [
      ...exps,
      {
        id: Math.random().toString(36).slice(2),
        company: "",
        role: "",
        bullets: "",
      },
    ]);
  };

  const updateExperience = (id: string, updated: Experience) => {
    setExperiences((exps) =>
      exps.map((exp) => (exp.id === id ? updated : exp))
    );
  };

  const deleteExperience = (id: string) => {
    setExperiences((exps) => exps.filter((exp) => exp.id !== id));
  };

  const addProject = () => {
    setProjects((projs) => [
      ...projs,
      {
        id: Math.random().toString(36).slice(2),
        name: "",
        bullets: "",
      },
    ]);
  };

  const updateProject = (id: string, updated: Projects) => {
    setProjects((projs) =>
      projs.map((proj) => (proj.id === id ? updated : proj))
    );
  };

  const deleteProject = (id: string) => {
    setProjects((projs) => projs.filter((proj) => proj.id !== id));
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
    rewrite,
    setRewrite,
    bulletStyle,
    setBulletStyle,
    message,
    setMessage,
    error,
    setError,
    experiences,
    setExperiences,
    projects,
    setProjects,
    skills,
    setSkills,
    onFiles,
    onDrop,
    onDragOver,
    clearAll,
    handleTailor,
    handleCopy,
    addExperience,
    updateExperience,
    deleteExperience,
    addProject,
    updateProject,
    deleteProject,
  };

  return (
    <StateContext.Provider value={value}>{children}</StateContext.Provider>
  );
};

export function useStateContext() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return context;
}
