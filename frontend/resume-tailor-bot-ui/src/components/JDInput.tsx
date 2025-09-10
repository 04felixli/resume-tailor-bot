import { useStateContext } from "../contexts/StateContext";

export default function JDInput() {
  const { jdText, setJdText } = useStateContext();
  const jdCharCount = jdText.length;

  return (
    <div className="rounded-2xl shadow-sm flex flex-col mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Job Requirements, Responsibilities, and/or Preferred Qualifications
        </h2>
        <span className="text-xs text-slate-400">{jdCharCount} chars</span>
      </div>
      <textarea
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        placeholder={`Paste the job's requirements, responsibilities, and/or preferred qualifications here.\nOne bullet per line.`}
        className="min-h-[380px] w-full flex-1 resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
