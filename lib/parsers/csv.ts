import Papa from "papaparse";

export function parseCsv<T extends Record<string, string>>(text: string) {
  return Papa.parse<T>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });
}
