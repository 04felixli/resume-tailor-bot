import { useStateContext } from "../contexts/StateContext";

export default function ActionButtons() {
  const { handleTailor, clearAll } = useStateContext();
  return (
    <div className="flex space-x-2 justify-end w-full">
      <button
        onClick={handleTailor}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
      >
        Tailor
      </button>
      <button
        onClick={clearAll}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
      >
        Reset
      </button>
    </div>
  );
}
