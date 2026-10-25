import { listEvents, listFixtures } from "@/lib/queries";
import { ensureData } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureData();
  const { searchParams } = new URL(request.url);
  const eventParam = searchParams.get("event");
  const eventId = eventParam ? Number.parseInt(eventParam, 10) : undefined;
  const [fixtures, events] = await Promise.all([
    listFixtures(Number.isFinite(eventId as number) ? eventId : undefined),
    listEvents(),
  ]);
  return Response.json({ ok: true, count: fixtures.length, fixtures, events });
}
