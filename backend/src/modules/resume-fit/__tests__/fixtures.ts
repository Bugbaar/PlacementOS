import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(__filename);

/**
 * Return a PDF buffer pdf-parse can reliably read.
 * Uses the sample PDF shipped with pdf-parse (pdf-lib streams are incompatible
 * with pdf-parse@1.1.1). The `text` argument is kept for call-site clarity;
 * analysis content comes from the sample file + the job description field.
 */
export async function buildFixturePdf(_text: string): Promise<Buffer> {
  const pkgDir = path.dirname(require.resolve('pdf-parse/package.json'));
  const samplePath = path.join(pkgDir, 'test', 'data', '05-versions-space.pdf');
  return fs.readFileSync(samplePath);
}
