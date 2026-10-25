export const POSITIONS: Record<
  number,
  { ar: string; short: string; en: string; color: string }
> = {
  1: { ar: "حارس مرمى", short: "حار", en: "GKP", color: "bg-amber-400/90 text-amber-950" },
  2: { ar: "مدافع", short: "مدا", en: "DEF", color: "bg-sky-400/90 text-sky-950" },
  3: { ar: "وسط", short: "وسط", en: "MID", color: "bg-emerald-400/90 text-emerald-950" },
  4: { ar: "مهاجم", short: "مها", en: "FWD", color: "bg-rose-400/90 text-rose-950" },
};

export const SQUAD_LIMITS: Record<number, number> = { 1: 2, 2: 5, 3: 5, 4: 3 };
export const BUDGET = 1000; // 100.0m بوحدات FPL
export const MAX_PER_CLUB = 3;

export const STATUS_LABELS: Record<string, { ar: string; color: string }> = {
  a: { ar: "جاهز", color: "bg-emerald-500/15 text-emerald-300" },
  d: { ar: "مشكوك", color: "bg-amber-500/15 text-amber-300" },
  i: { ar: "مصاب", color: "bg-rose-500/15 text-rose-300" },
  s: { ar: "موقوف", color: "bg-rose-500/15 text-rose-300" },
  u: { ar: "غير متاح", color: "bg-slate-500/15 text-slate-300" },
  n: { ar: "غير مؤهل", color: "bg-slate-500/15 text-slate-300" },
};

export const money = (cost: number) => (cost / 10).toFixed(1);

export const fdrColor = (d: number) => {
  if (d <= 1) return "bg-emerald-500 text-emerald-950";
  if (d === 2) return "bg-emerald-400 text-emerald-950";
  if (d === 3) return "bg-slate-300 text-slate-900";
  if (d === 4) return "bg-rose-400 text-rose-950";
  return "bg-rose-600 text-white";
};

export const playerPhoto = (code: number) =>
  `https://resources.premierleague.com/premierleague/photos/players/110x140/p${code}.png`;

export const teamBadge = (code: number) =>
  `https://resources.premierleague.com/premierleague/badges/70/t${code}.png`;

export const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const num = (value: number | null | undefined, digits = 1) =>
  (value ?? 0).toFixed(digits);
