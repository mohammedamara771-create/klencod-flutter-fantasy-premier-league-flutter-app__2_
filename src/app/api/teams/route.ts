import { listTeams } from "@/lib/queries";
import { ensureData } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureData();
  const teams = await listTeams();
  return Response.json({ ok: true, count: teams.length, teams });
}
