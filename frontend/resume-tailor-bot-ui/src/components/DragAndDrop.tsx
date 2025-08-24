import { useStateContext } from "../contexts/StateContext";

export default function DragAndDrop() {
    const { onDrop, onDragOver } = useStateContext();
    
    return (
        <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="mt-4 border-2 border-dashed rounded-xl p-6 text-center border-slate-300 dark:border-slate-700 hover:border-indigo-400 transition"
        >
            <p className="text-sm text-slate-600 dark:text-slate-400">
                Drag & drop your PDF here
            </p>
        </div>
    );
}
