import "./App.css";
import Header from "./components/Header";
import { StateProvider } from "./contexts/StateContext";
import FiltersGrid from "./components/FiltersGrid";
import JDInput from "./components/JDInput";
import Response from "./components/Response";
import Skills from "./components/Skills";
import Experiences from "./components/Experiences";
import Projects from "./components/Projects";
import ActionButtons from "./components/ActionButtons";

export default function App() {
  return (
    <StateProvider>
      <AppContent />
    </StateProvider>
  );
}

function AppContent() {
  // const { error, message } = useStateContext();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 dark:from-slate-900 dark:to-slate-950 dark:text-slate-100">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-sm p-4 md:p-6">
          <Skills />
          <Experiences />
          <Projects />
          <FiltersGrid />
          <JDInput />
          <ActionButtons />

          {/* {error && (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 px-3 py-2 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300 px-3 py-2 text-sm">
              {message}
            </div>
          )} */}
        </section>

        <section className="mt-6">
          <Response />
        </section>
      </main>
    </div>
  );
}
