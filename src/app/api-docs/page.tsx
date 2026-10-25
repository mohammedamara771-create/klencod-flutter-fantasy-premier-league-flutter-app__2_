import { Panel } from "@/components/ui";

export const dynamic = "force-static";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/overview",
    desc: "ملخص اللوحة: الجولة الحالية/القادمة، الأعلى نقاطاً، الفورمة، القيمة، الملكية، الإصابات، تغيّر الأسعار.",
  },
  {
    method: "GET",
    path: "/api/players?search=&position=1..4&team=&maxCost=&sort=totalPoints&dir=desc&limit=50&offset=0",
    desc: "قائمة اللاعبين مع فلترة وترتيب كامل (كل الإحصائيات بما فيها xG/xA/ICT).",
  },
  {
    method: "GET",
    path: "/api/players/{id}",
    desc: "تفاصيل لاعب + سجل الجولات + المباريات القادمة (من element-summary الرسمية).",
  },
  { method: "GET", path: "/api/teams", desc: "بيانات الأندية العشرين وقوتها." },
  {
    method: "GET",
    path: "/api/fixtures?event=9",
    desc: "مباريات جولة محددة أو كل الموسم + قائمة الجولات.",
  },
  {
    method: "GET",
    path: "/api/manager/{teamId}",
    desc: "إحصائيات مدير FPL: النقاط، الترتيب، التاريخ الموسمي.",
  },
  {
    method: "GET / POST / DELETE",
    path: "/api/squad",
    desc: "قراءة/إضافة/حذف لاعبي تشكيلتك مع التحقق من الميزانية والمراكز (action: add | clear | captain | vice).",
  },
  {
    method: "GET / POST / DELETE",
    path: "/api/watchlist",
    desc: "قائمة المتابعة المحفوظة في PostgreSQL.",
  },
  {
    method: "POST",
    path: "/api/sync",
    desc: "مزامنة فورية مع الواجهة الرسمية fantasy.premierleague.com/api.",
  },
  { method: "GET", path: "/api/health", desc: "فحص صحة الخدمة وقاعدة البيانات." },
];

const DART_CODE = `// fpl_api.dart — عميل Dart/Flutter جاهز لاستهلاك واجهات هذا التطبيق
import 'dart:convert';
import 'package:http/http.dart' as http;

class FplApi {
  FplApi({required this.baseUrl});
  final String baseUrl; // مثال: https://your-app.vercel.app

  Future<Map<String, dynamic>> overview() async {
    final res = await http.get(Uri.parse('$baseUrl/api/overview'));
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<List<Player>> players({
    String? search,
    int? position,
    int? team,
    String sort = 'totalPoints',
    int limit = 50,
  }) async {
    final uri = Uri.parse('$baseUrl/api/players').replace(queryParameters: {
      if (search != null && search.isNotEmpty) 'search': search,
      if (position != null && position > 0) 'position': '$position',
      if (team != null && team > 0) 'team': '$team',
      'sort': sort,
      'limit': '$limit',
    });
    final res = await http.get(uri);
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    return (data['players'] as List)
        .map((e) => Player.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Map<String, dynamic>> manager(int teamId) async {
    final res = await http.get(Uri.parse('$baseUrl/api/manager/$teamId'));
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addToSquad(int playerId) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/squad'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'playerId': playerId, 'action': 'add'}),
    );
    return jsonDecode(res.body) as Map<String, dynamic>;
  }
}

class Player {
  Player({
    required this.id,
    required this.webName,
    required this.teamShort,
    required this.elementType,
    required this.nowCost,
    required this.totalPoints,
    required this.form,
  });

  final int id;
  final String webName;
  final String teamShort;
  final int elementType;
  final int nowCost;
  final int totalPoints;
  final double form;

  String get price => (nowCost / 10).toStringAsFixed(1);

  factory Player.fromJson(Map<String, dynamic> json) => Player(
        id: json['id'] as int,
        webName: json['webName'] as String,
        teamShort: json['teamShort'] as String,
        elementType: json['elementType'] as int,
        nowCost: json['nowCost'] as int,
        totalPoints: (json['totalPoints'] ?? 0) as int,
        form: ((json['form'] ?? 0) as num).toDouble(),
      );
}`;

