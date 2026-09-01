import PDFDocument from "pdfkit";
import type { EngineRunPayload } from "../types.js";

export function toCsv(run: EngineRunPayload, mode: "shortlisted" | "audit"): string {
  const rows = mode === "shortlisted" ? run.results.filter((r) => r.eligible) : run.results;
  const header = [
    "rollNumber",
    "name",
    "email",
    "branch",
    "cgpa",
    "activeBacklogs",
    "skills",
    "status",
    "reasons",
  ];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.student.rollNumber,
        csvEscape(r.student.name),
        r.student.email,
        csvEscape(r.student.branch),
        r.student.cgpa,
        r.student.activeBacklogs,
        csvEscape(r.student.skills.join("|")),
        r.eligible ? "SHORTLISTED" : "REJECTED",
        csvEscape(r.reasons.join("; ")),
      ].join(","),
    ),
  ];
  return lines.join("\n");
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function buildPdf(run: EngineRunPayload): Promise<Buffer> {
  const shortlisted = run.results.filter((r) => r.eligible);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 42, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fillColor("#09090B").fontSize(18).text("PlacementOS · Shortlist Report", { align: "left" });
    doc.moveDown(0.3);
    doc.fillColor("#52525B").fontSize(10).text(`${run.criteria.companyName} — ${run.criteria.driveName}`);
    doc.text(`Generated ${new Date(run.createdAt).toLocaleString()}`);
    doc.moveDown();

    doc.fillColor("#18181B").fontSize(11).text("Eligibility criteria");
    doc.fillColor("#3F3F46").fontSize(9);
    doc.text(`Minimum CGPA: ${run.criteria.minCgpa}`);
    doc.text(`Max active backlogs: ${run.criteria.maxActiveBacklogs}`);
    doc.text(
      `Required skills (${run.criteria.skillMatchMode}): ${run.criteria.requiredSkills.join(", ") || "—"}`,
    );
    doc.text(`Branches: ${run.criteria.allowedBranches.join(", ") || "All"}`);
    doc.moveDown();
    doc.fillColor("#10B981").text(
      `Shortlisted ${run.metrics.shortlisted} of ${run.metrics.total} (${Math.round(run.metrics.shortlistRate * 100)}%)`,
    );
    doc.moveDown();

    const startY = doc.y;
    const cols = [42, 118, 250, 330, 400, 460];
    doc.fillColor("#09090B").fontSize(8).text("Roll", cols[0], startY);
    doc.text("Name", cols[1], startY);
    doc.text("Branch", cols[2], startY);
    doc.text("CGPA", cols[3], startY);
    doc.text("Backlogs", cols[4], startY);
    doc.text("Skills", cols[5], startY);
    doc.moveTo(42, startY + 12).lineTo(553, startY + 12).strokeColor("#D4D4D8").stroke();

    let y = startY + 18;
    shortlisted.forEach((row) => {
      if (y > 760) {
        doc.addPage();
        y = 50;
      }
      doc.fillColor("#18181B").fontSize(8);
      doc.text(row.student.rollNumber, cols[0], y, { width: 70 });
      doc.text(row.student.name, cols[1], y, { width: 120 });
      doc.text(row.student.branch, cols[2], y, { width: 70 });
      doc.text(String(row.student.cgpa), cols[3], y, { width: 50 });
      doc.text(String(row.student.activeBacklogs), cols[4], y, { width: 50 });
      doc.text(row.student.skills.join(", "), cols[5], y, { width: 95 });
      y += 16;
    });

    doc.end();
  });
}
