import { useState, useEffect, useRef } from "react";
import {
  Database,
  ShieldCheck,
  TrendingUp,
  Globe,
  Zap,
  Search,
  MapPin,
  Network,
  Cpu,
  AlertCircle,
  MessageSquare,
  Target,
  Droplets,
  Truck,
  HeartPulse,
  Building2,
  Construction,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  getLogicalIntelligence,
  getStrategicNews,
  getNarrativeAnalysis,
  getPredictiveRisk,
  getStrategicRecommendationsAction,
  getGroundedSignals,
} from "@/app/actions";
import {
  StrategicInsights,
  AISignal,
  NarrativeDriver,
  RiskIndicator,
  StrategicRecommendation,
  Region,
} from "@/types";

// High-Value Analytic Components
import SourceCloud from "../analytics/SourceCloud";
import WordTree from "../analytics/WordTree";
import InfluencerMap from "../analytics/InfluencerMap";
import SimilarityLogic from "../analytics/SimilarityLogic";
import PremierPulse from "../analytics/PremierPulse";
import StrategicNews from "../analytics/StrategicNews";
import NarrativeAmplification from "../analytics/NarrativeAmplification";
import RiskMatrix from "../analytics/RiskMatrix";
import ProvinceIssueHeatmapPanel from "../analytics/ProvinceIssueHeatmapPanel";
import IntegrityLedger from "../analytics/IntegrityLedger";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

interface StrategicCommandProps {
  serviceId: string;
  strategicInsights: StrategicInsights | null;
  isLoading: boolean;
}

