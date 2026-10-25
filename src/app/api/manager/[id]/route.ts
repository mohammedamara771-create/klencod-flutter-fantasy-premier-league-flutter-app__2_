import { getEntry, getEntryHistory } from "@/lib/fpl";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const entryId = Number.parseInt(id, 10);
  if (!Number.isFinite(entryId) || entryId <= 0) {
    return Response.json(
      { ok: false, message: "رقم المدير (Team ID) غير صالح" },
      { status: 400 },
    );
  }
  try {
    const [entry, history] = await Promise.all([
      getEntry(entryId),
      getEntryHistory(entryId),
    ]);
    return Response.json({ ok: true, entry, history });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "تعذر جلب بيانات المدير من الواجهة الرسمية",
      },
      { status: 404 },
    );
  }
}