const WIDGET_CODE = `// main.dart — شاشة بسيطة تعرض أفضل اللاعبين داخل Flutter
void main() => runApp(const FplApp());

class FplApp extends StatelessWidget {
  const FplApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
        locale: const Locale('ar'),
        theme: ThemeData.dark(useMaterial3: true),
        home: const TopPlayersPage(),
      );
}

class TopPlayersPage extends StatefulWidget {
  const TopPlayersPage({super.key});
  @override
  State<TopPlayersPage> createState() => _TopPlayersPageState();
}

class _TopPlayersPageState extends State<TopPlayersPage> {
  final api = FplApi(baseUrl: 'https://your-app-url');
  late Future<List<Player>> _future = api.players(sort: 'totalPoints');

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(title: const Text('أفضل لاعبي الفانتازي')),
        body: FutureBuilder<List<Player>>(
          future: _future,
          builder: (context, snapshot) {
            if (!snapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }
            final players = snapshot.data!;
            return ListView.builder(
              itemCount: players.length,
              itemBuilder: (_, i) {
                final p = players[i];
                return ListTile(
                  leading: CircleAvatar(child: Text('\${i + 1}')),
                  title: Text(p.webName),
                  subtitle: Text('\${p.teamShort} • £\${p.price}m'),
                  trailing: Text('\${p.totalPoints} نقطة'),
                  onTap: () => api.addToSquad(p.id),
                );
              },
            );
          },
        ),
      ),
    );
  }
}`;

export default function ApiDocsPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black text-white">
          واجهة REST للتطبيق + عميل Flutter جاهز
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          هذا المشروع يعمل كخادم (Backend) لتطبيق فانتازي الدوري الإنجليزي: يجلب
          البيانات من الواجهة الرسمية، يخزّنها في PostgreSQL، ويقدّمها عبر JSON.
          يمكنك نسخ كود Dart أدناه مباشرة داخل محرر KlenCode / Android Studio
          لبناء تطبيق Flutter يستهلك نفس البيانات.
        </p>
      </header>

      <Panel title="المسارات المتاحة" subtitle="جميعها ترجع JSON">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-right text-sm">
            <thead className="text-[11px] text-slate-300">
              <tr>
                <th className="px-2 py-2">الطريقة</th>
                <th className="px-2 py-2">المسار</th>
                <th className="px-2 py-2">الوصف</th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((e) => (
                <tr key={e.path} className="border-t border-white/5">
                  <td className="px-2 py-2">
                    <span className="rounded bg-emerald-400/15 px-2 py-0.5 text-[11px] font-bold text-emerald-200">
                      {e.method}
                    </span>
                  </td>
                  <td dir="ltr" className="px-2 py-2 text-left font-mono text-xs text-cyan-200">
                    {e.path}
                  </td>
                  <td className="px-2 py-2 text-xs text-slate-300">{e.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="ملف fpl_api.dart" subtitle="أضف http: ^1.2.0 إلى pubspec.yaml">
        <pre
          dir="ltr"
          className="max-h-[520px] overflow-auto rounded-xl bg-black/50 p-4 text-left font-mono text-[11px] leading-relaxed text-emerald-100"
        >
          {DART_CODE}
        </pre>
      </Panel>

      <Panel title="واجهة Flutter نموذجية" subtitle="شاشة تعرض أفضل اللاعبين">
        <pre
          dir="ltr"
          className="max-h-[520px] overflow-auto rounded-xl bg-black/50 p-4 text-left font-mono text-[11px] leading-relaxed text-cyan-100"
        >
          {WIDGET_CODE}
        </pre>
      </Panel>
    </div>
  );
}
