import type { CertificateTier } from "@/types/database";

export const TIER_LABEL: Record<CertificateTier, string> = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
};

export const TIER_STYLE: Record<CertificateTier, string> = {
  platinum: "bg-slate-100 text-slate-700",
  gold: "bg-amber-50 text-amber-700",
  silver: "bg-zinc-100 text-zinc-600",
};

// เกณฑ์ตรงกับ /certificate-criteria: >80% Platinum, 70–80% Gold, 60–70% Silver, ต่ำกว่า 60% ไม่ได้ใบเซอร์
export function computeTier(percent: number): CertificateTier | null {
  if (percent > 80) return "platinum";
  if (percent > 70) return "gold";
  if (percent >= 60) return "silver";
  return null;
}
