"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Filter, MapPin, Share2, Check } from "lucide-react";
import { INFRASTRUCTURE_SERVICE_OPTIONS } from "@/lib/analytics/issue-taxonomy";

export const WARD_NOMS: Record<string, string> = {
  // GAUTENG
  "Johannesburg_1": "Inner City CBD", "Johannesburg_2": "Orange Farm", "Johannesburg_3": "Ivory Park", "Johannesburg_4": "Diepsloot", "Johannesburg_5": "Soweto Central", "Johannesburg_6": "Alexandra", "Johannesburg_7": "Sandton", "Johannesburg_8": "Rosebank & Parktown", "Johannesburg_9": "Randburg", "Johannesburg_10": "Roodepoort", "Johannesburg_11": "Midrand", "Johannesburg_12": "Fourways", "Johannesburg_87": "Melville & Auckland Park", "Johannesburg_88": "Emmarentia", "Johannesburg_130": "Orlando",
  "Tshwane_1": "Pretoria CBD", "Tshwane_2": "Centurion", "Tshwane_3": "Mamelodi", "Tshwane_4": "Soshanguve", "Tshwane_5": "Atteridgeville", "Tshwane_6": "Hammanskraal", "Tshwane_7": "Pretoria East", "Tshwane_8": "Silverton", "Tshwane_42": "Waterkloof", "Tshwane_69": "Irene",
  "Ekurhuleni_1": "Germiston", "Ekurhuleni_2": "Boksburg", "Ekurhuleni_3": "Benoni", "Ekurhuleni_4": "Kempton Park", "Ekurhuleni_5": "Springs", "Ekurhuleni_6": "Brakpan", "Ekurhuleni_7": "Tembisa", "Ekurhuleni_8": "Alberton", "Ekurhuleni_9": "Edenvale",
  "Sedibeng_1": "Vereeniging", "Sedibeng_2": "Vanderbijlpark", "Sedibeng_3": "Meyerton", "Sedibeng_4": "Evaton",
  
  // WESTERN CAPE
  "Cape Town_1": "Brooklyn, Century City, Dunoon", "Cape Town_2": "Avondale, Boston, De Tijger", "Cape Town_3": "Bellville South, Belhar", "Cape Town_4": "Summer Greens, Joe Slovo", "Cape Town_5": "Edgemead, Bothasig", "Cape Town_6": "Bellville CBD, Oakdale", "Cape Town_7": "Kraaifontein North", "Cape Town_8": "Brackenfell North", "Cape Town_9": "Bellville South Industrial", "Cape Town_10": "Avondale, Parow", "Cape Town_11": "Kuils River North", "Cape Town_12": "Belhar, Delft", "Cape Town_13": "Delft South", "Cape Town_14": "Langa", "Cape Town_15": "Pinelands, Thornton", "Cape Town_16": "Eerste River Central", "Cape Town_17": "Blackheath, Kuils River South", "Cape Town_18": "Macassar", "Cape Town_19": "Delft, Blue Downs", "Cape Town_20": "Delft South", "Cape Town_21": "Eversdal, Kenridge", "Cape Town_22": "Belhar", "Cape Town_23": "Melkbosstrand, Table View North", "Cape Town_24": "Sir Lowry's Pass, Somerset West", "Cape Town_25": "Ravensmead, Uitsig", "Cape Town_26": "Leonsdale, Ruyterwacht", "Cape Town_27": "Goodwood", "Cape Town_28": "Elsies River", "Cape Town_29": "Atlantis South", "Cape Town_30": "Matroosfontein", "Cape Town_31": "Bonteheuwel", "Cape Town_32": "Atlantis", "Cape Town_33": "Philippi East", "Cape Town_34": "Philippi", "Cape Town_35": "Nyanga, Philippi", "Cape Town_36": "Crossroads", "Cape Town_37": "Nyanga", "Cape Town_38": "Guguletu", "Cape Town_39": "Crossroads", "Cape Town_40": "Guguletu", "Cape Town_41": "Guguletu", "Cape Town_42": "Manenberg", "Cape Town_43": "Strandfontein", "Cape Town_44": "Guguletu, Heideveld", "Cape Town_45": "Manenberg", "Cape Town_46": "Rylands, Gatesville", "Cape Town_47": "Hanover Park", "Cape Town_48": "Belgravia, Athlone", "Cape Town_49": "Hazendal, Kewtown", "Cape Town_50": "Bonteheuwel", "Cape Town_51": "Langa", "Cape Town_52": "Langa", "Cape Town_53": "Pinelands, Thornton", "Cape Town_54": "Sea Point, Camps Bay", "Cape Town_55": "Brooklyn, Ysterplaat", "Cape Town_56": "Maitland, Kensington", "Cape Town_57": "Observatory, Salt River", "Cape Town_58": "Rondebosch, Claremont", "Cape Town_59": "Newlands, Claremont", "Cape Town_60": "Lansdowne, Sybrand Park", "Cape Town_61": "Ocean View, Simon's Town", "Cape Town_62": "Wynberg, Constantia", "Cape Town_63": "Plumstead, Southfield", "Cape Town_64": "Fish Hoek, Muizenberg", "Cape Town_65": "Lotus River, Grassy Park", "Cape Town_66": "Ottery, Parkwood", "Cape Town_67": "Pelican Park, Zeekoevlei", "Cape Town_68": "Steenberg, Lavender Hill", "Cape Town_69": "Sunnydale, Kommetjie", "Cape Town_70": "Retreat, Steenberg", "Cape Town_71": "Kirstenhof, Tokai", "Cape Town_72": "Elfindale, Heathfield", "Cape Town_73": "Plumstead, Diep River", "Cape Town_74": "Hout Bay, Llandudno", "Cape Town_75": "Colorado Park, Mitchells Plain", "Cape Town_76": "Lentegeur, Mitchells Plain", "Cape Town_77": "Cape Town City Centre, Bo-Kaap", "Cape Town_78": "Westridge, Mitchells Plain", "Cape Town_79": "Beacon Valley, Mitchells Plain", "Cape Town_80": "Philippi", "Cape Town_81": "Rocklands, Mitchells Plain", "Cape Town_82": "Tafelsig, Mitchells Plain", "Cape Town_83": "Strand", "Cape Town_84": "Somerset West", "Cape Town_85": "Nomzamo, Strand", "Cape Town_86": "Lwandle, Strand", "Cape Town_87": "Khayelitsha", "Cape Town_88": "Khayelitsha", "Cape Town_89": "Khayelitsha", "Cape Town_90": "Khayelitsha", "Cape Town_91": "Khayelitsha", "Cape Town_92": "Khayelitsha", "Cape Town_93": "Khayelitsha", "Cape Town_94": "Khayelitsha", "Cape Town_95": "Khayelitsha", "Cape Town_96": "Khayelitsha", "Cape Town_97": "Khayelitsha", "Cape Town_98": "Khayelitsha", "Cape Town_99": "Khayelitsha", "Cape Town_100": "Kraaifontein", "Cape Town_101": "Bloekombos, Kraaifontein", "Cape Town_102": "Brackenfell South", "Cape Town_103": "Kraaifontein", "Cape Town_104": "Dunoon", "Cape Town_105": "Philadelphia, Fisantekraal", "Cape Town_106": "Delft", "Cape Town_107": "Table View", "Cape Town_108": "Mfuleni", "Cape Town_109": "Macassar", "Cape Town_110": "Retreat", "Cape Town_111": "Eerste River", "Cape Town_112": "Durbanville", "Cape Town_113": "Table View", "Cape Town_114": "Mfuleni", "Cape Town_115": "Green Point, Mouille Point", "Cape Town_116": "Mitchells Plain East",
  "Stellenbosch_1": "Central", "Stellenbosch_2": "Cloetesville", "Stellenbosch_3": "Kayamandi", "Stellenbosch_4": "Pniel", "Stellenbosch_5": "Franschhoek",
  "George_1": "Central", "George_2": "Pacaltsdorp", "George_3": "Thembalethu", "George_4": "Wilderness",
  
  // KWAZULU-NATAL
  "eThekwini_1": "Durban Central", "eThekwini_2": "Berea", "eThekwini_3": "Morningside", "eThekwini_4": "Umhlanga", "eThekwini_5": "KwaMashu", "eThekwini_6": "Umlazi", "eThekwini_7": "Chatsworth", "eThekwini_8": "Phoenix", "eThekwini_9": "Pinetown", "eThekwini_10": "Westville & Kloof", "eThekwini_11": "Hillcrest", "eThekwini_12": "Amanzimtoti", "eThekwini_33": "Umbilo", "eThekwini_101": "Cato Manor",
  "Msunduzi_1": "PMB Central", "Msunduzi_2": "Edendale", "Msunduzi_3": "Sobantu", "Msunduzi_4": "Imbali", "Msunduzi_5": "Hilton",
  "Newcastle_1": "Central", "Newcastle_2": "Madadeni", "Newcastle_3": "Osizweni",
  
  // EASTERN CAPE
  "Nelson Mandela Bay_1": "Port Elizabeth Central", "Nelson Mandela Bay_2": "Summerstrand", "Nelson Mandela Bay_3": "Newton Park", "Nelson Mandela Bay_4": "Walmer", "Nelson Mandela Bay_5": "Motherwell", "Nelson Mandela Bay_6": "New Brighton", "Nelson Mandela Bay_7": "Uitenhage", "Nelson Mandela Bay_8": "Despatch",
  "Buffalo City_1": "East London CBD", "Buffalo City_2": "Beacon Bay", "Buffalo City_3": "Mdantsane", "Buffalo City_4": "King William's Town", "Buffalo City_5": "Zwelitsha",

  // FREE STATE
  "Mangaung_1": "Bloemfontein Central", "Mangaung_2": "Westdene", "Mangaung_3": "Langenhoven Park", "Mangaung_4": "Botshabelo", "Mangaung_5": "Thaba Nchu",
  "Matjhabeng_1": "Welkom", "Matjhabeng_2": "Odendaalsrus", "Matjhabeng_3": "Virginia",

  // LIMPOPO
  "Polokwane_1": "Polokwane Central", "Polokwane_2": "Seshego", "Polokwane_3": "Mankweng",
  "Thulamela_1": "Thohoyandou", "Thulamela_2": "Sibasa",

  // MPUMALANGA
  "Mbombela_1": "Nelspruit Central", "Mbombela_2": "White River", "Mbombela_3": "Hazyview", "Mbombela_4": "Kanyamazane",
  "Emalahleni_1": "Witbank Central", "Emalahleni_2": "KwaGuqa",

  // NORTH WEST
  "Rustenburg_1": "Rustenburg Central", "Rustenburg_2": "Boitekong", "Rustenburg_3": "Phokeng", "Rustenburg_4": "Marikana",
  "Mahikeng_1": "Mahikeng Central", "Mahikeng_2": "Mmabatho", "Mahikeng_3": "Montshioa",

  // NORTHERN CAPE
  "Sol Plaatje_1": "Kimberley CBD", "Sol Plaatje_2": "Galeshewe", "Sol Plaatje_3": "Roodepan"
};
const PROVINCES = [
  "All Provinces",
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "Northern Cape",
];
const PROVINCE_MUNICIPALITIES: Record<string, string[]> = {
  Gauteng: ["All Municipalities", "Johannesburg", "Tshwane", "Ekurhuleni", "Sedibeng", "West Rand"],
  "Western Cape": [
    "All Municipalities",
    "Cape Town",
    "Stellenbosch",
    "George",
    "Drakenstein",
    "Overstrand",
  ],
  "KwaZulu-Natal": ["All Municipalities", "eThekwini", "Msunduzi", "Newcastle", "City of uMhlathuze"],
  "Eastern Cape": [
    "All Municipalities",
    "Nelson Mandela Bay",
    "Buffalo City",
    "OR Tambo",
    "Sarah Baartman",
  ],
  Limpopo: ["All Municipalities", "Polokwane", "Thulamela", "Makhado", "Greater Tzaneen"],
  Mpumalanga: ["All Municipalities", "Mbombela", "eMalahleni", "Steve Tshwete", "Govan Mbeki"],
  "North West": ["All Municipalities", "Rustenburg", "Mahikeng", "City of Matlosana", "JB Marks"],
  "Free State": ["All Municipalities", "Mangaung", "Matjhabeng", "Metsimaholo", "Dihlabeng"],
  "Northern Cape": ["All Municipalities", "Sol Plaatje", "Dawid Kruiper", "Nama Khoi"],
  "All Provinces": ["All Municipalities"],
};
const MUNICIPALITY_WARD_COUNTS: Record<string, number> = {
  Johannesburg: 135,
  Tshwane: 107,
  Ekurhuleni: 112,
  "Cape Town": 116,
  eThekwini: 111,
  "Nelson Mandela Bay": 60,
  "Buffalo City": 50,
  Mangaung: 51,
};
const getDefaultMunicipality = (prov: string) => {
  return "All Municipalities";
};
const DATE_RANGES = [
  { label: "Trailing 7 Days", value: 7 },
  { label: "Trailing 30 Days", value: 30 },
  { label: "Trailing 90 Days", value: 90 },
];
export default function OmniFilterToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryProvince = searchParams.get("province");
  const queryDays = searchParams.get("days");
  const queryServiceDomain = searchParams.get("serviceDomain");
  const queryMunicipality = searchParams.get("municipality");
  const queryWard = searchParams.get("ward");

  const [copied, setCopied] = useState(false);

  // Derive source-of-truth values gracefully, falling back to local storage
  const getLocal = (key: string, def: string) => {
    if (typeof window !== "undefined") return localStorage.getItem(key) || def;
    return def;
  };

  const province = queryProvince || getLocal("gicFilter_province", "Gauteng");
  const days = queryDays ? Number(queryDays) : Number(getLocal("gicFilter_days", "30"));
  const serviceDomain = queryServiceDomain || getLocal("gicFilter_serviceDomain", "all");

  const isMunicipalityRoute =
    pathname.includes("/executive/municipalities") ||
    pathname.includes("/executive/leadership");

  let municipality = queryMunicipality || getLocal("gicFilter_municipality", "Johannesburg");
  let ward = queryWard || getLocal("gicFilter_ward", "All Wards");

  // Validate that the derived municipality ACTUALLY belongs to the current province, otherwise reset
  if (
    province !== "All Provinces" &&
    PROVINCE_MUNICIPALITIES[province] &&
    !PROVINCE_MUNICIPALITIES[province].includes(municipality)
  ) {
    municipality = "All Municipalities";
  }

  // Effect handles single unidirectional sync from derived values back to query url & cache
  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (!queryProvince && province && province !== "All Provinces") {
      nextParams.set("province", province);
      changed = true;
    }
    if (!queryDays && days) {
      nextParams.set("days", String(days));
      changed = true;
    }
    if (!queryServiceDomain && serviceDomain !== "all") {
      nextParams.set("serviceDomain", serviceDomain);
      changed = true;
    }

    if (isMunicipalityRoute) {
      if (!queryMunicipality && municipality && municipality !== "All Municipalities") {
        nextParams.set("municipality", municipality);
        changed = true;
      } else if (queryMunicipality && municipality === "All Municipalities") {
        nextParams.delete("municipality");
        changed = true;
      }

      if (municipality !== "All Municipalities") {
        if (!queryWard && ward && ward !== "All Wards") {
          nextParams.set("ward", ward);
          changed = true;
        } else if (queryWard && ward === "All Wards") {
          nextParams.delete("ward");
          changed = true;
        }
      } else if (queryWard) {
        nextParams.delete("ward");
        changed = true;
      }
    } else if (queryMunicipality) {
      // Purge municipality from URL if not on a valid route
      nextParams.delete("municipality");
      nextParams.delete("ward");
      changed = true;
    }

    if (changed) {
      router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("gicFilter_province", province);
      localStorage.setItem("gicFilter_days", days.toString());
      localStorage.setItem("gicFilter_serviceDomain", serviceDomain);
      localStorage.setItem("gicFilter_municipality", municipality);
    }
  }, [
    pathname,
    searchParams,
    queryProvince,
    queryDays,
    queryServiceDomain,
    queryMunicipality,
    queryWard,
    province,
    days,
    serviceDomain,
    municipality,
    ward,
    isMunicipalityRoute,
    router,
  ]);

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center py-2 sm:py-4 gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="bg-gic-blue/10 p-2 pointer-events-none">
              <MapPin className="w-5 h-5 text-gic-blue" />
            </div>
            {/* Context Breadcrumb Wrapper */}
            <div className="flex items-center gap-2">
              <select
                value={province}
                onChange={(e) => {
                  const newProv = e.target.value;
                  const nextParams = new URLSearchParams(searchParams.toString());
                  if (newProv !== "All Provinces") nextParams.set("province", newProv);
                  else nextParams.delete("province");
                  
                  // Reset municipality immediately on province change to avoid mismatch
                  nextParams.delete("municipality"); 
                  nextParams.delete("ward");
                  
                  router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
                }}
                className={`bg-transparent border-none font-black text-slate-900 focus:ring-0 p-0 cursor-pointer ${isMunicipalityRoute ? "text-sm text-slate-500" : "text-xl"}`}
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {isMunicipalityRoute && (
                <>
                  <span className="text-slate-300 font-light">/</span>
                  <select
                    value={municipality}
                    onChange={(e) => {
                      const val = e.target.value;
                      const nextParams = new URLSearchParams(searchParams.toString());
                      if (val !== "All Municipalities") {
                        nextParams.set("municipality", val);
                      } else {
                        nextParams.delete("municipality");
                      }
                      router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
                    }}
                    className="bg-transparent border-none text-xl font-black text-gic-blue focus:ring-0 p-0 cursor-pointer min-w-[200px]"
                  >
                    {(PROVINCE_MUNICIPALITIES[province] || []).map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </>
              )}
              {isMunicipalityRoute && municipality && municipality !== "All Municipalities" && (
                <>
                  <span className="text-slate-300 font-light">/</span>
                  <select
                    value={ward}
                    onChange={(e) => {
                      const val = e.target.value;
                      const nextParams = new URLSearchParams(searchParams.toString());
                      if (val !== "All Wards") {
                        nextParams.set("ward", val);
                      } else {
                        nextParams.delete("ward");
                      }
                      router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
                    }}
                    className="bg-transparent border-none text-xl font-black text-slate-500 focus:ring-0 p-0 cursor-pointer min-w-[120px]"
                  >
                    <option value="All Wards">All Wards</option>
                    {Array.from({ length: MUNICIPALITY_WARD_COUNTS[municipality] || 50 }).map((_, i) => {
                      const rootW = WARD_NOMS[`${municipality}_${i + 1}`];
                      
                      return (
                        <option key={i} value={`Ward ${i + 1}`}>
                          Ward {i + 1} {rootW ? `- ${rootW}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
