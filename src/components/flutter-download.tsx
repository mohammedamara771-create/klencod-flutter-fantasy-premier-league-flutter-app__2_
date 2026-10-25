"use client";

import { useEffect, useState } from "react";

export default function FlutterDownload({ files }: { files: string[] }) {
  const [origin, setOrigin] = useState("");
  const [code, setCode] = useState("جارٍ تحميل الكود…");
  const [workflow, setWorkflow] = useState("جارٍ التحميل…");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/flutter/file?path=single_file/main.dart")
      .then((res) => res.text())
      .then(setCode)
      .catch(() => setCode("// تعذر تحميل الكود"));
    fetch("/api/flutter/file?path=.github/workflows/build-apk.yml")
      .then((res) => res.text())
      .then(setWorkflow)
      .catch(() => setWorkflow("# تعذر تحميل الملف"));
  }, []);

  const copyText = async (text: string, tag: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tag);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="card border-rose-400/30 bg-rose-400/5 p-5">
        <h2 className="text-lg font-black text-rose-200">
          ⚠️ خطأ: Expected to find project root in current working directory
        </h2>
        <p className="mt-2 text-sm text-slate-200">
          من سجل البناء عندك يتبيّن أمران: (١) ملف الـ workflow العامل هو
          <b> ملفك القديم</b> (خطواته بالإنجليزية: Setup Java 17 / Get
          dependencies)، و(٢) لا يوجد <b>pubspec.yaml</b> في جذر المستودع، لذلك
          يفشل الأمر <code dir="ltr">flutter pub get</code>.
        </p>

        <div className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3">
          <p className="text-sm font-bold text-emerald-200">
            ✅ الحل النهائي: ملف workflow ذاتي الإصلاح
          </p>
          <ul className="mt-2 space-y-1 text-xs text-emerald-100">
            <li>• يبحث عن pubspec.yaml في أي مجلد داخل المستودع ويعمل بداخله.</li>
            <li>
              • إن لم يجده إطلاقاً، فإنه <b>ينشئ مشروع Flutter كاملاً تلقائياً</b>{" "}
              من ملف main.dart الموجود عندك.
            </li>
            <li>• يعيد توليد مجلد android ليطابق إصدار Flutter على الرانر.</li>
            <li>• يضيف حزمة http وصلاحية الإنترنت تلقائياً، ثم يبني APK.</li>
          </ul>
        </div>

        <div className="mt-4 rounded-xl bg-black/30 p-3">
          <p className="text-sm font-bold text-white">خطوتان فقط:</p>
          <ol className="mt-2 space-y-2 text-sm text-slate-200">
            <li className="rounded-lg bg-white/5 p-2.5">
              <b>١)</b> في مستودعك: افتح مجلد{" "}
              <code dir="ltr">.github/workflows/</code> و<b>احذف ملف الـ
              workflow القديم</b> (أي ملف <code dir="ltr">.yml</code> موجود
              هناك) — وإلا سيستمر بالفشل بجانب الملف الجديد.
            </li>
            <li className="rounded-lg bg-white/5 p-2.5">
              <b>٢)</b> أضف الملف الجديد بالمسار الدقيق:{" "}
              <code dir="ltr" className="text-cyan-200">
                .github/workflows/build-apk.yml
              </code>{" "}
              (انسخه أو نزّله من القسم التالي) ثم Commit → تبويب Actions →
              شغّل «بناء تطبيق APK».
            </li>
          </ol>
        </div>
      </section>

      <section className="card border-cyan-300/30 p-5">
        <h2 className="text-lg font-black text-white">
          ⭐ ملف build-apk.yml (ذاتي الإصلاح)
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          ضعه في المسار <code dir="ltr">.github/workflows/build-apk.yml</code>.
          يعمل حتى لو كان المستودع يحتوي على <b>main.dart فقط</b>.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="/api/flutter/file?path=.github/workflows/build-apk.yml&download=1"
            className="rounded-xl bg-gradient-to-l from-[#04f5ff] to-[#00ff87] px-5 py-2.5 text-sm font-black text-[#37003c]"
          >
            ⬇️ تنزيل build-apk.yml
          </a>
          <button
            type="button"
            onClick={() => copyText(workflow, "yml")}
            className="rounded-xl border border-cyan-300/40 bg-cyan-300/10 px-5 py-2.5 text-sm font-bold text-cyan-200"
          >
            {copied === "yml" ? "✅ تم النسخ" : "📋 نسخ محتوى الملف"}
          </button>
        </div>
        <pre
          dir="ltr"
          className="mt-3 max-h-80 overflow-auto rounded-xl bg-black/50 p-4 text-left font-mono text-[11px] leading-relaxed text-cyan-100"
        >
          {workflow}
        </pre>
      </section>

      <section className="card glow p-5">
        <h2 className="text-lg font-black text-white">
          ١. حمّل المشروع كاملاً (ملف ZIP)
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          الملفات في <b>جذر</b> الأرشيف (pubspec.yaml + lib + android +
          workflow)، وعنوان الخادم مضبوط تلقائياً على:{" "}
          <code dir="ltr" className="rounded bg-black/40 px-1.5 text-cyan-200">
            {origin || "..."}
          </code>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="/api/flutter/zip"
            className="rounded-xl bg-gradient-to-l from-[#00ff87] to-[#04f5ff] px-5 py-2.5 text-sm font-black text-[#37003c]"
          >
            ⬇️ تنزيل مشروع Flutter (ZIP)
          </a>
          <a
            href="/api/flutter/file?path=single_file/main.dart&download=1"
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white"
          >
            ⬇️ تنزيل main.dart (ملف واحد)
          </a>
          <button
            type="button"
            onClick={() => copyText(code, "dart")}
            className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-5 py-2.5 text-sm font-bold text-emerald-200"
          >
            {copied === "dart" ? "✅ تم النسخ" : "📋 نسخ كود main.dart"}
          </button>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-black text-white">
          ٢. خطوات الرفع والبناء (GitHub / KlenCode)
        </h2>
        <ol className="mt-3 space-y-2 text-sm text-slate-200">
          {[
            "نزّل ملف ZIP ثم فُكّ الضغط عنه على جهازك.",
            "ارفع «محتويات» المجلد (وليس المجلد نفسه) إلى جذر المستودع: pubspec.yaml و lib و android و .github.",
            "في GitHub: Add file ← Upload files ← اسحب كل الملفات ← Commit. تأكد أن pubspec.yaml ظاهر في الجذر.",
            "افتح تبويب Actions ← شغّل «بناء تطبيق APK» ← انتظر حتى تظهر علامة ✅.",
            "نزّل ملف APK من قسم Artifacts باسم fpl-stats-apk وثبّته على هاتفك.",
            "داخل KlenCode IDE: افتح المشروع ← Pub Get ← Run ▶ أو Build APK.",
          ].map((step, index) => (
            <li key={step} className="flex gap-3 rounded-xl bg-white/5 p-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#00ff87] text-xs font-black text-[#37003c]">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs text-emerald-100">
          صلاحية الإنترنت مُضافة مسبقاً في
          <code dir="ltr" className="mx-1 rounded bg-black/40 px-1">
            android/app/src/main/AndroidManifest.xml
          </code>
          كما يضيفها ملف الـ workflow تلقائياً عند البناء، ويعيد توليد مجلد
          android بما يطابق إصدار Flutter على الخادم لتفادي أخطاء Gradle.
        </p>
        <p className="mt-2 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-100">
          إذا كان مشروعك داخل مجلد فرعي في المستودع، أضف إلى خطوات الـ workflow:
          <code dir="ltr" className="mx-1 rounded bg-black/40 px-1">
            working-directory: اسم_المجلد
          </code>
        </p>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-black text-white">٣. ملفات المشروع</h2>
        <p className="text-xs text-slate-400">
          اضغط على أي ملف لعرضه أو تنزيله بشكل منفصل ({files.length} ملفاً).
        </p>
        <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <a
              key={file}
              href={`/api/flutter/file?path=${encodeURIComponent(file)}&download=1`}
              dir="ltr"
              className="truncate rounded-lg bg-white/5 px-3 py-2 text-left font-mono text-[11px] text-cyan-200 hover:bg-white/10"
            >
              {file}
            </a>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-black text-white">
          ٤. معاينة كود main.dart (نسخة الملف الواحد)
        </h2>
        <pre
          dir="ltr"
          className="mt-3 max-h-[480px] overflow-auto rounded-xl bg-black/50 p-4 text-left font-mono text-[11px] leading-relaxed text-emerald-100"
        >
          {code}
        </pre>
      </section>
    </div>
  );
}
