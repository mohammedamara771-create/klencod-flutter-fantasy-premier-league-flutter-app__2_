"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BUDGET,
  POSITIONS,
  SQUAD_LIMITS,
  money,
  num,
  playerPhoto,
} from "@/lib/format";
import type { PlayerRow } from "@/lib/queries";
import type { SquadSummary } from "@/lib/squad";

type Pick = {
  id: number;
  playerId: number;
  isCaptain: boolean | null;
  isViceCaptain: boolean | null;
  player: PlayerRow;
};

type SquadPayload = {
  ok: boolean;
  picks: Pick[];
  summary: SquadSummary;
  message?: string;
};

type WatchItem = { id: number; playerId: number; player: PlayerRow };

export default function SquadBuilder() {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [summary, setSummary] = useState<SquadSummary | null>(null);
  const [watch, setWatch] = useState<WatchItem[]>([]);
  const [results, setResults] = useState<PlayerRow[]>([]);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyPayload = useCallback((data: SquadPayload) => {
    if (data.picks) setPicks(data.picks);
    if (data.summary) setSummary(data.summary);
    if (!data.ok && data.message) setMessage(`⚠️ ${data.message}`);
  }, []);

  const loadSquad = useCallback(async () => {
    const res = await fetch("/api/squad");
    applyPayload((await res.json()) as SquadPayload);
    setLoading(false);
  }, [applyPayload]);

  const loadWatch = useCallback(async () => {
    const res = await fetch("/api/watchlist");
    const data = (await res.json()) as { items: WatchItem[] };
    setWatch(data.items ?? []);
  }, []);

  useEffect(() => {
    void loadSquad();
    void loadWatch();
  }, [loadSquad, loadWatch]);

  useEffect(() => {
    const params = new URLSearchParams({ sort: "totalPoints", limit: "18" });
    if (search) params.set("search", search);
    if (position) params.set("position", String(position));
    const remaining = summary ? summary.remaining : BUDGET;
    if (remaining > 0 && picks.length > 0) params.set("maxCost", String(remaining));
    const timer = setTimeout(() => {
      fetch(`/api/players?${params.toString()}`)
        .then((r) => r.json())
        .then((d: { players: PlayerRow[] }) => setResults(d.players ?? []))
        .catch(() => undefined);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, position, summary, picks.length]);

  const action = useCallback(
    async (body: Record<string, unknown>) => {
      setMessage(null);
      const res = await fetch("/api/squad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as SquadPayload;
      applyPayload(data);
      if (data.ok) setMessage("✅ تم تحديث التشكيلة");
      setTimeout(() => setMessage(null), 2500);
    },
    [applyPayload],
  );

  const remove = useCallback(
    async (playerId: number) => {
      const res = await fetch(`/api/squad?playerId=${playerId}`, {
        method: "DELETE",
      });
      applyPayload((await res.json()) as SquadPayload);
    },
    [applyPayload],
  );

  const removeWatch = useCallback(
    async (playerId: number) => {
      await fetch(`/api/watchlist?playerId=${playerId}`, { method: "DELETE" });
      void loadWatch();
    },
    [loadWatch],
  );

  const spentPct = summary ? Math.min(100, (summary.spent / BUDGET) * 100) : 0;

  const lines = [1, 2, 3, 4].map((pos) => ({
    pos,
    players: picks.filter((p) => p.player.elementType === pos),
  }));

  return (
    <div className="space-y-4">
      <div className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-slate-300">الميزانية المتبقية</p>
          <p className="text-2xl font-black text-emerald-300">
            £{money(summary?.remaining ?? BUDGET)}م
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#00ff87] to-[#04f5ff]"
              style={{ width: `${spentPct}%` }}
            />
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-300">عدد اللاعبين</p>
          <p className="text-2xl font-black text-white">{summary?.count ?? 0}/15</p>
          <p className="text-[11px] text-slate-400">
            {Object.entries(SQUAD_LIMITS)
              .map(
                ([pos, limit]) =>
                  `${POSITIONS[Number(pos)].en} ${summary?.byPosition[Number(pos)] ?? 0}/${limit}`,
              )
              .join(" · ")}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-300">نقاط التشكيلة (الموسم)</p>
          <p className="text-2xl font-black text-cyan-300">
            {summary?.totalPoints ?? 0}
          </p>
          <p className="text-[11px] text-slate-400">
            متوقع الجولة القادمة: {num(summary?.expectedPoints ?? 0)}
          </p>
        </div>
        <div className="flex flex-col justify-between gap-2">
          <p
            className={`rounded-lg px-3 py-2 text-xs ${
              summary?.complete
                ? "bg-emerald-400/15 text-emerald-200"
                : "bg-amber-400/10 text-amber-200"
            }`}
          >
            {summary?.complete
              ? "التشكيلة مكتملة وصالحة ✅"
              : "أكمل 15 لاعباً ضمن قيود المراكز والميزانية"}
          </p>
          <button
            type="button"
            onClick={() => action({ action: "clear" })}
            className="rounded-lg bg-rose-500/20 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/30"
          >
            مسح التشكيلة
          </button>
        </div>
      </div>

      {message ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <section className="card overflow-hidden">
          <div className="bg-[linear-gradient(180deg,#0b3d1f,#0a2f18)] p-4">
            {loading ? (
              <p className="py-10 text-center text-sm text-slate-300">
                جارٍ تحميل التشكيلة…
              </p>
            ) : (
              <div className="space-y-4">
                {lines.map((line) => (
                  <div key={line.pos}>
                    <p className="mb-1 text-center text-[11px] font-bold text-emerald-200/80">
                      {POSITIONS[line.pos].ar} ({line.players.length}/
                      {SQUAD_LIMITS[line.pos]})
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {line.players.map((pick) => (
                        <div
                          key={pick.playerId}
                          className="w-24 rounded-xl bg-black/40 p-2 text-center"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={playerPhoto(pick.player.code)}
                            alt=""
                            className="mx-auto h-12 w-11 rounded object-cover"
                          />
                          <Link
                            href={`/players/${pick.playerId}`}
                            className="mt-1 block truncate text-[11px] font-bold text-white"
                          >
                            {pick.player.webName}
                          </Link>
                          <p className="text-[10px] text-emerald-300">
                            £{money(pick.player.nowCost)} · {pick.player.totalPoints}ن
                          </p>
                          <div className="mt-1 flex justify-center gap-1">
                            <button
                              type="button"
                              title="كابتن"
                              onClick={() =>
                                action({ playerId: pick.playerId, action: "captain" })
                              }
                              className={`h-5 w-5 rounded-full text-[10px] font-black ${
                                pick.isCaptain
                                  ? "bg-[#00ff87] text-[#37003c]"
                                  : "bg-white/10 text-white"
                              }`}
                            >
                              C
                            </button>
                            <button
                              type="button"
                              title="نائب الكابتن"
                              onClick={() =>
                                action({ playerId: pick.playerId, action: "vice" })
                              }
                              className={`h-5 w-5 rounded-full text-[10px] font-black ${
                                pick.isViceCaptain
                                  ? "bg-cyan-300 text-[#37003c]"
                                  : "bg-white/10 text-white"
                              }`}
                            >
                              V
                            </button>
                            <button
                              type="button"
                              title="إزالة"
                              onClick={() => remove(pick.playerId)}
                              className="h-5 w-5 rounded-full bg-rose-500/70 text-[10px] font-black text-white"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                      {Array.from({
                        length: Math.max(
                          0,
                          SQUAD_LIMITS[line.pos] - line.players.length,
                        ),
                      }).map((_, i) => (
                        <div
                          key={`empty-${line.pos}-${i}`}
                          className="grid h-[104px] w-24 place-items-center rounded-xl border border-dashed border-white/20 text-[11px] text-white/40"
                        >
                          فارغ
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="space-y-4">
          <section className="card p-4">
            <h2 className="mb-2 text-sm font-bold text-white">إضافة لاعب</h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم…"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {[0, 1, 2, 3, 4].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosition(pos)}
                  className={`rounded px-2 py-1 text-[11px] font-bold ${
                    position === pos
                      ? "bg-[#00ff87] text-[#37003c]"
                      : "bg-white/5 text-slate-200"
                  }`}
                >
                  {pos === 0 ? "الكل" : POSITIONS[pos].en}
                </button>
              ))}
            </div>
            <div className="mt-3 max-h-80 space-y-1 overflow-y-auto pl-1">
              {results.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2 py-1.5 text-xs"
                >
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-bold text-white">{p.webName}</span>{" "}
                    <span className="text-slate-400">
                      {p.teamShort} · {POSITIONS[p.elementType].en}
                    </span>
                  </span>
                  <span className="text-cyan-200">£{money(p.nowCost)}</span>
                  <span className="text-emerald-300">{p.totalPoints}ن</span>
                  <button
                    type="button"
                    onClick={() => action({ playerId: p.id, action: "add" })}
                    className="rounded bg-emerald-400/20 px-2 py-1 font-bold text-emerald-200"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4">
            <h2 className="mb-2 text-sm font-bold text-white">
              ⭐ قائمة المتابعة ({watch.length})
            </h2>
            <div className="space-y-1">
              {watch.length === 0 ? (
                <p className="text-xs text-slate-400">
                  أضف لاعبين من صفحة اللاعبين لمتابعتهم هنا.
                </p>
              ) : (
                watch.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2 py-1.5 text-xs"
                  >
                    <Link
                      href={`/players/${w.playerId}`}
                      className="min-w-0 flex-1 truncate font-bold text-white"
                    >
                      {w.player.webName}{" "}
                      <span className="text-slate-400">{w.player.teamShort}</span>
                    </Link>
                    <span className="text-cyan-200">£{money(w.player.nowCost)}</span>
                    <button
                      type="button"
                      onClick={() => action({ playerId: w.playerId, action: "add" })}
                      className="rounded bg-emerald-400/20 px-2 py-0.5 text-emerald-200"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeWatch(w.playerId)}
                      className="rounded bg-rose-500/20 px-2 py-0.5 text-rose-200"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
