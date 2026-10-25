import PlayersExplorer from "@/components/players-explorer";
import { listTeams } from "@/lib/queries";
import { ensureData } from "@/lib/sync";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  await ensureData();
  const teams = await listTeams();
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-black text-white">قاعدة بيانات اللاعبين</h1>
        <p className="text-sm text-slate-300">
          فلترة وترتيب كامل لإحصائيات لاعبي الدوري الإنجليزي الممتاز: النقاط،
          الفورمة، الأسعار، xG/xA، مؤشر ICT، والمساهمة الدفاعية.
        </p>
      </header>
      <PlayersExplorer
        teams={teams.map((t) => ({
          id: t.id,
          name: t.name,
          shortName: t.shortName,
        }))}
      />
    </div>
  );
}
