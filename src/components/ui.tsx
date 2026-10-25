import Link from "next/link";
import type { ReactNode } from "react";
import { POSITIONS, money, playerPhoto, teamBadge } from "@/lib/format";
import type { PlayerRow } from "@/lib/queries";

export function StatCard({
  title,
  value,
  hint,
  accent = "emerald",
}: {
  title: string;
  value: ReactNode;
  hint?: string;
  accent?: "emerald" | "cyan" | "amber" | "rose";
}) {
  const accents: Record<string, string> = {
    emerald: "from-emerald-400/20 text-emerald-300",
    cyan: "from-cyan-400/20 text-cyan-300",
    amber: "from-amber-400/20 text-amber-300",
    rose: "from-rose-400/20 text-rose-300",
  };
  return (
    <div
      className={`card bg-gradient-to-bl ${accents[accent]} to-transparent p-4`}
    >
      <p className="text-xs text-slate-300">{title}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white">{title}</h2>
          {subtitle ? (
            <p className="text-[11px] text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PositionTag({ type }: { type: number }) {
  const pos = POSITIONS[type];
  if (!pos) return null;
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${pos.color}`}
    >
      {pos.en}
    </span>
  );
}

export function PlayerRowItem({
  player,
  metric,
  metricLabel,
  rank,
}: {
  player: PlayerRow;
  metric: ReactNode;
  metricLabel?: string;
  rank?: number;
}) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/5"
    >
      {rank ? (
        <span className="w-5 text-center text-xs font-bold text-slate-400">
          {rank}
        </span>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={playerPhoto(player.code)}
        alt={player.webName}
        className="h-9 w-9 rounded-full bg-white/10 object-cover"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {player.webName}
        </p>
        <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={teamBadge(player.teamCode)}
            alt={player.teamShort}
            className="h-3.5 w-3.5"
            loading="lazy"
          />
          {player.teamShort}
          <PositionTag type={player.elementType} />
          <span>£{money(player.nowCost)}</span>
        </p>
      </div>
      <div className="text-left">
        <p className="text-sm font-black text-emerald-300">{metric}</p>
        {metricLabel ? (
          <p className="text-[10px] text-slate-500">{metricLabel}</p>
        ) : null}
      </div>
    </Link>
  );
}
