
import { FileText, Info, UploadCloud } from "lucide-react";
import { useRef } from "react";
import { useStateContext } from "../contexts/StateContext";


export default function UploadRow() {
    const inputRef = useRef<HTMLInputElement>(null);
    const { resumeFile, onFiles } = useStateContext();

    const onPickFile = () => {
        if (inputRef.current) {
            inputRef.current.value = ""; // reset so same file can be picked again
            inputRef.current.click();
        }
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={onPickFile}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2 text-sm font-medium shadow-sm hover:shadow transition"
            >
                <UploadCloud className="h-4 w-4" />
                {resumeFile ? "Change PDF" : "Upload Resume PDF"}
            </button>
            <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
            />
            {resumeFile ? (
                <div className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[60ch] flex items-center gap-2">
                    <FileText className="h-4 w-4" /> {resumeFile.name}
                </div>
            ) : (
                <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Info className="h-4 w-4" /> PDF only · drag & drop below
                </div>
            )}
        </div>
    );
}
