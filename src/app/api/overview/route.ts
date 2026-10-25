import { getCurrentEvent, overviewStats } from "@/lib/queries";
import { ensureData, getLastSync } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureData();
  const [stats, gw, lastSync] = await Promise.all([
    overviewStats(),
    getCurrentEvent(),
    getLastSync(),
  ]);
  return Response.json({ ok: true, gameweek: gw, lastSync, ...stats });
}
