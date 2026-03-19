import { readFile } from "fs/promises";
import path from "path";

import { PlaceContextResponse } from "@/lib/analytics/types";

interface ContextProfileRow {
  geographyLevel: "province" | "municipality";
  province: string;
  municipality: string | null;
  wikipediaTitle: string | null;
  wikipediaDescription: string | null;
  wikipediaExtract: string | null;
  wikipediaUrl: string | null;
  storyAngles: string[];
  tags: string[];
  knownWardCount: number;
  evidenceBackedWardCount: number;
}

interface ContextFile {
  generatedAt: string;
  profiles: ContextProfileRow[];
}

let cache: ContextFile | null = null;

async function loadContextFile(): Promise<ContextFile> {
  if (cache) {
    return cache;
  }

  const filePath = path.resolve(
    process.cwd(),
    "data",
    "enrichment",
    "contextual-reference-profiles.json",
  );
  const raw = await readFile(filePath, "utf8");
  cache = JSON.parse(raw) as ContextFile;
  return cache;
}

export async function getPlaceContext(input: {
  province: string;
  municipality?: string | null;
}): Promise<PlaceContextResponse> {
  const { province, municipality = null } = input;
  const file = await loadContextFile();
  const match =
    file.profiles.find(
      (row) =>
        row.geographyLevel === "municipality" &&
        municipality !== null &&
        row.province === province &&
        row.municipality === municipality,
    ) ??
    file.profiles.find(
      (row) =>
        row.geographyLevel === "province" &&
        municipality === null &&
        row.province === province,
    ) ??
    null;

  return {
    geographyLevel: municipality ? "municipality" : "province",
    province,
    municipality,
    wikipediaTitle: match?.wikipediaTitle ?? null,
    wikipediaDescription: match?.wikipediaDescription ?? null,
    wikipediaExtract: match?.wikipediaExtract ?? null,
    wikipediaUrl: match?.wikipediaUrl ?? null,
    storyAngles: match?.storyAngles ?? [],
    tags: match?.tags ?? [],
    knownWardCount: match?.knownWardCount ?? 0,
    evidenceBackedWardCount: match?.evidenceBackedWardCount ?? 0,
    trace: {
      table: "data/enrichment/contextual-reference-profiles.json",
      query: `province=${province}${municipality ? `;municipality=${municipality}` : ""}`,
    },
  };
}
