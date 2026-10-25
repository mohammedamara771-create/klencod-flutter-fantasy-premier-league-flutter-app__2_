"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function SyncButton({ lastSync }: { lastSync?: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sync = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = (await res.json()) as {
        ok: boolean;
        players?: number;
        message?: string;
      };
      setMessage(
        data.ok
          ? `✅ تم تحديث ${data.players} لاعباً من الواجهة الرسمية`
          : `⚠️ ${data.message ?? "فشل التحديث"}`,
      );
      if (data.ok) startTransition(() => router.refresh());
    } catch {
      setMessage("⚠️ تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={sync}
        disabled={loading}
        className="rounded-xl bg-gradient-to-l from-[#00ff87] to-[#04f5ff] px-4 py-2 text-sm font-bold text-[#37003c] transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "جارٍ التحديث…" : "⟳ تحديث البيانات"}
      </button>
      <p className="text-[10px] text-slate-400">
        {message ??
          (lastSync
            ? `آخر مزامنة: ${new Intl.DateTimeFormat("ar-EG", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(new Date(lastSync))}`
            : "لم تتم المزامنة بعد")}
      </p>
    </div>
  );
}
