import Link from "next/link";
import { db } from "@/db";
import { players, teams as teamsTable } from "@/db/schema";
import { Panel } from "@/components/ui";
import { money, teamBadge } from "@/lib/format";
import { listTeams } from "@/lib/queries";
import { ensureData } from "@/lib/sync";
import { desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  await ensureData();

  const [teams, aggregates, bestPlayers] = await Promise.all([
    listTeams(),
    db
      .select({
        teamId: players.teamId,
        totalPoints: sql<number>`coalesce(sum(${players.totalPoints}),0)::int`,
        goals: sql<number>`coalesce(sum(${players.goalsScored}),0)::int`,
        cleanSheets: sql<number>`coalesce(max(${players.cleanSheets}),0)::int`,
        squadValue: sql<number>`coalesce(sum(${players.nowCost}),0)::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(players)
      .groupBy(players.teamId),
    db
      .select({
        teamId: players.teamId,
        id: players.id,
        webName: players.webName,
        totalPoints: players.totalPoints,
        rank: sql<number>`row_number() over (partition by ${players.teamId} order by ${players.totalPoints} desc)`,
      })
      .from(players)
      .orderBy(desc(players.totalPoints)),
  ]);

  const aggMap = new Map(aggregates.map((a) => [a.teamId, a]));
  const bestMap = new Map<number, { id: number; webName: string; totalPoints: number | null }>();
  for (const row of bestPlayers) {
    if (!bestMap.has(row.teamId)) {
      bestMap.set(row.teamId, {
        id: row.id,
        webName: row.webName,
        totalPoints: row.totalPoints,
      });
    }
  }

  const sorted = [...teams].sort(
    (a, b) =>
      (aggMap.get(b.id)?.totalPoints ?? 0) - (aggMap.get(a.id)?.totalPoints ?? 0),
  );

  const topTeam = sorted[0];
  const topTeamPlayers = topTeam
    ? await db
        .select()
        .from(players)
        .where(eq(players.teamId, topTeam.id))
        .orderBy(desc(players.totalPoints))
        .limit(5)
    : [];

  const strengthCell = (value: number | null) => {
    const v = value ?? 0;
    const tone =
      v >= 1250 || v >= 5
        ? "text-rose-300"
        : v >= 1100 || v >= 4
          ? "text-amber-300"
          : "text-emerald-300";
    return <span className={`font-bold ${tone}`}>{v}</span>;
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black text-white">أندية الدوري الإنجليزي</h1>
        <p className="text-sm text-slate-300">
          قوة كل نادٍ هجومياً ودفاعياً (داخل وخارج أرضه) حسب تقييم اللعبة
          الرسمي، مع مجموع نقاط لاعبي كل فريق في الفانتازي.
        </p>
      </header>

      <Panel title="ترتيب الأندية حسب نقاط الفانتازي" subtitle={`${teams.length} نادياً`}>
        <div className="overflow-x-auto">
          <table className="fpl w-full min-w-[860px] text-right text-sm">
            <thead className="text-[11px] text-slate-300">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">النادي</th>
                <th className="px-2 py-2">نقاط الفانتازي</th>
                <th className="px-2 py-2">الأهداف</th>
                <th className="px-2 py-2">قوة عامة (أرض/خارج)</th>
                <th className="px-2 py-2">هجوم (أرض/خارج)</th>
                <th className="px-2 py-2">دفاع (أرض/خارج)</th>
                <th className="px-2 py-2">أفضل لاعب</th>
                <th className="px-2 py-2">قيمة القائمة</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((team, index) => {
                const agg = aggMap.get(team.id);
                const best = bestMap.get(team.id);
                return (
                  <tr key={team.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-3 py-2 text-slate-400">{index + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/players?team=${team.id}`}
                        className="flex items-center gap-2 font-bold text-white"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={teamBadge(team.code)} alt="" className="h-6 w-6" />
                        {team.name}
                        <span className="text-[10px] text-slate-400">
                          {team.shortName}
                        </span>
                      </Link>
                    </td>
                    <td className="px-2 py-2 font-black text-emerald-300">
                      {agg?.totalPoints ?? 0}
                    </td>
                    <td className="px-2 py-2">{agg?.goals ?? 0}</td>
                    <td className="px-2 py-2">
                      {strengthCell(team.strengthOverallHome)} /{" "}
                      {strengthCell(team.strengthOverallAway)}
                    </td>
                    <td className="px-2 py-2">
                      {strengthCell(team.strengthAttackHome)} /{" "}
                      {strengthCell(team.strengthAttackAway)}
                    </td>
                    <td className="px-2 py-2">
                      {strengthCell(team.strengthDefenceHome)} /{" "}
                      {strengthCell(team.strengthDefenceAway)}
                    </td>
                    <td className="px-2 py-2">
                      {best ? (
                        <Link
                          href={`/players/${best.id}`}
                          className="text-cyan-200 hover:underline"
                        >
                          {best.webName} ({best.totalPoints})
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-2 py-2 text-slate-300">
                      £{money(agg?.squadValue ?? 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {topTeam ? (
        <Panel
          title={`أبرز لاعبي ${topTeam.name}`}
          subtitle="النادي الأعلى مساهمة في نقاط الفانتازي"
        >
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {topTeamPlayers.map((p) => (
              <Link
                key={p.id}
                href={`/players/${p.id}`}
                className="rounded-xl bg-white/5 p-3 text-center transition hover:bg-white/10"
              >
                <p className="truncate font-bold text-white">{p.webName}</p>
                <p className="text-xs text-emerald-300">{p.totalPoints} نقطة</p>
                <p className="text-[11px] text-slate-400">£{money(p.nowCost)}</p>
              </Link>
            ))}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
