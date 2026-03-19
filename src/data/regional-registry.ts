import { RegionalRegistry } from "../types";

export const SA_REGIONAL_REGISTRY: RegionalRegistry = {
  provinces: [
    {
      name: "Gauteng",
      municipalities: [
        {
          name: "City of Johannesburg",
          wards: [
            "Ward 113 (Diepsloot)",
            "Ward 1 (Orange Farm)",
            "Ward 105 (Alexandra)",
            "Ward 78 (Ivory Park)",
            "Ward 59 (Inner City)",
            "Ward 101 (Cosmo City)",
          ],
        },
        {
          name: "City of Tshwane",
          wards: [
            "Ward 95 (Hammanskraal)",
            "Ward 12 (Mamelodi)",
            "Ward 33 (Soshanguve)",
            "Ward 22 (Mabopane)",
            "Ward 1 (Atteridgeville)",
          ],
        },
        {
          name: "Ekurhuleni",
          wards: [
            "Ward 10 (Tembisa)",
            "Ward 60 (Katlehong)",
            "Ward 45 (Vosloorus)",
            "Ward 98 (Tsakane)",
          ],
        },
        {
          name: "West Rand",
          wards: [
            "Ward 1 (Kagiso)",
            "Ward 6 (Mohlakeng)",
            "Ward 12 (Bekkersdal)",
          ],
        },
        {
          name: "Sedibeng",
          wards: [
            "Ward 33 (Sebokeng)",
            "Ward 14 (Sharpeville)",
            "Ward 2 (Evaton)",
          ],
        },
      ],
    },
    {
      name: "Western Cape",
      municipalities: [
        {
          name: "City of Cape Town",
          wards: ["Ward 115", "Ward 54", "Ward 77"],
        },
        { name: "Stellenbosch", wards: [] },
        { name: "Drakenstein", wards: [] },
        { name: "George", wards: [] },
        { name: "Saldanha Bay", wards: [] },
      ],
    },
    {
      name: "KwaZulu-Natal",
      municipalities: [
        { name: "eThekwini", wards: ["Ward 1", "Ward 2"] },
        { name: "Msunduzi", wards: [] },
        { name: "uMhlathuze", wards: [] },
        { name: "Ray Nkonyeni", wards: [] },
        { name: "Newcastle", wards: [] },
      ],
    },
    {
      name: "Eastern Cape",
      municipalities: [
        { name: "Nelson Mandela Bay", wards: [] },
        { name: "Buffalo City", wards: [] },
        { name: "OR Tambo", wards: [] },
        { name: "Chris Hani", wards: [] },
        { name: "Joe Gqabi", wards: [] },
      ],
    },
    {
      name: "Limpopo",
      municipalities: [
        { name: "Polokwane", wards: [] },
        { name: "Mogalakwena", wards: [] },
        { name: "Thulamela", wards: [] },
        { name: "Tzaneen", wards: [] },
        { name: "Ba-Phalaborwa", wards: [] },
      ],
    },
    {
      name: "Mpumalanga",
      municipalities: [
        { name: "Mbombela", wards: [] },
        { name: "Emalahleni", wards: [] },
        { name: "Steve Tshwete", wards: [] },
        { name: "Govan Mbeki", wards: [] },
        { name: "Lekwa", wards: [] },
      ],
    },
    {
      name: "North West",
      municipalities: [
        { name: "Rustenburg", wards: [] },
        { name: "Madibeng", wards: [] },
        { name: "Matlosana", wards: [] },
        { name: "JB Marks", wards: [] },
        { name: "Mahikeng", wards: [] },
      ],
    },
    {
      name: "Free State",
      municipalities: [
        { name: "Mangaung", wards: [] },
        { name: "Matjhabeng", wards: [] },
        { name: "Metsimaholo", wards: [] },
        { name: "Maluti-a-Phofung", wards: [] },
        { name: "Dihlabeng", wards: [] },
      ],
    },
    {
      name: "Northern Cape",
      municipalities: [
        { name: "Sol Plaatje", wards: [] },
        { name: "Ga-Segonyana", wards: [] },
        { name: "Dawid Kruiper", wards: [] },
        { name: "Siyancuma", wards: [] },
        { name: "Nama Khoi", wards: [] },
      ],
    },
  ],
};

export const SADC_REGIONAL_REGISTRY: Record<string, RegionalRegistry> = {
  Namibia: {
    provinces: [
      { name: "Khomas", municipalities: [{ name: "Windhoek", wards: [] }] },
      { name: "Erongo", municipalities: [{ name: "Walvis Bay", wards: [] }] },
    ],
  },
  Botswana: {
    provinces: [
      { name: "South-East", municipalities: [{ name: "Gaborone", wards: [] }] },
      {
        name: "Francistown",
        municipalities: [{ name: "Francistown City", wards: [] }],
      },
    ],
  },
  Lesotho: {
    provinces: [
      { name: "Maseru", municipalities: [{ name: "Maseru", wards: [] }] },
    ],
  },
  Eswatini: {
    provinces: [
      { name: "Hhohho", municipalities: [{ name: "Mbabane", wards: [] }] },
      { name: "Manzini", municipalities: [{ name: "Manzini", wards: [] }] },
    ],
  },
};
