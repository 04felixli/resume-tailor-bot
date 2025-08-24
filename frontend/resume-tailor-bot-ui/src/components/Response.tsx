import { Copy } from "lucide-react";
import { useStateContext } from "../contexts/StateContext";

export default function Response() {
    const { responseText, setResponseText, handleCopy } = useStateContext();
    
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-sm p-4 md:p-5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Response (JSON)</h2>
                <div className="flex items-center gap-2">
                <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <Copy className="h-3.5 w-3.5" /> Copy
                </button>
                </div>
            </div>
            <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder={"Tailored output will appear here once wired to backend."}
                className="min-h-[380px] w-full flex-1 resize-y rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
    )
}