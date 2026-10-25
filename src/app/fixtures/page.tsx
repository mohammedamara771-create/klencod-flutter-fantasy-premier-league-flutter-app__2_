import Link from "next/link";
import { Panel } from "@/components/ui";
import { fdrColor, formatDate, teamBadge } from "@/lib/format";
import {
  getCurrentEvent,
  listEvents,
  listFixtures,
  listTeams,
  upcomingFixturesByTeam,
} from "@/lib/queries";
import { ensureData } from "@/lib/sync";

export const dynamic = "force-dynamic";

export default async function FixturesPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  await ensureData();
  const { event } = await searchParams;
  const [events, teams, gw] = await Promise.all([
    listEvents(),
    listTeams(),
    getCurrentEvent(),
  ]);
  const activeEvent =
    Number.parseInt(event ?? "", 10) || gw.next?.id || gw.current?.id || 1;

  const [fixtures, fdrMap] = await Promise.all([
    listFixtures(activeEvent),
    upcomingFixturesByTeam(activeEvent, 5),
  ]);
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black text-white">جدول المباريات و FDR</h1>
        <p className="text-sm text-slate-300">
          اختر الجولة لعرض المباريات ودرجة صعوبة المواجهات، مع مصفوفة الجولات
          الخمس القادمة لكل نادٍ للتخطيط للانتقالات.
        </p>
      </header>

      <div className="card flex flex-wrap gap-1.5 p-3">
        {events.map((e) => (
          <Link
            key={e.id}
            href={`/fixtures?event=${e.id}`}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
              e.id === activeEvent
                ? "bg-[#00ff87] text-[#37003c]"
                : e.finished
                  ? "bg-white/5 text-slate-400 hover:bg-white/10"
                  : "bg-white/10 text-slate-100 hover:bg-white/20"
            }`}
          >
            {e.id}
          </Link>
        ))}
      </div>

      <Panel
        title={events.find((e) => e.id === activeEvent)?.name ?? "الجولة"}
        subtitle={`الموعد النهائي: ${formatDate(
          events.find((e) => e.id === activeEvent)?.deadlineTime ?? null,
        )}`}
      >
        <div className="grid gap-2 md:grid-cols-2">
          {fixtures.map((f) => {
            const home = teamMap.get(f.teamH);
            const away = teamMap.get(f.teamA);
            return (
              <div
                key={f.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3"
              >
                <div className="flex flex-1 items-center justify-end gap-2">
                  <span className="font-bold text-white">{home?.name}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={teamBadge(home?.code ?? 0)} alt="" className="h-6 w-6" />
                  <span
                    className={`rounded px-1.5 text-[10px] font-bold ${fdrColor(f.teamHDifficulty ?? 3)}`}
                  >
                    {f.teamHDifficulty}
                  </span>
                </div>
                <div className="min-w-24 text-center">
                  {f.finished || f.started ? (
                    <p className="text-lg font-black text-emerald-300">
                      {f.teamHScore ?? 0} - {f.teamAScore ?? 0}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-300">
                      {formatDate(f.kickoffTime)}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500">
                    {f.finished ? "انتهت" : f.started ? "جارية" : "لم تبدأ"}
                  </p>
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <span
                    className={`rounded px-1.5 text-[10px] font-bold ${fdrColor(f.teamADifficulty ?? 3)}`}
                  >
                    {f.teamADifficulty}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={teamBadge(away?.code ?? 0)} alt="" className="h-6 w-6" />
                  <span className="font-bold text-white">{away?.name}</span>
                </div>
              </div>
            );
          })}
          {fixtures.length === 0 ? (
            <p className="text-sm text-slate-400">لا توجد مباريات في هذه الجولة.</p>
          ) : null}
        </div>
      </Panel>

      <Panel
        title="مصفوفة صعوبة المباريات القادمة"
        subtitle="أخضر = مواجهة سهلة · أحمر = مواجهة صعبة"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead className="text-[11px] text-slate-300">
              <tr>
                <th className="px-3 py-2">النادي</th>
                {[1, 2, 3, 4, 5].map((i) => (
                  <th key={i} className="px-2 py-2">
                    المباراة {i}
                  </th>
                ))}
                <th className="px-2 py-2">متوسط الصعوبة</th>
              </tr>
            </thead>
            <tbody>
              {teams
                .map((t) => {
                  const list = fdrMap.get(t.id) ?? [];
                  const avg = list.length
                    ? list.reduce((sum, f) => sum + f.difficulty, 0) / list.length
                    : 5;
                  return { team: t, list, avg };
                })
                .sort((a, b) => a.avg - b.avg)
                .map(({ team, list, avg }) => (
                  <tr key={team.id} className="border-t border-white/5">
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-2 font-semibold text-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={teamBadge(team.code)} alt="" className="h-5 w-5" />
                        {team.name}
                      </span>
                    </td>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const fixture = list[i];
                      if (!fixture)
                        return (
                          <td key={i} className="px-2 py-2 text-slate-600">
                            —
                          </td>
                        );
                      const opp = teamMap.get(fixture.opponent);
                      return (
                        <td key={i} className="px-2 py-2">
                          <span
                            className={`block rounded px-2 py-1 text-center text-[11px] font-bold ${fdrColor(fixture.difficulty)}`}
                          >
                            {opp?.shortName}
                            {fixture.home ? " (أ)" : " (خ)"}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 font-bold text-cyan-200">
                      {avg.toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
