import SquadBuilder from "@/components/squad-builder";
import { ensureData } from "@/lib/sync";

export const dynamic = "force-dynamic";

export default async function SquadPage() {
  await ensureData();
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-black text-white">بناء تشكيلة الفانتازي</h1>
        <p className="text-sm text-slate-300">
          ميزانية 100.0 مليون · 15 لاعباً (2 حراس، 5 مدافعين، 5 وسط، 3 مهاجمين) ·
          بحد أقصى 3 لاعبين من النادي الواحد. تُحفظ تشكيلتك في قاعدة البيانات
          تلقائياً.
        </p>
      </header>
      <SquadBuilder />
    </div>
  );
}
