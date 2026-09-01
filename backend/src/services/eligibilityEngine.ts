import type {
  EligibilityCriteria,
  EngineMetrics,
  EvaluationResult,
  StudentRecord,
} from "../types.js";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function skillKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\.js\b/g, "js")
    .replace(/[^a-z0-9+]/g, "");
}

function missingSkills(studentSkills: string[], required: string[], mode: "all" | "any"): string[] {
  const have = new Set(studentSkills.map(skillKey).filter(Boolean));
  const needed = required.map((s) => s.trim()).filter(Boolean);
  if (needed.length === 0) return [];
  if (mode === "any") {
    return needed.some((skill) => have.has(skillKey(skill))) ? [] : needed;
  }
  return needed.filter((skill) => !have.has(skillKey(skill)));
}

export function evaluateStudent(
  student: StudentRecord,
  criteria: EligibilityCriteria,
): EvaluationResult {
  const reasons: string[] = [];
  const required = criteria.requiredSkills.map((s) => s.trim()).filter(Boolean);
  const missing = missingSkills(student.skills, required, criteria.skillMatchMode);
  const matchedSkills = student.skills.filter((skill) =>
    required.some((req) => skillKey(req) === skillKey(skill)),
  );

  if (student.cgpa < criteria.minCgpa) {
    reasons.push(`CGPA ${student.cgpa.toFixed(2)} < ${criteria.minCgpa.toFixed(1)}`);
  }

  if (student.activeBacklogs > criteria.maxActiveBacklogs) {
    reasons.push(
      `${student.activeBacklogs} active backlog(s) exceed max ${criteria.maxActiveBacklogs}`,
    );
  }

  if (criteria.allowedBranches.length > 0) {
    const allowed = new Set(criteria.allowedBranches.map(normalize));
    if (!allowed.has(normalize(student.branch))) {
      reasons.push(`Branch ${student.branch} not in allowed set`);
    }
  }

  if (required.length > 0 && missing.length > 0) {
    if (criteria.skillMatchMode === "all") {
      reasons.push(`Missing required skill(s): ${missing.join(", ")}`);
    } else {
      reasons.push(`None of the required skills matched (${required.join(", ")})`);
    }
  }

  if (criteria.minTenthPercent != null && (student.tenthPercent ?? 0) < criteria.minTenthPercent) {
    reasons.push(`10th ${student.tenthPercent ?? 0}% < ${criteria.minTenthPercent}%`);
  }

  if (
    criteria.minTwelfthPercent != null &&
    (student.twelfthPercent ?? 0) < criteria.minTwelfthPercent
  ) {
    reasons.push(`12th ${student.twelfthPercent ?? 0}% < ${criteria.minTwelfthPercent}%`);
  }

  const skillsPass = required.length === 0 || missing.length === 0;

  return {
    student,
    eligible: reasons.length === 0 && skillsPass,
    reasons,
    matchedSkills,
  };
}

export function runEligibilityEngine(
  students: StudentRecord[],
  criteria: EligibilityCriteria,
): { results: EvaluationResult[]; metrics: EngineMetrics; logs: string[] } {
  const started = Date.now();
  const stamp = new Date().toTimeString().slice(0, 5);
  const logs: string[] = [
    `[SYSTEM LOG ${stamp}]: Ingested ${students.length} student records`,
    `[SYSTEM LOG ${stamp}]: Criteria locked — ${criteria.companyName} / ${criteria.driveName}`,
    `[SYSTEM LOG ${stamp}]: CGPA ≥ ${criteria.minCgpa} · backlogs ≤ ${criteria.maxActiveBacklogs} · skills (${criteria.skillMatchMode}): ${
      criteria.requiredSkills.join(", ") || "none"
    }`,
  ];

  const results = students.map((student) => {
    const evaluation = evaluateStudent(student, criteria);
    const tag = evaluation.eligible ? "MATCH" : "REJECT";
    const detail = evaluation.eligible
      ? `skills hit: ${evaluation.matchedSkills.join(", ") || "n/a"}`
      : evaluation.reasons.join(" · ");
    logs.push(
      `[SYSTEM LOG ${stamp}]: Evaluating ${student.rollNumber} ${student.name}... ${tag} · ${detail}`,
    );
    return evaluation;
  });

  for (const row of results) {
    const leftover = missingSkills(row.student.skills, criteria.requiredSkills, criteria.skillMatchMode);
    if (leftover.length > 0 && row.eligible) {
      row.eligible = false;
      row.reasons.push(`Missing required skill(s): ${leftover.join(", ")}`);
    }
  }

  const shortlisted = results.filter((r) => r.eligible);
  const avgCgpaShortlisted =
    shortlisted.length === 0
      ? 0
      : shortlisted.reduce((sum, r) => sum + r.student.cgpa, 0) / shortlisted.length;

  const elapsedMs = Date.now() - started;
  logs.push(
    `[COMPLETE] ${shortlisted.length}/${results.length} shortlisted in ${elapsedMs}ms`,
  );

  return {
    results,
    logs,
    metrics: {
      total: results.length,
      shortlisted: shortlisted.length,
      rejected: results.length - shortlisted.length,
      shortlistRate: results.length === 0 ? 0 : shortlisted.length / results.length,
      avgCgpaShortlisted: Number(avgCgpaShortlisted.toFixed(2)),
      elapsedMs,
    },
  };
}
