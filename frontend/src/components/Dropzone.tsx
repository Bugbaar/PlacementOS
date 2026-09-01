import { useCallback, useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { api } from "../api/client";
import { setError, setStatus, setUpload } from "../store/engineSlice";
import { useAppDispatch, useAppSelector } from "../store";

export default function Dropzone() {
  const dispatch = useAppDispatch();
  const { fileName, count, status } = useAppSelector((s) => s.engine);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const consume = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      dispatch(setStatus("uploading"));
      try {
        const res = await api.uploadCsv(file);
        dispatch(setUpload(res));
      } catch (err) {
        dispatch(setError(err instanceof Error ? err.message : "Upload failed"));
      }
    },
    [dispatch],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void consume(e.dataTransfer.files[0]);
      }}
      onClick={() => inputRef.current?.click()}
      className={`mesh relative cursor-pointer rounded-xl border border-dashed p-10 flex flex-col items-center justify-center transition-all duration-300 bg-zinc-900/50 ${
        dragging
          ? "border-transparent drop-glow bg-gradient-to-r from-blue-500/10 to-purple-600/10"
          : "border-zinc-700 hover:border-zinc-500"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => void consume(e.target.files?.[0])}
      />
      <div className={`mb-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4 ${dragging ? "animate-bounce" : ""}`}>
        <FileUp className="h-6 w-6 text-blue-400" />
      </div>
      <p className="text-sm font-medium text-zinc-200">
        {status === "uploading"
          ? "Parsing student records…"
          : fileName
            ? `${fileName} · ${count} students indexed`
            : "Drop a student batch (.csv)"}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Columns: rollNumber, name, email, branch, cgpa, activeBacklogs, skills
      </p>
      <a
        href="/sample-students-500.csv"
        onClick={(e) => e.stopPropagation()}
        className="mt-4 text-xs text-blue-400 hover:text-blue-300"
      >
        Download 500-row sample dataset
      </a>
    </div>
  );
}
