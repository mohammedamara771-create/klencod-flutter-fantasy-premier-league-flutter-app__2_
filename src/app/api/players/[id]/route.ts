import { getElementSummary } from "@/lib/fpl";
import { getPlayer } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const playerId = Number.parseInt(id, 10);
  if (!Number.isFinite(playerId)) {
    return Response.json({ ok: false, message: "معرّف غير صالح" }, { status: 400 });
  }

  const player = await getPlayer(playerId);
  if (!player) {
    return Response.json({ ok: false, message: "اللاعب غير موجود" }, { status: 404 });
  }

  let summary = null;
  try {
    summary = await getElementSummary(playerId);
  } catch {
    summary = null;
  }

  return Response.json({ ok: true, player, summary });
}
