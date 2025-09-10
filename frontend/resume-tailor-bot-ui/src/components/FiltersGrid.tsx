import { useStateContext } from "../contexts/StateContext";

export default function FiltersGrid() {
  const {
    topK,
    setTopK,
    rewrite,
    setRewrite,
    experiences = [],
    projects = [],
  } = useStateContext();

  // Calculate the dropdown range
  const totalItems = (experiences?.length || 0) + (projects?.length || 0);
  const options =
    totalItems > 0 ? Array.from({ length: totalItems }, (_, i) => i + 1) : [0];

  return (
    <div className="flex-col items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
        Settings
      </h2>
      <div className="mt-4">
        {/* Top X items */}
        <label className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 p-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Select Top X Relevant Experiences and/or Projects
          </span>
          <select
            value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value))}
            className="mt-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
          >
            {options.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        {/* Include projects */}
        <label className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 p-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Rewrite Bullet Points for Selected Experiences and/or Projects
          </span>
          <input
            type="checkbox"
            checked={rewrite}
            onChange={(e) => setRewrite(e.target.checked)}
            className="h-4 w-4 accent-indigo-600"
          />
        </label>
      </div>
    </div>
  );
}
