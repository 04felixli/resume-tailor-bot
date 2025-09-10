export default function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Tailor <span className="text-indigo-400">Resume</span>
          </h1>
          <p className="text-sm text-slate-400">
            Paste job requirements and see your experiences tailored for the job
            — fast, smart, and simple.
          </p>
        </div>
      </div>
    </header>
  );
}
