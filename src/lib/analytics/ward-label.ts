export function formatWardDisplayLabel(ward: string, wardNumber?: number | null): string {
  const normalizedWard = ward.trim();
  const detectedNumber = wardNumber ?? parseWardNumber(normalizedWard);

  if (detectedNumber === null) {
    return normalizedWard;
  }

  const suffixMatch = normalizedWard.match(/\bward\s*0*\d+\b\s*(.*)$/i);
  const suffix = suffixMatch?.[1]?.trim() ?? "";

  if (!suffix) {
    return `Ward ${detectedNumber}`;
  }

  return `Ward ${detectedNumber} ${suffix}`;
}

function parseWardNumber(ward: string): number | null {
  const match = ward.match(/\bward\s*0*(\d+)\b/i);
  if (!match) {
    return null;
  }

  const number = Number(match[1]);
  return Number.isFinite(number) ? number : null;
}
