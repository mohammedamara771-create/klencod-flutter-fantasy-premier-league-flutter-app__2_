import JSZip from "jszip";
import {
  listProjectFiles,
  originFrom,
  readProjectFile,
} from "@/lib/flutter-package";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const baseUrl = originFrom(request);
    const { searchParams } = new URL(request.url);
    // الوضع الافتراضي: الملفات في الجذر مباشرة (مطلوب لـ GitHub Actions / KlenCode)
    const nested = searchParams.get("nested") === "1";

    const files = await listProjectFiles();
    const zip = new JSZip();
    const root = nested ? zip.folder("fpl_stats")! : zip;

    for (const file of files) {
      root.file(file, await readProjectFile(file, baseUrl));
    }

    const buffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition":
          'attachment; filename="fpl_stats_flutter_klencode.zip"',
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "تعذر إنشاء ملف المشروع",
      },
      { status: 500 },
    );
  }
}
