import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import NavBar from "@/components/nav-bar";

export const metadata: Metadata = {
  title: "فانتازي بريميرليغ | مركز الإحصائيات",
  description:
    "تطبيق متكامل لإحصائيات فانتازي الدوري الإنجليزي الممتاز، بيانات مباشرة من الواجهة الرسمية FPL API.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen text-slate-100 antialiased">
        <NavBar />
        <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6">{children}</main>
        <footer className="border-t border-white/10 bg-black/30 py-6 text-center text-xs text-slate-400">
          <p>
            البيانات مصدرها الواجهة الرسمية{" "}
            <Link
              href="https://fantasy.premierleague.com/api/bootstrap-static/"
              target="_blank"
              className="text-emerald-300 underline"
            >
              fantasy.premierleague.com/api
            </Link>{" "}
            — هذا المشروع غير تابع رسمياً للدوري الإنجليزي الممتاز.
          </p>
        </footer>
      </body>
    </html>
  );
}
