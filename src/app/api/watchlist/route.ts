import { db } from "@/db";
import { watchlist } from "@/db/schema";
import { getWatchlist } from "@/lib/queries";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await getWatchlist();
  return Response.json({ ok: true, count: items.length, items });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    playerId?: number;
    note?: string;
  };
  if (!body.playerId) {
    return Response.json({ ok: false, message: "playerId مطلوب" }, { status: 400 });
  }
  await db
    .insert(watchlist)
    .values({ playerId: body.playerId, note: body.note ?? "" })
    .onConflictDoNothing();
  const items = await getWatchlist();
  return Response.json({ ok: true, count: items.length, items });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerId = Number.parseInt(searchParams.get("playerId") ?? "", 10);
  if (!Number.isFinite(playerId)) {
    return Response.json({ ok: false, message: "playerId مطلوب" }, { status: 400 });
  }
  await db.delete(watchlist).where(eq(watchlist.playerId, playerId));
  const items = await getWatchlist();
  return Response.json({ ok: true, count: items.length, items });
}
