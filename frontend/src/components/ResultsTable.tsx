import type { ReactNode } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { downloadExport } from "../api/client";
import { hasRequiredSkills, skillKey } from "../lib/eligibility";
import { useAppDispatch, useAppSelector } from "../store";
import { setResultFilter } from "../store/engineSlice";
import type { EligibilityCriteria, EvaluationResult } from "../types";

export default function ResultsTable() {
  const dispatch = useAppDispatch();
  const { results, resultFilter, runId, status, appliedCriteria, criteria } = useAppSelector(
    (s) => s.engine,
  );
  const locked = appliedCriteria ?? criteria;

  const strictResults = results.map((row) => tightenRow(row, locked));

  const rows =
    resultFilter === "all"
      ? strictResults
      : strictResults.filter((r) => (resultFilter === "shortlisted" ? r.eligible : !r.eligible));

  const shortlistedCount = strictResults.filter((r) => r.eligible).length;
  const requiredLabel = locked.requiredSkills.join(", ") || "none";

  if (!runId && status === "idle") {
    return null;
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-[#18181B] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <div className="flex gap-1 rounded-lg border border-zinc-800 p-1">
          {(["shortlisted", "rejected", "all"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => dispatch(setResultFilter(key))}
              className={`rounded-md px-3 py-1 text-xs capitalize ${
                resultFilter === key ? "bg-zinc-800 text-white" : "text-zinc-500"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
        {runId ? (
          <div className="flex flex-wrap gap-2">
            <ExportBtn icon={<FileSpreadsheet className="h-3.5 w-3.5" />} label="CSV" onClick={() => downloadExport(runId, "csv")} />
            <ExportBtn icon={<FileText className="h-3.5 w-3.5" />} label="Audit CSV" onClick={() => downloadExport(runId, "audit")} />
            <ExportBtn icon={<Download className="h-3.5 w-3.5" />} label="PDF" onClick={() => downloadExport(runId, "pdf")} />
          </div>
        ) : null}
      </div>
      {locked.requiredSkills.length > 0 && resultFilter === "shortlisted" ? (
        <p className="border-b border-zinc-800 px-4 py-2 text-[11px] text-zinc-500">
          Showing {shortlistedCount} shortlisted · every row must include{" "}
          <span className="text-emerald-400">
            {requiredLabel} ({locked.skillMatchMode === "all" ? "all required" : "any one"})
          </span>
          . Required skills are highlighted in green.
        </p>
      ) : null}
      <div className="max-h-96 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-[#18181B] text-[10px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-2">Roll</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Branch</th>
              <th className="px-4 py-2">CGPA</th>
              <th className="px-4 py-2">All skills</th>
              <th className="px-4 py-2">Required</th>
              <th className="px-4 py-2">Decision</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.student.rollNumber} className="border-t border-zinc-800/80 align-top">
                <td className="px-4 py-2 font-mono text-zinc-400">{row.student.rollNumber}</td>
                <td className="px-4 py-2 text-zinc-200">{row.student.name}</td>
                <td className="px-4 py-2 text-zinc-400">{row.student.branch}</td>
                <td className="px-4 py-2">{row.student.cgpa.toFixed(2)}</td>
                <td className="px-4 py-2">
                  <SkillPills skills={row.student.skills} required={locked.requiredSkills} />
                </td>
                <td className="px-4 py-2">
                  <RequiredChecks skills={row.student.skills} required={locked.requiredSkills} />
                </td>
                <td className="px-4 py-2">
                  {row.eligible ? (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">Shortlisted</span>
                  ) : (
                    <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-rose-400" title={row.reasons.join(" · ")}>
                      {row.reasons.join(" · ") || "Rejected"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function tightenRow(row: EvaluationResult, criteria: EligibilityCriteria): EvaluationResult {
  if (!row.eligible) return row;
  if (hasRequiredSkills(row.student.skills, criteria.requiredSkills, criteria.skillMatchMode)) {
    return row;
  }
  return {
    ...row,
    eligible: false,
    reasons: [
      ...row.reasons,
      `Missing required skill(s): ${criteria.requiredSkills.join(", ")}`,
    ],
  };
}

function SkillPills({ skills, required }: { skills: string[]; required: string[] }) {
  const requiredKeys = new Set(required.map(skillKey));
  return (
    <div className="flex max-w-xs flex-wrap gap-1">
      {skills.map((skill) => {
        const hit = requiredKeys.has(skillKey(skill));
        return (
          <span
            key={skill}
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              hit ? "bg-emerald-500/15 text-emerald-300" : "bg-zinc-900 text-zinc-500"
            }`}
          >
            {skill}
          </span>
        );
      })}
    </div>
  );
}

function RequiredChecks({ skills, required }: { skills: string[]; required: string[] }) {
  const have = new Set(skills.map(skillKey));
  if (required.length === 0) {
    return <span className="text-zinc-600">—</span>;
  }
  return (
    <div className="flex flex-col gap-0.5">
      {required.map((skill) => {
        const ok = have.has(skillKey(skill));
        return (
          <span key={skill} className={ok ? "text-emerald-400" : "text-rose-400"}>
            {ok ? "✓" : "✗"} {skill}
          </span>
        );
      })}
    </div>
  );
}

function ExportBtn({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-obsidian px-3 py-1.5 text-[11px] text-zinc-300 hover:border-zinc-600"
    >
      {icon}
      {label}
    </button>
  );
}
