"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "الرئيسية", icon: "📊" },
  { href: "/players", label: "اللاعبون", icon: "👟" },
  { href: "/squad", label: "بناء الفريق", icon: "🧩" },
  { href: "/fixtures", label: "المباريات", icon: "📅" },
  { href: "/teams", label: "الأندية", icon: "🏟️" },
  { href: "/manager", label: "حسابي FPL", icon: "🪪" },
  { href: "/flutter", label: "تحميل تطبيق Flutter", icon: "📱" },
  { href: "/api-docs", label: "واجهة REST", icon: "🔌" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#200726]/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#00ff87] to-[#04f5ff] text-lg font-black text-[#37003c]">
            ف
          </span>
          <div className="leading-tight">
            <p className="text-sm font-black tracking-tight text-white">
              فانتازي بريميرليغ
            </p>
            <p className="text-[10px] text-emerald-300">مركز الإحصائيات المباشر</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-[#00ff87] font-bold text-[#37003c]"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                <span className="ml-1">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-white/15 px-3 py-2 text-sm lg:hidden"
        >
          ☰ القائمة
        </button>
      </div>

      {open && (
        <nav className="grid grid-cols-2 gap-2 border-t border-white/10 px-4 py-3 lg:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-100"
            >
              <span className="ml-1">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
