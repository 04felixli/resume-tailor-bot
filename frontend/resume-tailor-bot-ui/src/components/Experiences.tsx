import { useStateContext } from "../contexts/StateContext";
import type { Experience } from "../types/StateContextTypes";

function ExperienceCard({
  experience,
  onChange,
  onDelete,
}: {
  experience: Experience;
  onChange: (exp: Experience) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-sm p-4 mb-4 relative">
      <button
        onClick={onDelete}
        className="absolute top-1 right-1 text-slate-400 hover:text-rose-500"
        aria-label="Delete experience"
      >
        &times;
      </button>
      <div className="mb-2 flex gap-3">
        <input
          type="text"
          value={experience.company}
          onChange={(e) => onChange({ ...experience, company: e.target.value })}
          placeholder="Company Name"
          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={experience.role}
          onChange={(e) => onChange({ ...experience, role: e.target.value })}
          placeholder="Role/Title"
          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
        />
      </div>
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
        What did you do? (one bullet per line)
      </label>
      <textarea
        value={experience.bullets}
        onChange={(e) => onChange({ ...experience, bullets: e.target.value })}
        placeholder={
          "Describe your responsibilities, achievements, etc.\nOne bullet per line."
        }
        className="w-full min-h-[100px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
      />
    </div>
  );
}

export default function Experiences() {
  const { experiences, addExperience, updateExperience, deleteExperience } =
    useStateContext();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          Experiences
        </h2>
        <button
          onClick={addExperience}
          className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium shadow hover:bg-indigo-700 transition"
        >
          Add Experience
        </button>
      </div>
      {experiences.length === 0 && (
        <div className="text-slate-500 dark:text-slate-400 mb-4">
          No experiences added yet.
        </div>
      )}
      {experiences.map((exp) => (
        <ExperienceCard
          key={exp.id}
          experience={exp}
          onChange={(updated) => updateExperience(exp.id, updated)}
          onDelete={() => deleteExperience(exp.id)}
        />
      ))}
    </div>
  );
}