export default function StrategicCommand({
  serviceId,
  strategicInsights,
  isLoading,
}: StrategicCommandProps) {
  const [province, setProvince] = useState("Gauteng");
  const [municipality, setMunicipality] = useState("City of Johannesburg");
  const [ward, setWard] = useState("All");

  const [logicalData, setLogicalData] = useState<any>(null);
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [narrativeDrivers, setNarrativeDrivers] = useState<NarrativeDriver[]>(
    [],
  );
  const [predictiveRisks, setPredictiveRisks] = useState<RiskIndicator[]>([]);
  const [recommendation, setRecommendation] =
    useState<StrategicRecommendation | null>(null);
  const [realPromises, setRealPromises] = useState<any[]>([]);
  const [leadershipData, setLeadershipData] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [timeframe, setTimeframe] = useState<"recent" | "historical">("recent");

  const cacheMap = useRef(new Map<string, any>());

  // Service Themes for Extreme Identity
  const SERVICE_IDENTITY: any = {
    water: {
      color: "text-blue-500",
      bg: "bg-blue-600",
      icon: Droplets,
      mission: "Supply Integrity & Wastewater Audit",
    },
    roads: {
      color: "text-emerald-500",
      bg: "bg-emerald-600",
      icon: Truck,
      mission: "Network Flow & Logistical Resilience",
    },
    health: {
      color: "text-rose-500",
      bg: "bg-rose-600",
      icon: HeartPulse,
      mission: "Facility Capacity & Clinical Reach",
    },
    planning: {
      color: "text-amber-500",
      bg: "bg-amber-600",
      icon: Building2,
      mission: "Urban Growth & Settlement Logic",
    },
    structural: {
      color: "text-indigo-500",
      bg: "bg-indigo-600",
      icon: Construction,
      mission: "Housing Safety & Structural Audit",
    },
    apex: {
      color: "text-gic-blue",
      bg: "bg-slate-900",
      icon: ShieldCheck,
      mission: "Unified Infrastructure Governance",
    },
  };

  const identity = SERVICE_IDENTITY[serviceId] || SERVICE_IDENTITY["apex"];

  const PREMIERS: any = {
    Gauteng: "Panyaza Lesufi",
    "Western Cape": "Alan Winde",
    "Eastern Cape": "Oscar Mabuyane",
    "KwaZulu-Natal": "Thami Ntuli",
    Limpopo: "Dr. Phophi Ramathuba",
    Mpumalanga: "Mandla Ndlovu",
    "North West": "Lazarus Mokgosi",
    "Free State": "Maqueen Letsoha-Mathae",
    "Northern Cape": "Dr. Zamani Saul",
  };

  const MINISTERS: any = {
    water: "Pemmy Majodina",
    roads: "Barbara Creecy",
    health: "Dr. Aaron Motsoaledi",
    planning: "Dean Macpherson",
    structural: "Thembi Simelane",
    apex: "Dean Macpherson",
  };

  const PROVINCES = [
    "Gauteng",
    "Western Cape",
    "Eastern Cape",
    "KwaZulu-Natal",
    "Limpopo",
    "Mpumalanga",
    "North West",
    "Free State",
    "Northern Cape",
  ];

  const MUNICIPALITIES: any = {
    Gauteng: ["All", "City of Johannesburg", "Ekurhuleni", "City of Tshwane", "Sedibeng"],
    "Western Cape": [
      "All",
      "City of Cape Town",
      "Stellenbosch",
      "George",
      "Drakenstein",
    ],
    "Eastern Cape": ["All", "Nelson Mandela Bay", "Buffalo City", "OR Tambo"],
    "KwaZulu-Natal": ["All", "eThekwini", "Msunduzi", "uMhlathuze"],
    Limpopo: ["All", "Polokwane", "Thulamela", "Mopani"],
    Mpumalanga: ["All", "Mbombela", "Emalahleni", "Steve Tshwete"],
    "North West": ["All", "Mahikeng", "Rustenburg", "Tlokwe"],
    "Free State": ["All", "Mangaung", "Matjhabeng", "Maluti-a-Phofung"],
    "Northern Cape": ["All", "Sol Plaatje", "Dikgatlong", "Ga-Segonyana"],
  };

  const WARDS: any = {
    "City of Johannesburg": ["All", "Ward 58", "Ward 12", "Ward 77"],
    "City of Tshwane": ["All", "Ward 77", "Ward 42"],
    "City of Cape Town": ["All", "Ward 13", "Ward 8"],
    "Drakenstein": ["All", "Ward 6"],
    "eThekwini": ["All", "Ward 34", "Ward 11"],
    "Msunduzi": ["All", "Ward 28"],
    "Nelson Mandela Bay": ["All", "Ward 4"],
    "Buffalo City": ["All", "Ward 31"],
    "Polokwane": ["All", "Ward 19"],
    "Thulamela": ["All", "Ward 14"],
    "Mbombela": ["All", "Ward 22"],
    "Emalahleni": ["All", "Ward 10"],
    "Rustenburg": ["All", "Ward 16"],
    "Mahikeng": ["All", "Ward 9"],
    "Mangaung": ["All", "Ward 46"],
    "Matjhabeng": ["All", "Ward 20"],
    "Sol Plaatje": ["All", "Ward 8"],
    "Dikgatlong": ["All", "Ward 3"],
    "All": ["All"],
  };

  // Leadership Mapping Helper
  const getServiceLead = (associates: string[]) => {
    if (!associates) return null;
    return associates.find((a: string) => {
      const lower = a.toLowerCase();
      if (serviceId === "water")
        return (
          lower.includes("water") ||
          lower.includes("infrastructure") ||
          lower.includes("cogta")
        );
      if (serviceId === "roads")
        return (
          lower.includes("transport") ||
          lower.includes("roads") ||
          lower.includes("mobility") ||
          lower.includes("infrastructure")
        );
      if (serviceId === "health") return lower.includes("health");
      if (serviceId === "planning" || serviceId === "structural")
        return (
          lower.includes("human settlements") ||
          lower.includes("infrastructure") ||
          lower.includes("housing")
        );
      return lower.includes("infrastructure") || lower.includes("public works");
    });
  };

  // Mock Promises
  const generatePromises = (prov: string) => {
    return [
      {
        id: "1",
        statement: `Upgrade ${prov} water treatment plants by Q4 2026`,
        date: "Mar 2025",
        status: "in_progress",
        sentiment: 45,
      },
      {
        id: "2",
        statement: `Eradicate illegal mining (Zama Zamas) in high-risk zones`,
        date: "Feb 2025",
        status: "risk",
        sentiment: 22,
      },
      {
        id: "3",
        statement: `Resurface 500km of provincial arterial roads`,
        date: "Jan 2025",
        status: "fulfilled",
        sentiment: 78,
      },
    ] as any[];
  };

  useEffect(() => {
    let active = true;
    const runFetch = setTimeout(async () => {
      const geoLevel = ward !== "All" ? `${municipality}_${ward}` : municipality !== "All" ? municipality : province;
      const cacheKey = `${serviceId}_${geoLevel}_${timeframe}`;

      if (cacheMap.current.has(cacheKey)) {
        const cached = cacheMap.current.get(cacheKey);
        setLogicalData(cached.logicalData);
        setNewsArticles(cached.newsArticles);
        setNarrativeDrivers(cached.narrativeDrivers);
        setPredictiveRisks(cached.predictiveRisks);
        setRecommendation(cached.recommendation);
        setRealPromises(cached.realPromises);
        setLeadershipData(cached.leadershipData);
        setIsSyncing(false);
        return;
      }

      setIsSyncing(true);

      // 1. Fetch Logical Identity, News, and Leadership
      const communityId = geoLevel.toLowerCase().replace(/\s+/g, "_");
      const provinceId = province.toLowerCase().replace(/\s+/g, "_");

      const { db } = await import("@/lib/firebase");
      const { doc, getDoc } = await import("firebase/firestore");

      const [
        resLogic,
        resNews,
        leadershipDoc,
        promiseDoc,
        resGrounded,
      ] = await Promise.all([
        getLogicalIntelligence(serviceId, province, municipality),
        getStrategicNews(
          `${ward !== "All" ? ward : ""} ${municipality !== "All" ? municipality : province} ${serviceId === "apex" ? "infrastructure" : serviceId}`,
          timeframe
        ),
        getDoc(
          doc(
            db,
            "leadership",
            PREMIERS[province].toLowerCase().replace(/\s+/g, "_"),
          ),
        ),
        getDoc(doc(db, "provincial_promises", provinceId)),
        getGroundedSignals(communityId, identity.category || "Apex", timeframe),
      ]);

      if (!active) return;

      const newLeadershipData = leadershipDoc.exists() ? leadershipDoc.data() : null;
      setLeadershipData(newLeadershipData);

      const retrievedPromises = promiseDoc.exists()
        ? promiseDoc.data().promises || []
        : generatePromises(province);
      setRealPromises(retrievedPromises);

      const retrievedLogicalData = resLogic.success ? resLogic.data : null;
      if (resLogic.success) setLogicalData(resLogic.data);

      const baseArticles: any[] = resNews.success ? resNews.data || [] : [];
      const groundedSignals: any[] = resGrounded.success
        ? resGrounded.data || []
        : [];

      const combinedContent = [
        ...groundedSignals.map(
          (s: any) => `${s.title || ""}. ${s.excerpt || ""}`,
        ),
        ...baseArticles.map(
          (a: any) => `${a.title || ""}. ${a.description || ""}`,
        ),
      ].join(" ");

      const combinedNews = [...groundedSignals, ...baseArticles];
      setNewsArticles(combinedNews);

      let newNarrativeDrivers: any[] = [];
      let newPredictiveRisks: any[] = [];
      let newRecommendation: any = null;

      if (combinedContent.trim()) {
        const [resNarrative, resRisk] = await Promise.all([
          getNarrativeAnalysis(combinedContent),
          getPredictiveRisk(retrievedLogicalData?.signals || groundedSignals),
        ]);

        if (!active) return;

        if (resNarrative.success) {
          newNarrativeDrivers = resNarrative.data || [];
          setNarrativeDrivers(newNarrativeDrivers);
        }
        if (resRisk.success) {
          newPredictiveRisks = resRisk.data || [];
          setPredictiveRisks(newPredictiveRisks);
          const resRec = await getStrategicRecommendationsAction(
            resRisk.data || [],
            province,
          );
          if (active && resRec.success && resRec.data) {
             newRecommendation = resRec.data;
             setRecommendation(newRecommendation);
          }
        }
      }

      cacheMap.current.set(cacheKey, {
         logicalData: retrievedLogicalData,
         newsArticles: combinedNews,
         narrativeDrivers: newNarrativeDrivers,
         predictiveRisks: newPredictiveRisks,
         recommendation: newRecommendation,
         realPromises: retrievedPromises,
         leadershipData: newLeadershipData
      });

      if (active) {
          setIsSyncing(false);
      }
    }, 600); // 600ms debounce
    
    return () => {
        active = false;
        clearTimeout(runFetch);
    };
  }, [serviceId, province, municipality, ward, identity.category, timeframe]);

  const insights = strategicInsights || {
    hotspots: [],
    lookalikes: [],
    interventionBrief: null,
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen overflow-y-auto scrollbar-hide pb-20 font-sans">
      {/* 1. REPORT HEADER & FILTERS */}
      <div className="bg-white border-b border-gray-200 px-12 py-6 sticky top-0 z-30 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-8">
            <img
              src="/gic-logo.svg"
              alt="GIC"
              className="h-10 w-auto opacity-90 contrast-125 block"
            />
            <div className="w-[1px] h-10 bg-gray-200" />
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>National Intelligence Ledger</span>
                <span>/</span>
                <span>{serviceId.toUpperCase()} Strategy</span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                {serviceId === "apex"
                  ? "Integrated Strategic Overview"
                  : identity.title}
              </h1>
              <p className="text-sm font-medium text-gray-500">
                {identity.mission}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3 px-4 border-r border-gray-200">
              <MapPin className="w-4 h-4 text-gray-400" />
              <select
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  setMunicipality("All");
                  setWard("All");
                }}
                className="bg-transparent font-bold text-gray-700 text-sm focus:outline-none appearance-none pr-6"
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 px-4 border-r border-gray-200">
              <Search className="w-4 h-4 text-gray-400" />
              <select
                value={municipality}
                onChange={(e) => { 
                  setMunicipality(e.target.value);
                  setWard("All");
                }}
                className="bg-transparent font-bold text-gray-700 text-sm focus:outline-none appearance-none pr-6"
              >
                {(MUNICIPALITIES[province] || []).map((m: string) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 px-4">
              <span className="text-gray-400 font-bold text-sm">#</span>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="bg-transparent font-bold text-gray-700 text-sm focus:outline-none appearance-none pr-6"
              >
                {(WARDS[municipality] || ["All"]).map((w: string) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 px-6 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => setTimeframe("recent")}
                className={`text-[10px] font-black uppercase px-2 py-1 rounded transition-colors ${timeframe === "recent" ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"}`}
              >
                Recent (30D)
              </button>
              <button
                onClick={() => setTimeframe("historical")}
                className={`text-[10px] font-black uppercase px-2 py-1 rounded transition-colors ${timeframe === "historical" ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"}`}
              >
                All Context
              </button>
            </div>
          </div>
        </div>
      </div>

      {isSyncing ? (
        <div className="max-w-[1600px] mx-auto px-12 pt-32 pb-64 flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gic-blue rounded-full animate-spin"></div>
          <p className="text-sm font-black text-gray-500 uppercase tracking-widest animate-pulse">
            Auditing Intelligence Streams...
          </p>
        </div>
      ) : (
      <div className="max-w-[1600px] mx-auto px-12 pt-12 space-y-12">
        {/* 2. EXECUTIVE KPI SCORECARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Risk Exposure Index
              </span>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-5xl font-black text-gray-900">82.4%</div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-red-500">
                +4.2% from last period
              </span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Community Sentiment
              </span>
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-5xl font-black text-gray-900">45%</div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs font-bold text-green-500">
                +12% positive shift
              </span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Signal Volume
              </span>
              <Network className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-5xl font-black text-gray-900">3,283</div>
            <div className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
              Data points audited
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm border-l-8 border-l-gic-blue">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Ministerial Lead
              </span>
              <ShieldCheck className="w-5 h-5 text-gic-blue" />
            </div>
            <div className="text-2xl font-black text-gray-900 leading-tight uppercase">
              {MINISTERS[serviceId] || MINISTERS["apex"]}
            </div>
            <div className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Portfolio Oversight
            </div>
          </div>
        </div>

        {/* 3. SITUATION ANALYSIS: GEOGRAPHICAL VULNERABILITY */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
                Regional Vulnerability Analysis
              </h2>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Spatial Risk Distribution
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <ErrorBoundary>
                <ProvinceIssueHeatmapPanel
                  province={province}
                  serviceDomain={serviceId === "apex" ? null : serviceId}
                />
              </ErrorBoundary>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
                Decision Lead Status
              </h2>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Leadership Node
              </div>
            </div>
            <div className="space-y-8">
              <PremierPulse
                data={{
                  name: PREMIERS[province],
                  sentiment: leadershipData?.sentiment || 65,
                  associates: leadershipData?.associates || [],
                }}
                province={province}
              />
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-6">
                  Sectoral Summary
                </span>
                <div className="space-y-6">
                  <p className="text-lg font-bold text-gray-700 leading-relaxed italic border-l-4 border-gray-200 pl-6">
                    {recommendation?.mitigationStrategy ||
                      "Auditing regional data streams..."}
                  </p>
                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      System Status
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[10px] font-black text-gray-900 uppercase">
                        Operational
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. ANALYTIC AUDIT: EVIDENCE & SENTIMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
                Sentiment Analysis Feed
              </h2>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Public Narrative Assessment
              </div>
            </div>
            <div className="h-[700px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <ErrorBoundary>
                <NarrativeAmplification drivers={narrativeDrivers} />
              </ErrorBoundary>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
                Risk Forecasting Matrix
              </h2>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Predictive Modeling
              </div>
            </div>
            <div className="h-[700px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <ErrorBoundary>
                <RiskMatrix risks={predictiveRisks} />
              </ErrorBoundary>
            </div>
          </div>
        </div>

        {/* 5. STRATEGIC COMPLIANCE: AUDIT TRAIL */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
                Provincial Commitment Audit
              </h2>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Strategic Compliance Monitor
              </div>
            </div>
            <div className="h-[600px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <ErrorBoundary>
                <IntegrityLedger
                  premier={PREMIERS[province]}
                  province={province}
                  promises={realPromises}
                />
              </ErrorBoundary>
            </div>
          </div>

          <div className="xl:col-span-2 space-y-6">
            {recommendation && (
              <>
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
                    Executive Action Plan
                  </h2>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Intervention Protocol
                  </div>
                </div>
                <div className="bg-white border-2 border-gray-200 border-l-[12px] border-l-gic-gold p-10 rounded-2xl shadow-sm space-y-8 relative overflow-hidden">
                  <Target className="absolute -bottom-10 -right-10 w-64 h-64 text-gray-50" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-900 text-white rounded-lg">
                      <Zap className="w-4 h-4 text-gic-gold" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {recommendation.timing} INTERVENTION PROTOCOL
                      </span>
                    </div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Authorized Executive Briefing
                    </div>
                  </div>
                  <div className="relative z-10 space-y-6">
                    <p className="text-3xl font-black text-gray-900 leading-tight">
                      {recommendation.mitigationStrategy}
                    </p>
                    <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                      <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                          Intervention Nodes
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.priorityCommunities.map(
                            (c: string) => (
                              <span
                                key={c}
                                className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-black text-gray-700 border border-gray-200 uppercase"
                              >
                                {c}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                          Strategic Framing
                        </div>
                        <p className="text-sm font-bold text-gray-600 italic leading-relaxed">
                          "{recommendation.framing}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 6. TECHNICAL DATA AUDIT (FOOTER DATA) */}
        <div className="pt-12 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <div className="flex items-center gap-12">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4" />
                <span>GIC Data Warehouse: Synchronized</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4" />
                <span>External Intelligence: Grounded</span>
              </div>
            </div>
            <div>
              <span>System Node: GIC-STRAT-IND-001</span>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
