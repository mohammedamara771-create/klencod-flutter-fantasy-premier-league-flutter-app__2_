import Link from "next/link";
import SyncButton from "@/components/sync-button";
import { Panel, PlayerRowItem, StatCard } from "@/components/ui";
import { fdrColor, formatDate, money, num } from "@/lib/format";
import {
  getCurrentEvent,
  listFixtures,
  listTeams,
  overviewStats,
} from "@/lib/queries";
import { ensureData, getLastSync } from "@/lib/sync";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureData();
  const [stats, gw, teams, lastSync] = await Promise.all([
    overviewStats(),
    getCurrentEvent(),
    listTeams(),
    getLastSync(),
  ]);

  const nextEvent = gw.next ?? gw.current;
  const nextFixtures = nextEvent ? await listFixtures(nextEvent.id) : [];
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  return (
    <div className="space-y-6">
      <section className="card glow overflow-hidden p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-emerald-300">
              Fantasy Premier League • بيانات رسمية مباشرة
            </p>
            <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">
              مركز إحصائيات الفانتازي
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              كل ما تحتاجه لإدارة فريقك: إحصائيات {stats.totals?.playersCount ?? 0}{" "}
              لاعب، صعوبة المباريات، أسعار اللاعبين، النقاط المتوقعة، بناء
              التشكيلة، ومتابعة حسابك الرسمي في اللعبة.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <SyncButton
              lastSync={lastSync?.syncedAt ? String(lastSync.syncedAt) : null}
            />
            <Link
              href="/flutter"
              className="rounded-xl border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-300/20"
            >
              📱 حمّل تطبيق Flutter لـ KlenCode IDE
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="الجولة الحالية"
            value={gw.current?.name ?? "—"}
            hint={`متوسط النقاط: ${gw.current?.averageEntryScore ?? 0}`}
          />
          <StatCard
            title="الجولة القادمة"
            value={nextEvent?.name ?? "—"}
            hint={`الموعد النهائي: ${formatDate(nextEvent?.deadlineTime ?? null)}`}
            accent="cyan"
          />
          <StatCard
            title="إجمالي الأهداف المسجلة"
            value={stats.totals?.goals ?? 0}
            hint={`صناعة: ${stats.totals?.assists ?? 0}`}
            accent="amber"
          />
          <StatCard
            title="متوسط سعر اللاعب"
            value={`£${money(Math.round(stats.totals?.avgCost ?? 0))}`}
            hint="بالملايين"
            accent="rose"
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="الأعلى نقاطاً"
          subtitle="إجمالي نقاط الموسم"
          action={
            <Link href="/players?sort=totalPoints" className="text-xs text-emerald-300">
              الكل ←
            </Link>
          }
        >
          <div className="space-y-1">
            {stats.topPoints.map((p, i) => (
              <PlayerRowItem
                key={p.id}
                player={p}
                rank={i + 1}
                metric={p.totalPoints ?? 0}
                metricLabel="نقطة"
              />
            ))}
          </div>
        </Panel>

        <Panel title="الأفضل في الفورمة" subtitle="معدل آخر 30 يوماً">
          <div className="space-y-1">
            {stats.topForm.map((p, i) => (
              <PlayerRowItem
                key={p.id}
                player={p}
                rank={i + 1}
                metric={num(p.form)}
                metricLabel="فورمة"
              />
            ))}
          </div>
        </Panel>

        <Panel title="أفضل قيمة مقابل السعر" subtitle="نقاط لكل مليون">
          <div className="space-y-1">
            {stats.topValue.map((p, i) => (
              <PlayerRowItem
                key={p.id}
                player={p}
                rank={i + 1}
                metric={num(p.valueSeason)}
                metricLabel="نقطة/مليون"
              />
            ))}
          </div>
        </Panel>

        <Panel title="الأكثر اختياراً" subtitle="نسبة الملكية بين المدراء">
          <div className="space-y-1">
            {stats.mostOwned.map((p, i) => (
              <PlayerRowItem
                key={p.id}
                player={p}
                rank={i + 1}
                metric={`${num(p.selectedByPercent)}%`}
                metricLabel="ملكية"
              />
            ))}
          </div>
        </Panel>

        <Panel title="أعلى xGI متوقع" subtitle="أهداف + صناعة متوقعة">
          <div className="space-y-1">
            {stats.topXgi.map((p, i) => (
              <PlayerRowItem
                key={p.id}
                player={p}
                rank={i + 1}
                metric={num(p.expectedGoalInvolvements, 2)}
                metricLabel="xGI"
              />
            ))}
          </div>
        </Panel>

        <Panel title="أوراق مميزة (Differentials)" subtitle="ملكية أقل من 7% وفورمة جيدة">
          <div className="space-y-1">
            {stats.differentials.length === 0 ? (
              <p className="p-3 text-xs text-slate-400">لا توجد بيانات كافية بعد.</p>
            ) : (
              stats.differentials.map((p, i) => (
                <PlayerRowItem
                  key={p.id}
                  player={p}
                  rank={i + 1}
                  metric={num(p.form)}
                  metricLabel={`${num(p.selectedByPercent)}% ملكية`}
                />
              ))
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="ارتفاع الأسعار 📈" subtitle="التغير منذ بداية الموسم">
          <div className="space-y-1">
            {stats.risers.map((p) => (
              <PlayerRowItem
                key={p.id}
                player={p}
                metric={`+£${money(p.costChangeStart ?? 0)}`}
                metricLabel={`£${money(p.nowCost)} الآن`}
              />
            ))}
          </div>
        </Panel>
        <Panel title="انخفاض الأسعار 📉" subtitle="تحذير قبل بيع اللاعب">
          <div className="space-y-1">
            {stats.fallers.map((p) => (
              <PlayerRowItem
                key={p.id}
                player={p}
                metric={`£${money(p.costChangeStart ?? 0)}`}
                metricLabel={`£${money(p.nowCost)} الآن`}
              />
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        title={`مباريات ${nextEvent?.name ?? "الجولة القادمة"}`}
        subtitle="مع درجة صعوبة المواجهة (FDR)"
        action={
          <Link href="/fixtures" className="text-xs text-emerald-300">
            جدول كامل ←
          </Link>
        }
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {nextFixtures.map((f) => {
            const home = teamMap.get(f.teamH);
            const away = teamMap.get(f.teamA);
            return (
              <div
                key={f.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 text-[10px] font-bold ${fdrColor(f.teamHDifficulty ?? 3)}`}
                  >
                    {f.teamHDifficulty}
                  </span>
                  <span className="font-semibold text-white">
                    {home?.shortName ?? "?"}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {f.finished
                    ? `${f.teamHScore} - ${f.teamAScore}`
                    : formatDate(f.kickoffTime)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">
                    {away?.shortName ?? "?"}
                  </span>
                  <span
                    className={`rounded px-1.5 text-[10px] font-bold ${fdrColor(f.teamADifficulty ?? 3)}`}
                  >
                    {f.teamADifficulty}
                  </span>
                </div>
              </div>
            );
          })}
          {nextFixtures.length === 0 ? (
            <p className="text-xs text-slate-400">لا توجد مباريات مجدولة.</p>
          ) : null}
        </div>
      </Panel>

      <Panel title="إصابات وشكوك تهم الفانتازي" subtitle="لاعبون بملكية عالية وحالتهم غير جاهزة">
        <div className="space-y-2">
          {stats.injuries.length === 0 ? (
            <p className="text-xs text-slate-400">لا توجد تحذيرات حالياً.</p>
          ) : (
            stats.injuries.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-white">
                    {p.webName}{" "}
                    <span className="text-xs text-slate-400">({p.teamShort})</span>
                  </span>
                  <span className="text-xs text-rose-300">
                    {num(p.selectedByPercent)}% ملكية
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300">
                  {p.news || "حالة غير مؤكدة"}
                </p>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
