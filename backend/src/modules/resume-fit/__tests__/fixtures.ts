import { PDFDocument, StandardFonts } from 'pdf-lib';

export async function buildFixturePdf(text: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const lines = text.split('\n');
  let y = 750;
  for (const line of lines) {
    page.drawText(line, { x: 50, y, size: 12, font });
    y -= 20;
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
