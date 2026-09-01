import { useState, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { patchCriteria } from "../store/engineSlice";

export default function CriteriaPanel() {
  const dispatch = useAppDispatch();
  const { criteria, branches, skillUniverse } = useAppSelector((s) => s.engine);
  const [skillDraft, setSkillDraft] = useState("");

  function toggleBranch(branch: string) {
    const next = criteria.allowedBranches.includes(branch)
      ? criteria.allowedBranches.filter((b) => b !== branch)
      : [...criteria.allowedBranches, branch];
    dispatch(patchCriteria({ allowedBranches: next }));
  }

  function addSkill() {
    const skill = skillDraft.trim();
    if (!skill) return;
    const exists = criteria.requiredSkills.some((s) => s.toLowerCase() === skill.toLowerCase());
    if (!exists) {
      dispatch(patchCriteria({ requiredSkills: [...criteria.requiredSkills, skill] }));
    }
    setSkillDraft("");
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-white/5 p-6 shadow-xl backdrop-blur-md">
      <h2 className="mb-6 text-sm font-semibold tracking-wide text-zinc-200">
        Target criteria configuration
      </h2>
      <div className="space-y-5">
        <Field label="Company">
          <input
            className="field"
            value={criteria.companyName}
            onChange={(e) => dispatch(patchCriteria({ companyName: e.target.value }))}
          />
        </Field>
        <Field label="Drive name">
          <input
            className="field"
            value={criteria.driveName}
            onChange={(e) => dispatch(patchCriteria({ driveName: e.target.value }))}
          />
        </Field>
        <Field label={`Minimum CGPA cutoff (${criteria.minCgpa.toFixed(1)})`}>
          <input
            type="range"
            min={0}
            max={10}
            step={0.1}
            value={criteria.minCgpa}
            onChange={(e) => dispatch(patchCriteria({ minCgpa: Number(e.target.value) }))}
            className="w-full h-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 appearance-none cursor-pointer"
          />
        </Field>
        <Field label="Max active backlogs">
          <select
            className="field"
            value={criteria.maxActiveBacklogs}
            onChange={(e) => dispatch(patchCriteria({ maxActiveBacklogs: Number(e.target.value) }))}
          >
            <option value={0}>0 backlogs (strict)</option>
            <option value={1}>Maximum 1</option>
            <option value={2}>Maximum 2</option>
          </select>
        </Field>
        <Field label="Skill match mode">
          <div className="grid grid-cols-2 gap-2">
            {(["all", "any"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => dispatch(patchCriteria({ skillMatchMode: mode }))}
                className={`rounded-lg border px-3 py-2 text-xs capitalize ${
                  criteria.skillMatchMode === mode
                    ? "border-purple-500/60 bg-purple-500/10 text-white"
                    : "border-zinc-800 text-zinc-400"
                }`}
              >
                Must know {mode}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Required skills">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {criteria.requiredSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() =>
                  dispatch(
                    patchCriteria({
                      requiredSkills: criteria.requiredSkills.filter((s) => s !== skill),
                    }),
                  )
                }
                className="rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 text-[11px] text-zinc-300"
              >
                {skill} ×
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="field"
              list="skills"
              placeholder="Add skill, Enter"
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <datalist id="skills">
              {skillUniverse.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        </Field>
        <Field label="Eligible branches">
          <div className="flex flex-wrap gap-2">
            {branches.map((branch) => {
              const on = criteria.allowedBranches.includes(branch);
              return (
                <button
                  key={branch}
                  type="button"
                  onClick={() => toggleBranch(branch)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] ${
                    on ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-zinc-800 text-zinc-500"
                  }`}
                >
                  {branch}
                </button>
              );
            })}
          </div>
        </Field>
      </div>
      <style>{`
        .field {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #27272a;
          background: #09090b;
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .field:focus { border-color: #8b5cf6; }
      `}</style>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
        {label}
      </label>
      {children}
    </div>
  );
}
