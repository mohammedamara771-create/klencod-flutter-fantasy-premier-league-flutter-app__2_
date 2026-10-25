import ManagerLookup from "@/components/manager-lookup";

export const dynamic = "force-dynamic";

export default function ManagerPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-black text-white">إحصائيات حسابك في FPL</h1>
        <p className="text-sm text-slate-300">
          أدخل رقم فريقك (Team ID) من الموقع الرسمي لعرض نقاطك، ترتيبك العالمي،
          قيمة فريقك، وأداؤك جولة بجولة. الرقم تجده في رابط صفحة النقاط:
          fantasy.premierleague.com/entry/<b>1234567</b>/event/1
        </p>
      </header>
      <ManagerLookup />
    </div>
  );
}
