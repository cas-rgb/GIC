import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  const province = request.nextUrl.searchParams.get("province") || "Gauteng";
  const investors = [
    {
      id: "dbsa",
      name: "Development Bank of Southern Africa (DBSA)",
      type: "DFI",
      aum: "R100B+",
      focusSectors: ["Water Distribution", "Roads & Stormwater", "Energy"],
      history: `Historical footprint includes R4.5B in ${province} infrastructure bonds.`,
    },
    {
      id: "pic",
      name: "Public Investment Corporation (PIC)",
      type: "Pension Fund Manager",
      aum: "R2.6T+",
      focusSectors: ["Human Settlements", "Transport", "Energy"],
      history: `Heavy historical exposure to national SOEs; seeking ring-fenced municipal ${province} opportunities.`,
    },
    {
      id: "if",
      name: "Infrastructure Fund (IF)",
      type: "Blended Finance Facility",
      aum: "R100B Blended",
      focusSectors: ["Water Distribution", "Sanitation", "Mixed-Use"],
      history: `Provides catalytic capital for large-scale blended finance projects in ${province}.`,
    },
    {
      id: "afdb",
      name: "African Development Bank (AfDB)",
      type: "Multilateral DFI",
      aum: "$33B+",
      focusSectors: ["Energy", "Transport", "Water Distribution"],
      history: `Renewable energy and regional integration focus; prior ${province} grid upgrades.`,
    },
    {
      id: "om",
      name: "Old Mutual Infrastructure",
      type: "Private Private Equity",
      aum: "R150B IDEAS Fund",
      focusSectors: [
        "Renewable Energy",
        "Roads & Stormwater",
        "Digital Infrastructure",
      ],
      history: `Extensive private equity allocations in renewable energy across ${province}.`,
    },
  ];
  return NextResponse.json({ investors });
}


