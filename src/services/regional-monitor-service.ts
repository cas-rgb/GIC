import { searchCommunityData, deepResearch } from "./tavily-service";
import { Region } from "@/types";

export const TARGET_REGIONS: Region[] = [
  // Provinces
  {
    id: "eastern_cape",
    name: "Eastern Cape",
    type: "province",
    premier: "Oscar Mabuyane",
  },
  {
    id: "mpumalanga",
    name: "Mpumalanga",
    type: "province",
    premier: "Mandla Ndlovu",
  },
  {
    id: "northern_cape",
    name: "Northern Cape",
    type: "province",
    premier: "Zamani Saul",
  },
  {
    id: "western_cape",
    name: "Western Cape",
    type: "province",
    premier: "Alan Winde",
  },

  // Key Municipalities - Eastern Cape
  {
    id: "nelson_mandela_bay",
    name: "Nelson Mandela Bay",
    type: "municipality",
    parentId: "eastern_cape",
  },
  {
    id: "buffalo_city",
    name: "Buffalo City",
    type: "municipality",
    parentId: "eastern_cape",
  },
  {
    id: "or_tambo",
    name: "OR Tambo",
    type: "municipality",
    parentId: "eastern_cape",
  },

  // Key Municipalities - Mpumalanga
  {
    id: "mbombela",
    name: "City of Mbombela",
    type: "municipality",
    parentId: "mpumalanga",
  },
  {
    id: "emalahleni",
    name: "Emalahleni",
    type: "municipality",
    parentId: "mpumalanga",
  },
  {
    id: "steve_tshwete",
    name: "Steve Tshwete",
    type: "municipality",
    parentId: "mpumalanga",
  },

  // Key Municipalities - Northern Cape
  {
    id: "sol_plaatje",
    name: "Sol Plaatje",
    type: "municipality",
    parentId: "northern_cape",
  },
  {
    id: "dawid_kruiper",
    name: "Dawid Kruiper",
    type: "municipality",
    parentId: "northern_cape",
  },
  {
    id: "ga-segonyana",
    name: "Ga-Segonyana",
    type: "municipality",
    parentId: "northern_cape",
  },

  // Key Municipalities - Western Cape
  {
    id: "city_of_cape_town",
    name: "City of Cape Town",
    type: "municipality",
    parentId: "western_cape",
  },
  {
    id: "drake_n_stein",
    name: "Drakenstein",
    type: "municipality",
    parentId: "western_cape",
  },
  {
    id: "george",
    name: "George",
    type: "municipality",
    parentId: "western_cape",
  },
  {
    id: "stellenbosch",
    name: "Stellenbosch",
    type: "municipality",
    parentId: "western_cape",
  },
];

export async function monitorProvincialSentiments() {
  const provinces = TARGET_REGIONS.filter((r) => r.type === "province");
  const results = [];

  for (const province of provinces) {
    console.log(`Monitoring ${province.name}...`);
    const query = `${province.name} Premier ${province.premier} news sentiment infrastructure 2024 2025`;
    const searchResult = await searchCommunityData(query);
    results.push({
      regionId: province.id,
      regionName: province.name,
      data: searchResult,
    });
  }

  return results;
}

export async function monitorCommunityNarratives(regionId: string) {
  const region = TARGET_REGIONS.find((r) => r.id === regionId);
  if (!region) return null;

  const queries = [
    `${region.name} local news service delivery protest`,
    `${region.name} community radio news bulletins`,
    `${region.name} infrastructure issues water electricity roads`,
    `${region.name} municipality sentiment public discourse`,
  ];

  const allResults = [];
  for (const q of queries) {
    const res = await deepResearch(q);
    if (res) allResults.push(res);
  }

  return allResults;
}

export async function identifyNarrativeDrivers(regionName: string) {
  const query = `who are the main voices and influencers discussing issues in ${regionName} infrastructure service delivery`;
  return await deepResearch(query);
}
