import { parse } from 'csv-parse/sync';
import type { StudentRecord } from './types';

function num(value: unknown, fallback = 0): number {
  const n = Number(String(value ?? '').trim());
  return Number.isFinite(n) ? n : fallback;
}

function splitSkills(raw: unknown): string[] {
  return String(raw ?? '')
    .split(/[|;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseStudentCsv(buffer: Buffer): { students: StudentRecord[]; errors: string[] } {
  const errors: string[] = [];
  const rows = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const seen = new Set<string>();
  const students: StudentRecord[] = [];

  rows.forEach((row, index) => {
    const line = index + 2;
    const rollNumber = String(row.rollNumber ?? row.roll ?? row.RollNumber ?? '').trim();
    const name = String(row.name ?? row.Name ?? '').trim();
    const email = String(row.email ?? row.Email ?? '').trim();
    const branch = String(row.branch ?? row.Branch ?? '').trim();

    if (!rollNumber || !name) {
      errors.push(`Line ${line}: missing rollNumber or name`);
      return;
    }
    if (seen.has(rollNumber)) {
      errors.push(`Line ${line}: duplicate rollNumber ${rollNumber}`);
      return;
    }
    seen.add(rollNumber);

    students.push({
      rollNumber,
      name,
      email,
      branch,
      cgpa: num(row.cgpa ?? row.CGPA ?? row.gpa),
      activeBacklogs: num(row.activeBacklogs ?? row.backlogs ?? row.Backlogs),
      skills: splitSkills(row.skills ?? row.Skills),
      tenthPercent: row.tenthPercent || row.tenth ? num(row.tenthPercent ?? row.tenth) : undefined,
      twelfthPercent:
        row.twelfthPercent || row.twelfth ? num(row.twelfthPercent ?? row.twelfth) : undefined,
    });
  });

  return { students, errors };
}
