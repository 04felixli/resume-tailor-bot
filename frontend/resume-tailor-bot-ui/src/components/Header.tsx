export default function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Tailor <span className="text-indigo-600 dark:text-indigo-400">Resume</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            UI-only prototype. Upload PDF, paste a JD, adjust filters, and preview layout.
          </p>
        </div>
      </div>
    </header>
  );
}
