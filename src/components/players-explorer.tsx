"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { POSITIONS, money, num, playerPhoto, STATUS_LABELS } from "@/lib/format";
import type { PlayerRow } from "@/lib/queries";

type TeamOption = { id: number; name: string; shortName: string };

const SORTS: { key: string; label: string }[] = [
  { key: "totalPoints", label: "النقاط" },
  { key: "form", label: "الفورمة" },
  { key: "valueSeason", label: "القيمة/السعر" },
  { key: "nowCost", label: "السعر" },
  { key: "selectedByPercent", label: "الملكية" },
  { key: "pointsPerGame", label: "نقاط/مباراة" },
  { key: "goalsScored", label: "الأهداف" },
  { key: "assists", label: "الصناعة" },
  { key: "cleanSheets", label: "شباك نظيفة" },
  { key: "saves", label: "تصديات" },
  { key: "bonus", label: "نقاط إضافية" },
  { key: "bps", label: "BPS" },
  { key: "ictIndex", label: "مؤشر ICT" },
  { key: "expectedGoals", label: "xG" },
  { key: "expectedAssists", label: "xA" },
  { key: "expectedGoalInvolvements", label: "xGI" },
  { key: "defensiveContribution", label: "مساهمة دفاعية" },
  { key: "transfersInEvent", label: "انتقالات داخلة" },
  { key: "minutes", label: "الدقائق" },
  { key: "epNext", label: "النقاط المتوقعة" },
];

export default function PlayersExplorer({ teams }: { teams: TeamOption[] }) {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [position, setPosition] = useState(0);
  const [teamId, setTeamId] = useState(0);
  const [maxCost, setMaxCost] = useState(165);
  const [available, setAvailable] = useState(false);
  const [sort, setSort] = useState("totalPoints");
  const [limit, setLimit] = useState(50);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (position) params.set("position", String(position));
    if (teamId) params.set("team", String(teamId));
    if (maxCost < 165) params.set("maxCost", String(maxCost));
    if (available) params.set("available", "1");
    params.set("sort", sort);
    params.set("limit", String(limit));
    return params.toString();
  }, [search, position, teamId, maxCost, available, sort, limit]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/players?${query}`)
        .then((r) => r.json())
        .then((data: { players: PlayerRow[]; total: number }) => {
          if (cancelled) return;
          setPlayers(data.players ?? []);
          setTotal(data.total ?? 0);
        })
        .catch(() => undefined)
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const addToSquad = useCallback(async (playerId: number) => {
    const res = await fetch("/api/squad", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, action: "add" }),
    });
    const data = (await res.json()) as { ok: boolean; message?: string };
    setToast(
      data.ok ? "✅ تمت إضافة اللاعب إلى تشكيلتك" : `⚠️ ${data.message}`,
    );
    setTimeout(() => setToast(null), 2600);
  }, []);

  const addToWatch = useCallback(async (playerId: number) => {
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
    setToast("⭐ أُضيف إلى قائمة المتابعة");
    setTimeout(() => setToast(null), 2600);
  }, []);

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-[11px] text-slate-300">بحث عن لاعب</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="مثال: Salah"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-300">النادي</label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
            >
              <option value={0}>كل الأندية</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-slate-300">الترتيب حسب</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-slate-300">
              أقصى سعر: £{money(maxCost)}
            </label>
            <input
              type="range"
              min={38}
              max={165}
              step={1}
              value={maxCost}
              onChange={(e) => setMaxCost(Number(e.target.value))}
              className="mt-3 w-full accent-emerald-400"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {[0, 1, 2, 3, 4].map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => setPosition(pos)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                position === pos
                  ? "bg-[#00ff87] text-[#37003c]"
                  : "bg-white/5 text-slate-200 hover:bg-white/10"
              }`}
            >
              {pos === 0 ? "كل المراكز" : POSITIONS[pos].ar}
            </button>
          ))}
          <label className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="accent-emerald-400"
            />
            الجاهزون فقط
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white"
          >
            {[25, 50, 100, 200].map((n) => (
              <option key={n} value={n}>
                عرض {n}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400">
            {loading ? "جارٍ التحميل…" : `${players.length} من ${total} لاعب`}
          </span>
        </div>
      </div>

      {toast ? (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
          {toast}
        </div>
      ) : null}

      <div className="card overflow-x-auto">
        <table className="fpl w-full min-w-[980px] text-right text-sm">
          <thead className="text-[11px] uppercase text-slate-300">
            <tr>
              <th className="px-3 py-3">اللاعب</th>
              <th className="px-2 py-3">المركز</th>
              <th className="px-2 py-3">السعر</th>
              <th className="px-2 py-3">النقاط</th>
              <th className="px-2 py-3">الفورمة</th>
              <th className="px-2 py-3">ن/م</th>
              <th className="px-2 py-3">الملكية</th>
              <th className="px-2 py-3">أهداف</th>
              <th className="px-2 py-3">صناعة</th>
              <th className="px-2 py-3">xGI</th>
              <th className="px-2 py-3">ICT</th>
              <th className="px-2 py-3">دقائق</th>
              <th className="px-2 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => {
              const status = STATUS_LABELS[p.status] ?? STATUS_LABELS.a;
              return (
                <tr
                  key={p.id}
                  className="border-t border-white/5 transition hover:bg-white/5"
                >
                  <td className="px-3 py-2">
                    <Link href={`/players/${p.id}`} className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={playerPhoto(p.code)}
                        alt=""
                        className="h-8 w-8 rounded-full bg-white/10"
                        loading="lazy"
                      />
                      <span>
                        <span className="block font-semibold text-white">
                          {p.webName}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {p.teamShort} ·{" "}
                          <span className={`rounded px-1 ${status.color}`}>
                            {status.ar}
                          </span>
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-2 py-2 text-xs">
                    {POSITIONS[p.elementType]?.ar}
                  </td>
                  <td className="px-2 py-2 font-bold text-cyan-300">
                    £{money(p.nowCost)}
                  </td>
                  <td className="px-2 py-2 font-black text-emerald-300">
                    {p.totalPoints}
                  </td>
                  <td className="px-2 py-2">{num(p.form)}</td>
                  <td className="px-2 py-2">{num(p.pointsPerGame)}</td>
                  <td className="px-2 py-2">{num(p.selectedByPercent)}%</td>
                  <td className="px-2 py-2">{p.goalsScored}</td>
                  <td className="px-2 py-2">{p.assists}</td>
                  <td className="px-2 py-2">{num(p.expectedGoalInvolvements, 2)}</td>
                  <td className="px-2 py-2">{num(p.ictIndex)}</td>
                  <td className="px-2 py-2 text-slate-300">{p.minutes}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => addToSquad(p.id)}
                        className="rounded bg-emerald-400/20 px-2 py-1 text-[11px] font-bold text-emerald-200 hover:bg-emerald-400/30"
                      >
                        + فريقي
                      </button>
                      <button
                        type="button"
                        onClick={() => addToWatch(p.id)}
                        className="rounded bg-amber-400/15 px-2 py-1 text-[11px] font-bold text-amber-200 hover:bg-amber-400/25"
                      >
                        ⭐
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && players.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-3 py-8 text-center text-slate-400">
                  لا توجد نتائج مطابقة للبحث
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
