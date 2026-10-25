import { listPlayers, type SortKey } from "@/lib/queries";
import { ensureData } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureData();
  const { searchParams } = new URL(request.url);
  const int = (key: string) => {
    const raw = searchParams.get(key);
    if (!raw) return undefined;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const { rows, total } = await listPlayers({
    search: searchParams.get("search") ?? undefined,
    position: int("position"),
    teamId: int("team"),
    maxCost: int("maxCost"),
    minCost: int("minCost"),
    minMinutes: int("minMinutes"),
    availableOnly: searchParams.get("available") === "1",
    sort: (searchParams.get("sort") as SortKey | null) ?? undefined,
    dir: searchParams.get("dir") === "asc" ? "asc" : "desc",
    limit: Math.min(int("limit") ?? 50, 300),
    offset: int("offset") ?? 0,
  });

  return Response.json({ ok: true, total, count: rows.length, players: rows });
}
