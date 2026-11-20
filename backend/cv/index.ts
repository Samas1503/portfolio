import "server-only";
import { buildCv, loadCvSource, type CvDensity } from "./data";
import { renderCv } from "./document";

// From roomiest to most compact; the first layout that fits on one page wins.
const FULL = { maxOthers: 5, maxBullets: 3, skillsPerGroup: 12, includeEvents: true };
const LAYOUTS: (CvDensity & { size: number })[] = [
  { size: 10, ...FULL },
  { size: 9.6, ...FULL },
  { size: 9.3, ...FULL },
  { size: 9, ...FULL },
  { size: 9, maxOthers: 4, maxBullets: 3, skillsPerGroup: 10, includeEvents: false },
  { size: 8.8, maxOthers: 3, maxBullets: 2, skillsPerGroup: 8, includeEvents: false },
  { size: 8.5, maxOthers: 2, maxBullets: 2, skillsPerGroup: 7, includeEvents: false },
];

export async function generateCvPdf(siteUrl: string) {
  const source = await loadCvSource();
  let result: Awaited<ReturnType<typeof renderCv>> | undefined;
  let nombre = "";
  for (const { size, ...density } of LAYOUTS) {
    const data = buildCv(source, density, siteUrl);
    nombre = data.nombre;
    result = await renderCv(data, size);
    if (result.pages <= 1) break;
  }
  return { pdf: result!.buffer, pages: result!.pages, nombre };
}
