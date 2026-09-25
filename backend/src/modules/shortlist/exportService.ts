import PDFDocument from 'pdfkit';
import type { EngineRunPayload } from './types';

export function toCsv(run: EngineRunPayload, mode: 'shortlisted' | 'audit'): string {
  const rows = mode === 'shortlisted' ? run.results.filter((r) => r.eligible) : run.results;
  const header = [
    'rollNumber',
    'name',
    'email',
    'branch',
    'cgpa',
    'activeBacklogs',
    'skills',
    'status',
    'reasons',
  ];
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [
        r.student.rollNumber,
        csvEscape(r.student.name),
        r.student.email,
        csvEscape(r.student.branch),
        r.student.cgpa,
        r.student.activeBacklogs,
        csvEscape(r.student.skills.join('|')),
        r.eligible ? 'SHORTLISTED' : 'REJECTED',
        csvEscape(r.reasons.join('; ')),
      ].join(','),
    ),
  ];
  return lines.join('\n');
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function buildPdf(run: EngineRunPayload): Promise<Buffer> {
  const shortlisted = run.results.filter((r) => r.eligible);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 42, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk as Buffer));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fillColor('#0f172a').fontSize(18).text('PlacementOS · Shortlist Report');
    doc.moveDown(0.3);
    doc.fillColor('#64748b').fontSize(10).text(`${run.criteria.companyName} — ${run.criteria.driveName}`);
    doc.text(`Generated ${new Date(run.createdAt).toLocaleString()}`);
    doc.moveDown();

    doc.fillColor('#0f172a').fontSize(11).text('Eligibility criteria');
    doc.fillColor('#475569').fontSize(9);
    doc.text(`Minimum CGPA: ${run.criteria.minCgpa}`);
    doc.text(`Max active backlogs: ${run.criteria.maxActiveBacklogs}`);
    doc.text(
      `Required skills (${run.criteria.skillMatchMode}): ${run.criteria.requiredSkills.join(', ') || '—'}`,
    );
    doc.text(`Branches: ${run.criteria.allowedBranches.join(', ') || 'All'}`);
    doc.moveDown();
    doc
      .fillColor('#059669')
      .text(
        `Shortlisted ${run.metrics.shortlisted} of ${run.metrics.total} (${Math.round(run.metrics.shortlistRate * 100)}%)`,
      );
    doc.moveDown();

    let y = doc.y;
    shortlisted.forEach((row) => {
      if (y > 760) {
        doc.addPage();
        y = 50;
      }
      doc.fillColor('#0f172a').fontSize(8);
      doc.text(
        `${row.student.rollNumber}  ${row.student.name}  ${row.student.branch}  CGPA ${row.student.cgpa}`,
        42,
        y,
        { width: 510 },
      );
      y += 14;
    });

    doc.end();
  });
}
