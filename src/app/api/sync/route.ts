import { getLastSync, syncFplData } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await syncFplData();
    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "تعذرت المزامنة مع FPL",
      },
      { status: 502 },
    );
  }
}

export async function GET() {
  const last = await getLastSync();
  return Response.json({ ok: true, lastSync: last });
}
