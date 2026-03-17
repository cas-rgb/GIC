import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { readCsvRows, optionalNumber } = require("./election-import-utils") as typeof import("./election-import-utils");

export { readCsvRows };

export function parseInteger(value: string | undefined): number | null {
  const parsed = optionalNumber(value);
  return parsed === null ? null : Math.round(parsed);
}

export function parseNumeric(value: string | undefined): number | null {
  return optionalNumber(value);
}

export function parseJsonObject(value: string | undefined): Record<string, unknown> {
  const normalized = (value ?? "").trim();
  if (!normalized) {
    return {};
  }

  try {
    const parsed = JSON.parse(normalized);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}
