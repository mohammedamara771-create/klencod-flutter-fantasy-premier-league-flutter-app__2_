import { db } from "@/db";
import { squadPicks } from "@/db/schema";
import { getPlayer, getSquadWithPlayers } from "@/lib/queries";
import { summarizeSquad, validateAddition } from "@/lib/squad";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function payload() {
  const { squad, picks } = await getSquadWithPlayers();
  const summary = summarizeSquad(picks.map((p) => p.player));
  return { ok: true, squad, picks, summary };
}

export async function GET() {
  return Response.json(await payload());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    playerId?: number;
    action?: "add" | "clear" | "captain" | "vice";
  };
  const { squad, picks } = await getSquadWithPlayers();
  const action = body.action ?? "add";

  if (action === "clear") {
    await db.delete(squadPicks).where(eq(squadPicks.squadId, squad.id));
    return Response.json(await payload());
  }

  if (!body.playerId) {
    return Response.json({ ok: false, message: "playerId مطلوب" }, { status: 400 });
  }

  const player = await getPlayer(body.playerId);
  if (!player) {
    return Response.json({ ok: false, message: "اللاعب غير موجود" }, { status: 404 });
  }

  if (action === "captain" || action === "vice") {
    const inSquad = picks.some((p) => p.playerId === player.id);
    if (!inSquad)
      return Response.json(
        { ok: false, message: "اختر لاعباً من تشكيلتك" },
        { status: 400 },
      );
    const column = action === "captain" ? "isCaptain" : "isViceCaptain";
    await db
      .update(squadPicks)
      .set({ [column]: false })
      .where(eq(squadPicks.squadId, squad.id));
    await db
      .update(squadPicks)
      .set({ [column]: true })
      .where(
        and(eq(squadPicks.squadId, squad.id), eq(squadPicks.playerId, player.id)),
      );
    return Response.json(await payload());
  }

  const validation = validateAddition(
    picks.map((p) => p.player),
    player,
  );
  if (!validation.ok) {
    return Response.json({ ok: false, message: validation.message }, { status: 400 });
  }

  await db
    .insert(squadPicks)
    .values({
      squadId: squad.id,
      playerId: player.id,
      purchasePrice: player.nowCost,
    })
    .onConflictDoNothing();

  return Response.json(await payload());
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerId = Number.parseInt(searchParams.get("playerId") ?? "", 10);
  if (!Number.isFinite(playerId)) {
    return Response.json({ ok: false, message: "playerId مطلوب" }, { status: 400 });
  }
  const { squad } = await getSquadWithPlayers();
  await db
    .delete(squadPicks)
    .where(and(eq(squadPicks.squadId, squad.id), eq(squadPicks.playerId, playerId)));
  return Response.json(await payload());
}
