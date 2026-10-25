import { BUDGET, MAX_PER_CLUB, SQUAD_LIMITS } from "@/lib/format";
import type { PlayerRow } from "@/lib/queries";

export type SquadSummary = {
  count: number;
  spent: number;
  remaining: number;
  byPosition: Record<number, number>;
  byClub: Record<number, number>;
  complete: boolean;
  expectedPoints: number;
  totalPoints: number;
};

export function summarizeSquad(picks: PlayerRow[]): SquadSummary {
  const byPosition: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const byClub: Record<number, number> = {};
  let spent = 0;
  let expectedPoints = 0;
  let totalPoints = 0;
  for (const p of picks) {
    byPosition[p.elementType] = (byPosition[p.elementType] ?? 0) + 1;
    byClub[p.teamId] = (byClub[p.teamId] ?? 0) + 1;
    spent += p.nowCost;
    expectedPoints += p.epNext ?? 0;
    totalPoints += p.totalPoints ?? 0;
  }
  const complete =
    picks.length === 15 &&
    Object.entries(SQUAD_LIMITS).every(
      ([pos, limit]) => byPosition[Number(pos)] === limit,
    );
  return {
    count: picks.length,
    spent,
    remaining: BUDGET - spent,
    byPosition,
    byClub,
    complete,
    expectedPoints: Math.round(expectedPoints * 10) / 10,
    totalPoints,
  };
}

export function validateAddition(
  current: PlayerRow[],
  candidate: PlayerRow,
): { ok: boolean; message?: string } {
  if (current.some((p) => p.id === candidate.id))
    return { ok: false, message: "اللاعب موجود في تشكيلتك بالفعل" };
  if (current.length >= 15)
    return { ok: false, message: "التشكيلة مكتملة (15 لاعباً)" };

  const summary = summarizeSquad(current);
  const positionLimit = SQUAD_LIMITS[candidate.elementType] ?? 0;
  if ((summary.byPosition[candidate.elementType] ?? 0) >= positionLimit)
    return {
      ok: false,
      message: `بلغت الحد الأقصى لهذا المركز (${positionLimit})`,
    };
  if ((summary.byClub[candidate.teamId] ?? 0) >= MAX_PER_CLUB)
    return { ok: false, message: `لا يمكن اختيار أكثر من ${MAX_PER_CLUB} لاعبين من نفس النادي` };
  if (summary.spent + candidate.nowCost > BUDGET)
    return { ok: false, message: "الميزانية غير كافية لإضافة هذا اللاعب" };
  return { ok: true };
}
