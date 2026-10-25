import FlutterDownload from "@/components/flutter-download";
import { listProjectFiles } from "@/lib/flutter-package";

export const dynamic = "force-dynamic";

export default async function FlutterPage() {
  const files = await listProjectFiles().catch(() => [] as string[]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black text-white">
          تنزيل تطبيق Flutter ووضعه في KlenCode IDE
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          نعم — هذه حزمة تطبيق Flutter جاهزة (Dart) تعمل على أندرويد. حمّلها من
          هنا وافتحها في KlenCode IDE، وسيتصل التطبيق تلقائياً بخادم هذا الموقع
          الذي يجلب بيانات فانتازي الدوري الإنجليزي من الواجهة الرسمية.
        </p>
      </header>
      <FlutterDownload files={files} />
    </div>
  );
}
