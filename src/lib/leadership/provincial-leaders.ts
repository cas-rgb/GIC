export interface ProvincialLeader {
  province: string;
  leaderName: string;
  office: string;
  aliases: string[];
}

// Verified against official provincial government and gov.za directories on 2026-03-16.
export const PROVINCIAL_LEADERS: ProvincialLeader[] = [
  {
    province: "Eastern Cape",
    leaderName: "Oscar Mabuyane",
    office: "Office of the Premier",
    aliases: [
      "Oscar Mabuyane",
      "Lubabalo Oscar Mabuyane",
      "Mr Oscar Mabuyane",
      "Mr Lubabalo Oscar Mabuyane",
      "Premier Mabuyane",
      "Eastern Cape Premier",
    ],
  },
  {
    province: "Free State",
    leaderName: "MaQueen Joyce Letsoha-Mathae",
    office: "Office of the Premier",
    aliases: [
      "MaQueen Joyce Letsoha-Mathae",
      "Letsoha-Mathae",
      "Premier Letsoha-Mathae",
      "Free State Premier",
    ],
  },
  {
    province: "Gauteng",
    leaderName: "Panyaza Lesufi",
    office: "Office of the Premier",
    aliases: ["Panyaza Lesufi", "Lesufi", "Premier Lesufi", "Gauteng Premier"],
  },
  {
    province: "KwaZulu-Natal",
    leaderName: "Arthur Thamsanqa (Thami) Ntuli",
    office: "Office of the Premier",
    aliases: [
      "Arthur Thamsanqa (Thami) Ntuli",
      "Thami Ntuli",
      "Ntuli",
      "Premier Ntuli",
      "KwaZulu-Natal Premier",
      "KZN Premier",
    ],
  },
  {
    province: "Limpopo",
    leaderName: "Phophi Ramathuba",
    office: "Office of the Premier",
    aliases: [
      "Phophi Ramathuba",
      "Ramathuba",
      "Premier Ramathuba",
      "Limpopo Premier",
    ],
  },
  {
    province: "Mpumalanga",
    leaderName: "Mandla Ndlovu",
    office: "Office of the Premier",
    aliases: [
      "Mandla Ndlovu",
      "Mr Mandla Ndlovu",
      "Ndlovu",
      "Premier Mandla Ndlovu",
      "Premier Ndlovu",
      "Mpumalanga Premier",
    ],
  },
  {
    province: "North West",
    leaderName: "Lazarus Mokgosi",
    office: "Office of the Premier",
    aliases: [
      "Lazarus Mokgosi",
      "Mokgosi",
      "Premier Mokgosi",
      "North West Premier",
    ],
  },
  {
    province: "Northern Cape",
    leaderName: "Zamani Saul",
    office: "Office of the Premier",
    aliases: [
      "Zamani Saul",
      "Dr Zamani Saul",
      "Saul",
      "Premier Zamani Saul",
      "Premier Dr Zamani Saul",
      "Premier Saul",
      "Northern Cape Premier",
    ],
  },
  {
    province: "Western Cape",
    leaderName: "Alan Winde",
    office: "Office of the Premier",
    aliases: [
      "Alan Winde",
      "Mr Alan Winde",
      "Winde",
      "Premier Alan Winde",
      "Premier Winde",
      "Western Cape Premier",
    ],
  },
];
