import { Copy } from "lucide-react";
import { useStateContext } from "../contexts/StateContext";

export default function Response() {
  const { responseText, handleCopy, message } = useStateContext();

  let structuredData: any = null;
  try {
    structuredData = responseText ? JSON.parse(responseText) : null;
  } catch (e) {
    structuredData = null;
  }

  const rewrittenBullets =
    structuredData && Array.isArray(structuredData.rewrittenBullets)
      ? structuredData.rewrittenBullets
      : null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-sm p-4 md:p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          Tailored Resume Output
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Copy className="h-3.5 w-3.5" /> Copy
          </button>
        </div>
      </div>
      {rewrittenBullets ? (
        <div className="space-y-6">
          {rewrittenBullets.map((item: any) => (
            <div key={item.id} className="border-b pb-4">
              <div className="font-semibold text-indigo-700 dark:text-indigo-300">
                {item.company ? `${item.company} — ` : ""}
                {item.role || item.name}
              </div>
              <div className="text-xs text-slate-500 mb-2">
                {item.start} – {item.end}
              </div>
              <ul className="list-disc pl-5">
                {item.bullets &&
                  item.bullets.map((bullet: string, idx: number) => (
                    <li
                      key={idx}
                      className="mb-1 text-slate-800 dark:text-slate-200"
                    >
                      {bullet}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="text-slate-500 dark:text-slate-400">
            Tailored output will appear here.
          </div>
          {message && (
            <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300 px-3 py-2 text-sm">
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
