import React, { useState, useRef } from "react";
import { X } from "lucide-react";
import { useStateContext } from "../contexts/StateContext";

export default function Skills() {
  const { skills, setSkills } = useStateContext();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      if (!skills.includes(input.trim())) {
        setSkills([...skills, input.trim()]);
      }
      setInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  return (
    <div className="flex-col items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
        Add Skills
      </h2>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={addSkill}
        placeholder="Type a skill and press Enter"
        className="mt-4 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm mb-3"
      />
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <div
            key={skill}
            className="group flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3 py-1 text-sm text-slate-800 dark:text-slate-200 relative transition"
          >
            <span>{skill}</span>
            <button
              onClick={() => removeSkill(skill)}
              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-500"
              aria-label={`Remove ${skill}`}
              tabIndex={-1}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
