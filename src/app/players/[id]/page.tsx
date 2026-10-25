import Link from "next/link";
import { notFound } from "next/navigation";
import { Panel, PositionTag, StatCard } from "@/components/ui";
import { getElementSummary } from "@/lib/fpl";
import {
  POSITIONS,
  STATUS_LABELS,
  fdrColor,
  formatDate,
  money,
  num,
  playerPhoto,
  teamBadge,
} from "@/lib/format";
import { getPlayer, listTeams } from "@/lib/queries";
import { ensureData } from "@/lib/sync";

export const dynamic = "force-dynamic";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playerId = Number.parseInt(id, 10);
  if (!Number.isFinite(playerId)) notFound();

  await ensureData();
  const player = await getPlayer(playerId);
  if (!player) notFound();

  const teams = await listTeams();
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const summary = await getElementSummary(playerId).catch(() => null);
  const status = STATUS_LABELS[player.status] ?? STATUS_LABELS.a;

  return (
    <div className="space-y-5">
      <Link href="/players" className="text-xs text-emerald-300">
        → العودة لقائمة اللاعبين
      </Link>

      <section className="card flex flex-wrap items-center gap-5 p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={playerPhoto(player.code)}
          alt={player.webName}
          className="h-28 w-24 rounded-xl bg-white/10 object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={teamBadge(player.teamCode)} alt="" className="h-6 w-6" />
            <h1 className="text-2xl font-black text-white">
              {player.firstName} {player.secondName}
            </h1>
            <PositionTag type={player.elementType} />
          </div>
          <p className="mt-1 text-sm text-slate-300">
            {player.teamName} · {POSITIONS[player.elementType]?.ar} ·{" "}
            <span className={`rounded px-1.5 py-0.5 text-xs ${status.color}`}>
              {status.ar}
            </span>
          </p>
          {player.news ? (
            <p className="mt-2 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
              {player.news}
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatCard title="السعر" value={`£${money(player.nowCost)}`} />
          <StatCard title="النقاط" value={player.totalPoints ?? 0} accent="cyan" />
          <StatCard title="الفورمة" value={num(player.form)} accent="amber" />
          <StatCard
            title="الملكية"
            value={`${num(player.selectedByPercent)}%`}
            accent="rose"
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="إحصائيات الموسم" subtitle="أرقام تفصيلية من الواجهة الرسمية">
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["الدقائق", player.minutes],
              ["المشاركات أساسياً", player.starts],
              ["الأهداف", player.goalsScored],
              ["الصناعة", player.assists],
              ["الشباك النظيفة", player.cleanSheets],
              ["أهداف مستقبلة", player.goalsConceded],
              ["التصديات", player.saves],
              ["ركلات جزاء مصدودة", player.penaltiesSaved],
              ["نقاط البونص", player.bonus],
              ["BPS", player.bps],
              ["بطاقات صفراء", player.yellowCards],
              ["بطاقات حمراء", player.redCards],
              ["مساهمة دفاعية", player.defensiveContribution],
              ["تشكيلة الأحلام", player.dreamteamCount],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
              >
                <dt className="text-xs text-slate-300">{label}</dt>
                <dd className="font-bold text-white">{String(value ?? 0)}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="المؤشرات المتقدمة" subtitle="xG · xA · ICT">
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["xG أهداف متوقعة", num(player.expectedGoals, 2)],
              ["xA صناعة متوقعة", num(player.expectedAssists, 2)],
              ["xGI مساهمة متوقعة", num(player.expectedGoalInvolvements, 2)],
              ["xGC أهداف مستقبلة متوقعة", num(player.expectedGoalsConceded, 2)],
              ["التأثير Influence", num(player.influence)],
              ["الإبداع Creativity", num(player.creativity)],
              ["التهديد Threat", num(player.threat)],
              ["مؤشر ICT", num(player.ictIndex)],
              ["نقاط/مباراة", num(player.pointsPerGame)],
              ["النقاط المتوقعة للجولة", num(player.epNext)],
              ["القيمة (نقطة/مليون)", num(player.valueSeason)],
              ["تغير السعر", `£${money(player.costChangeStart ?? 0)}`],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
              >
                <dt className="text-xs text-slate-300">{label}</dt>
                <dd className="font-bold text-cyan-200">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="المباريات القادمة" subtitle="درجة الصعوبة FDR">
          <div className="space-y-2">
            {(summary?.fixtures ?? []).slice(0, 8).map((f) => {
              const opponent = teamMap.get(f.is_home ? f.team_a : f.team_h);
              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
                >
                  <span className="text-xs text-slate-400">
                    {f.event_name ?? "—"}
                  </span>
                  <span className="font-semibold text-white">
                    {opponent?.shortName ?? "?"}{" "}
                    <span className="text-[10px] text-slate-400">
                      {f.is_home ? "(أرض)" : "(خارج)"}
                    </span>
                  </span>
                  <span
                    className={`rounded px-2 text-[11px] font-bold ${fdrColor(f.difficulty)}`}
                  >
                    {f.difficulty}
                  </span>
                </div>
              );
            })}
            {!summary?.fixtures?.length ? (
              <p className="text-xs text-slate-400">لا تتوفر مباريات قادمة.</p>
            ) : null}
          </div>
        </Panel>
      </div>

      <Panel title="سجل الجولات" subtitle="أداء اللاعب جولة بجولة هذا الموسم">
        <div className="overflow-x-auto">
          <table className="fpl w-full min-w-[820px] text-right text-sm">
            <thead className="text-[11px] text-slate-300">
              <tr>
                <th className="px-2 py-2">الجولة</th>
                <th className="px-2 py-2">المنافس</th>
                <th className="px-2 py-2">النتيجة</th>
                <th className="px-2 py-2">النقاط</th>
                <th className="px-2 py-2">دقائق</th>
                <th className="px-2 py-2">أهداف</th>
                <th className="px-2 py-2">صناعة</th>
                <th className="px-2 py-2">بونص</th>
                <th className="px-2 py-2">BPS</th>
                <th className="px-2 py-2">xG</th>
                <th className="px-2 py-2">السعر</th>
              </tr>
            </thead>
            <tbody>
              {(summary?.history ?? [])
                .slice()
                .reverse()
                .map((h) => (
                  <tr key={`${h.fixture}-${h.round}`} className="border-t border-white/5">
                    <td className="px-2 py-2">{h.round}</td>
                    <td className="px-2 py-2">
                      {teamMap.get(h.opponent_team)?.shortName ?? "?"}{" "}
                      <span className="text-[10px] text-slate-400">
                        {h.was_home ? "(أ)" : "(خ)"}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-slate-300">
                      {h.team_h_score ?? "-"} - {h.team_a_score ?? "-"}
                    </td>
                    <td className="px-2 py-2 font-black text-emerald-300">
                      {h.total_points}
                    </td>
                    <td className="px-2 py-2">{h.minutes}</td>
                    <td className="px-2 py-2">{h.goals_scored}</td>
                    <td className="px-2 py-2">{h.assists}</td>
                    <td className="px-2 py-2">{h.bonus}</td>
                    <td className="px-2 py-2">{h.bps}</td>
                    <td className="px-2 py-2">{h.expected_goals}</td>
                    <td className="px-2 py-2 text-cyan-200">£{money(h.value)}</td>
                  </tr>
                ))}
              {!summary?.history?.length ? (
                <tr>
                  <td colSpan={11} className="px-2 py-6 text-center text-slate-400">
                    لا توجد مباريات مسجلة بعد لهذا اللاعب.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>

      {summary?.history_past?.length ? (
        <Panel title="المواسم السابقة" subtitle="سجل اللاعب التاريخي في اللعبة">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {summary.history_past.map((s) => (
              <div key={s.season_name} className="rounded-xl bg-white/5 p-3 text-sm">
                <p className="font-bold text-white">{s.season_name}</p>
                <p className="text-xs text-slate-300">
                  {s.total_points} نقطة · {s.goals_scored} هدف · {s.assists} صناعة
                </p>
                <p className="text-[11px] text-slate-400">
                  السعر: £{money(s.start_cost)} ← £{money(s.end_cost)} · آخر تحديث{" "}
                  {formatDate(new Date())}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
