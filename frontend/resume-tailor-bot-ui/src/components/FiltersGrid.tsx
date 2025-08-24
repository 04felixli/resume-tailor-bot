import { useStateContext } from "../contexts/StateContext";

export default function FiltersGrid() {
    const { topK, setTopK, includeProjects, setIncludeProjects, bulletStyle, setBulletStyle } = useStateContext();
    
    return (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Top X items */}
            <label className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 p-3">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Top X items</span>
                <select
                    value={topK}
                    onChange={(e) => setTopK(parseInt(e.target.value))}
                    className="mt-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
            </label>
            {/* Include projects */}
            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 p-3">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Include projects</span>
                <input
                    type="checkbox"
                    checked={includeProjects}
                    onChange={(e) => setIncludeProjects(e.target.checked)}
                    className="h-4 w-4 accent-indigo-600"
                />
            </label>
            {/* Bullet style */}
            <label className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 p-3">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Bullet style</span>
                <select
                    value={bulletStyle}
                    onChange={(e) => setBulletStyle(e.target.value as typeof bulletStyle)}
                    className="mt-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                >
                    <option value="concise">Concise</option>
                    <option value="balanced">Balanced</option>
                    <option value="detailed">Detailed</option>
                </select>
            </label>
        </div>
    )
}