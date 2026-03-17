import { LocationResolver } from "@/lib/processing/contracts";
import {
  DocumentClassification,
  DocumentRecord,
  NormalizedLocation,
} from "@/lib/processing/types";

const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "Eastern Cape",
  "KwaZulu-Natal",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
];

const MUNICIPALITY_ALIASES = [
  { municipality: "City of Johannesburg", province: "Gauteng", aliases: ["City of Johannesburg", "Johannesburg", "Joburg"] },
  { municipality: "City of Tshwane", province: "Gauteng", aliases: ["City of Tshwane", "Tshwane", "Pretoria"] },
  { municipality: "Ekurhuleni", province: "Gauteng", aliases: ["Ekurhuleni", "East Rand"] },
  { municipality: "Emfuleni", province: "Gauteng", aliases: ["Emfuleni", "Vanderbijlpark", "Vereeniging"] },
  { municipality: "City of Cape Town", province: "Western Cape", aliases: ["City of Cape Town", "Cape Town"] },
  { municipality: "Nelson Mandela Bay", province: "Eastern Cape", aliases: ["Nelson Mandela Bay", "Gqeberha", "Port Elizabeth"] },
  { municipality: "Buffalo City", province: "Eastern Cape", aliases: ["Buffalo City", "East London"] },
  { municipality: "eThekwini", province: "KwaZulu-Natal", aliases: ["eThekwini", "Durban"] },
  { municipality: "Mangaung", province: "Free State", aliases: ["Mangaung", "Bloemfontein"] },
  { municipality: "Polokwane", province: "Limpopo", aliases: ["Polokwane"] },
  { municipality: "Mbombela", province: "Mpumalanga", aliases: ["Mbombela", "Nelspruit"] },
  { municipality: "Rustenburg", province: "North West", aliases: ["Rustenburg"] },
  { municipality: "Sol Plaatje", province: "Northern Cape", aliases: ["Sol Plaatje", "Kimberley"] },
];

const PROVINCE_ALIASES = PROVINCES.flatMap((province) => {
  const aliases = [province];
  if (province === "KwaZulu-Natal") aliases.push("KZN");
  return aliases.map((alias) => ({ alias, province }));
});

function findProvinceMatch(text: string): string | null {
  const loweredText = text.toLowerCase();
  let bestIndex = Number.POSITIVE_INFINITY;
  let bestProvince: string | null = null;

  for (const entry of PROVINCE_ALIASES) {
    const index = loweredText.indexOf(entry.alias.toLowerCase());
    if (index !== -1 && index < bestIndex) {
      bestIndex = index;
      bestProvince = entry.province;
    }
  }

  return bestProvince;
}

function findMunicipalityMatch(
  text: string
): { municipality: string; province: string } | null {
  const loweredText = text.toLowerCase();
  let bestIndex = Number.POSITIVE_INFINITY;
  let bestMatch: { municipality: string; province: string } | null = null;

  for (const entry of MUNICIPALITY_ALIASES) {
    for (const alias of entry.aliases) {
      const index = loweredText.indexOf(alias.toLowerCase());
      if (index !== -1 && index < bestIndex) {
        bestIndex = index;
        bestMatch = {
          municipality: entry.municipality,
          province: entry.province,
        };
      }
    }
  }

  return bestMatch;
}

export class RuleBasedLocationResolver implements LocationResolver {
  async resolve(
    document: DocumentRecord,
    _classification: DocumentClassification
  ): Promise<NormalizedLocation | null> {
    const corpus = `${document.title}\n${document.contentText}`.slice(0, 12000);
    const municipalityMatch = findMunicipalityMatch(corpus);
    const province = municipalityMatch?.province ?? findProvinceMatch(corpus);
    const municipality = municipalityMatch?.municipality ?? null;

    if (!province && !municipality) {
      return null;
    }

    return {
      country: "South Africa",
      province,
      district: null,
      municipality,
      ward: null,
      confidence: municipality ? 0.85 : 0.65,
    };
  }
}
