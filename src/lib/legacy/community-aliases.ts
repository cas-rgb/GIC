export interface LegacyCommunityAlias {
  province: string;
  municipality?: string | null;
  ward?: string | null;
}

export const LEGACY_COMMUNITY_ALIASES: Record<string, LegacyCommunityAlias> = {
  national: { province: "National", municipality: null, ward: null },
  "northern cape": {
    province: "Northern Cape",
    municipality: null,
    ward: null,
  },
  "western cape": { province: "Western Cape", municipality: null, ward: null },
  "eastern cape": { province: "Eastern Cape", municipality: null, ward: null },
  gauteng: { province: "Gauteng", municipality: null, ward: null },
  limpopo: { province: "Limpopo", municipality: null, ward: null },
  mpumalanga: { province: "Mpumalanga", municipality: null, ward: null },
  "north west": { province: "North West", municipality: null, ward: null },
  "free state": { province: "Free State", municipality: null, ward: null },
  "kwa-zulu natal": {
    province: "KwaZulu-Natal",
    municipality: null,
    ward: null,
  },
  "kwazulu-natal": {
    province: "KwaZulu-Natal",
    municipality: null,
    ward: null,
  },
  "kwa zulu natal": {
    province: "KwaZulu-Natal",
    municipality: null,
    ward: null,
  },

  "city of cape town": {
    province: "Western Cape",
    municipality: "City of Cape Town",
    ward: null,
  },
  "cape town": {
    province: "Western Cape",
    municipality: "City of Cape Town",
    ward: null,
  },
  khayelitsha: {
    province: "Western Cape",
    municipality: "City of Cape Town",
    ward: "Khayelitsha",
  },
  "saldanha bay": {
    province: "Western Cape",
    municipality: "Saldanha Bay",
    ward: null,
  },
  george: { province: "Western Cape", municipality: "George", ward: null },
  stellenbosch: {
    province: "Western Cape",
    municipality: "Stellenbosch",
    ward: null,
  },
  drakenstein: {
    province: "Western Cape",
    municipality: "Drakenstein",
    ward: null,
  },

  "nelson mandela bay": {
    province: "Eastern Cape",
    municipality: "Nelson Mandela Bay",
    ward: null,
  },
  nmb: {
    province: "Eastern Cape",
    municipality: "Nelson Mandela Bay",
    ward: null,
  },
  motherwell: {
    province: "Eastern Cape",
    municipality: "Nelson Mandela Bay",
    ward: "Motherwell",
  },
  "buffalo city": {
    province: "Eastern Cape",
    municipality: "Buffalo City",
    ward: null,
  },
  "east london": {
    province: "Eastern Cape",
    municipality: "Buffalo City",
    ward: "East London",
  },

  hammanskraal: {
    province: "Gauteng",
    municipality: "City of Tshwane",
    ward: "Hammanskraal",
  },
  soweto: {
    province: "Gauteng",
    municipality: "City of Johannesburg",
    ward: "Soweto",
  },
  alexandra: {
    province: "Gauteng",
    municipality: "City of Johannesburg",
    ward: "Alexandra",
  },
  diepsloot: {
    province: "Gauteng",
    municipality: "City of Johannesburg",
    ward: "Diepsloot",
  },
  tembisa: { province: "Gauteng", municipality: "Ekurhuleni", ward: "Tembisa" },
  tshwane: { province: "Gauteng", municipality: "City of Tshwane", ward: null },
  johannesburg: {
    province: "Gauteng",
    municipality: "City of Johannesburg",
    ward: null,
  },
  ekurhuleni: { province: "Gauteng", municipality: "Ekurhuleni", ward: null },
  emfuleni: { province: "Gauteng", municipality: "Emfuleni", ward: null },

  "sol plaatje": {
    province: "Northern Cape",
    municipality: "Sol Plaatje",
    ward: null,
  },
  kimberley: {
    province: "Northern Cape",
    municipality: "Sol Plaatje",
    ward: "Kimberley",
  },

  rustenburg: {
    province: "North West",
    municipality: "Rustenburg",
    ward: null,
  },
  mahikeng: { province: "North West", municipality: "Mahikeng", ward: null },
  mafikeng: { province: "North West", municipality: "Mahikeng", ward: null },
  "nkangala district": {
    province: "Mpumalanga",
    municipality: null,
    ward: "Nkangala District",
  },

  polokwane: { province: "Limpopo", municipality: "Polokwane", ward: null },
  mogalakwena: { province: "Limpopo", municipality: "Mogalakwena", ward: null },

  mangaung: { province: "Free State", municipality: "Mangaung", ward: null },
  bloemfontein: {
    province: "Free State",
    municipality: "Mangaung",
    ward: "Bloemfontein",
  },

  ethekwini: {
    province: "KwaZulu-Natal",
    municipality: "eThekwini",
    ward: null,
  },
  durban: {
    province: "KwaZulu-Natal",
    municipality: "eThekwini",
    ward: "Durban",
  },
  msunduzi: { province: "KwaZulu-Natal", municipality: "Msunduzi", ward: null },
  "richards bay": {
    province: "KwaZulu-Natal",
    municipality: "uMhlathuze",
    ward: "Richards Bay",
  },
};

export function getLegacyCommunityAlias(
  input?: string | null,
): LegacyCommunityAlias | null {
  if (!input) {
    return null;
  }

  const normalized = input.trim().toLowerCase();
  return LEGACY_COMMUNITY_ALIASES[normalized] ?? null;
}
