import {
  listProjectFiles,
  originFrom,
  readProjectFile,
} from "@/lib/flutter-package";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("path");
  const download = searchParams.get("download") === "1";
  const baseUrl = originFrom(request);

  if (!file) {
    const files = await listProjectFiles();
    return Response.json({ ok: true, count: files.length, files });
  }

  try {
    const content = await readProjectFile(file, baseUrl);
    const name = file.split("/").pop() ?? "main.dart";
    return new Response(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        ...(download
          ? { "Content-Disposition": `attachment; filename="${name}"` }
          : {}),
      },
    });
  } catch {
    return Response.json(
      { ok: false, message: "الملف غير موجود" },
      { status: 404 },
    );
  }
}
