"use client";

import { useState } from "react";
import { money } from "@/lib/format";
import type { FplEntry, FplEntryHistory } from "@/lib/fpl";

export default function ManagerLookup() {
  const [teamId, setTeamId] = useState("");
  const [data, setData] = useState<{
    entry: FplEntry;
    history: FplEntryHistory;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lookup = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!teamId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/manager/${teamId}`);
      const payload = (await res.json()) as {
        ok: boolean;
        entry?: FplEntry;
        history?: FplEntryHistory;
        message?: string;
      };
      if (payload.ok && payload.entry && payload.history) {
        setData({ entry: payload.entry, history: payload.history });
      } else {
        setData(null);
        setError(payload.message ?? "تعذر جلب البيانات");
      }
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const current = data?.history.current ?? [];
  const best = current.reduce(
    (acc, row) => (row.points > acc ? row.points : acc),
    0,
  );

  return (
    <div className="space-y-4">
      <form onSubmit={lookup} className="card flex flex-wrap gap-2 p-4">
        <input
          value={teamId}
          onChange={(e) => setTeamId(e.target.value.replace(/\D/g, ""))}
          placeholder="رقم الفريق مثال: 1234567"
          inputMode="numeric"
          className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
        />
        <button
          type="submit"
          disabled={loading || !teamId}
          className="rounded-lg bg-gradient-to-l from-[#00ff87] to-[#04f5ff] px-5 py-2 text-sm font-bold text-[#37003c] disabled:opacity-50"
        >
          {loading ? "جارٍ البحث…" : "عرض الإحصائيات"}
        </button>
      </form>

      {error ? (
        <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm text-rose-200">
          ⚠️ {error}
        </p>
      ) : null}

      {data ? (
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-xl font-black text-white">{data.entry.name}</h2>
            <p className="text-sm text-slate-300">
              {data.entry.player_first_name} {data.entry.player_last_name}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["إجمالي النقاط", data.entry.summary_overall_points],
                [
                  "الترتيب العالمي",
                  data.entry.summary_overall_rank?.toLocaleString("en-US") ?? "—",
                ],
                ["نقاط آخر جولة", data.entry.summary_event_points],
                [
                  "قيمة الفريق",
                  `£${money((data.entry.last_deadline_value ?? 0) + (data.entry.last_deadline_bank ?? 0))}م`,
                ],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs text-slate-300">{label}</p>
                  <p className="text-xl font-black text-emerald-300">
                    {String(value)}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              أفضل نتيجة في جولة هذا الموسم: <b className="text-white">{best}</b> نقطة
              · إجمالي الانتقالات:{" "}
              <b className="text-white">
                {data.entry.last_deadline_total_transfers ?? 0}
              </b>
            </p>
          </div>

          <div className="card overflow-x-auto p-4">
            <h3 className="mb-2 text-sm font-bold text-white">الأداء جولة بجولة</h3>
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead className="text-[11px] text-slate-300">
                <tr>
                  <th className="px-2 py-2">الجولة</th>
                  <th className="px-2 py-2">النقاط</th>
                  <th className="px-2 py-2">الإجمالي</th>
                  <th className="px-2 py-2">ترتيب الجولة</th>
                  <th className="px-2 py-2">الترتيب العالمي</th>
                  <th className="px-2 py-2">قيمة الفريق</th>
                  <th className="px-2 py-2">البنك</th>
                  <th className="px-2 py-2">انتقالات</th>
                  <th className="px-2 py-2">نقاط الاحتياط</th>
                </tr>
              </thead>
              <tbody>
                {current.map((row) => (
                  <tr key={row.event} className="border-t border-white/5">
                    <td className="px-2 py-2">{row.event}</td>
                    <td className="px-2 py-2 font-black text-emerald-300">
                      {row.points}
                    </td>
                    <td className="px-2 py-2">{row.total_points}</td>
                    <td className="px-2 py-2">
                      {row.rank?.toLocaleString("en-US") ?? "—"}
                    </td>
                    <td className="px-2 py-2">
                      {row.overall_rank?.toLocaleString("en-US") ?? "—"}
                    </td>
                    <td className="px-2 py-2 text-cyan-200">£{money(row.value)}</td>
                    <td className="px-2 py-2">£{money(row.bank)}</td>
                    <td className="px-2 py-2">
                      {row.event_transfers}
                      {row.event_transfers_cost ? (
                        <span className="text-rose-300">
                          {" "}
                          (-{row.event_transfers_cost})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-2 py-2">{row.points_on_bench}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.history.past.length ? (
            <div className="card p-4">
              <h3 className="mb-2 text-sm font-bold text-white">المواسم السابقة</h3>
              <div className="grid gap-2 sm:grid-cols-3">
                {data.history.past.map((s) => (
                  <div key={s.season_name} className="rounded-xl bg-white/5 p-3">
                    <p className="font-bold text-white">{s.season_name}</p>
                    <p className="text-xs text-slate-300">
                      {s.total_points} نقطة · ترتيب{" "}
                      {s.rank.toLocaleString("en-US")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
