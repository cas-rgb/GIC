import { readFile } from "fs/promises";
import path from "path";

export interface ContextualProfile {
  geographyLevel: "province" | "municipality";
  province: string | null;
  municipality: string | null;
}

export interface WardCoverageSeed {
  province: string;
  municipality: string;
  ward: string;
  documentCount: number;
  pressureCaseCount: number;
  sentimentMentionCount: number;
  evidenceBacked: boolean;
}

interface ContextualReferenceFile {
  generatedAt: string;
  profiles: ContextualProfile[];
  wardCoverage: WardCoverageSeed[];
}

export async function loadContextualReferenceFile(): Promise<ContextualReferenceFile> {
  const filePath = path.resolve(process.cwd(), "data", "enrichment", "contextual-reference-profiles.json");
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as ContextualReferenceFile;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function provinceCode(provinceName: string): string {
  return slugify(provinceName);
}

export function municipalityCode(provinceName: string, municipalityName: string): string {
  return slugify(`${provinceName}-${municipalityName}`);
}

export function wardKey(provinceName: string, municipalityName: string, wardName: string): string {
  return slugify(`${provinceName}-${municipalityName}-${wardName}`);
}

export function cleanWardName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(/\s+/g, " ");
  const lower = normalized.toLowerCase();

  if (
    lower.includes("administrative or head office") ||
    lower.includes("whole of the municipality") ||
    lower.includes("whole of the metro") ||
    lower.includes("whole of the district") ||
    lower.includes("corporate infrastructure projects") ||
    lower.includes("multi-ward projects") ||
    lower.includes("satellite offices") ||
    lower.includes("...")
  ) {
    return null;
  }

  if (normalized.includes(",")) {
    return null;
  }

  return normalized;
}

export function parseWardNumber(wardName: string): number | null {
  const match = wardName.match(/\bward\s+(\d+)\b/i);
  return match ? Number(match[1]) : null;
}
