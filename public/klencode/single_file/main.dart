// ============================================================
// تطبيق فانتازي الدوري الإنجليزي — نسخة ملف واحد لـ KlenCode IDE
// الصق هذا الملف كاملاً في lib/main.dart
// أضف في pubspec.yaml تحت dependencies:   http: ^1.2.2
// ============================================================
import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

/// عنوان الخادم (يُضبط تلقائياً عند التنزيل من صفحة "تطبيق Flutter")
const String kBaseUrl = '__BASE_URL__';

const Map<int, String> kPositions = {
  1: 'حارس مرمى',
  2: 'مدافع',
  3: 'وسط',
  4: 'مهاجم',
};

String playerPhoto(int code) =>
    'https://resources.premierleague.com/premierleague/photos/players/110x140/p$code.png';

void main() => runApp(const FplApp());

class FplApp extends StatelessWidget {
  const FplApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'فانتازي بريميرليغ',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(useMaterial3: true).copyWith(
        scaffoldBackgroundColor: const Color(0xFF1B0620),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF37003C),
          centerTitle: true,
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Color(0xFF37003C),
          selectedItemColor: Color(0xFF00FF87),
          unselectedItemColor: Colors.white60,
          type: BottomNavigationBarType.fixed,
        ),
      ),
      builder: (context, child) => Directionality(
        textDirection: TextDirection.rtl,
        child: child ?? const SizedBox.shrink(),
      ),
      home: const RootPage(),
    );
  }
}

/* ----------------------------- النموذج ----------------------------- */

class Player {
  Player(this.json);
  final Map<String, dynamic> json;

  int get id => (json['id'] as num?)?.toInt() ?? 0;
  int get code => (json['code'] as num?)?.toInt() ?? 0;
  String get name => '${json['webName'] ?? ''}';
  String get team => '${json['teamShort'] ?? ''}';
  int get position => (json['elementType'] as num?)?.toInt() ?? 0;
  int get points => (json['totalPoints'] as num?)?.toInt() ?? 0;
  double get form => (json['form'] as num?)?.toDouble() ?? 0;
  double get owned => (json['selectedByPercent'] as num?)?.toDouble() ?? 0;
  int get goals => (json['goalsScored'] as num?)?.toInt() ?? 0;
  int get assists => (json['assists'] as num?)?.toInt() ?? 0;
  int get minutes => (json['minutes'] as num?)?.toInt() ?? 0;
  double get xgi =>
      (json['expectedGoalInvolvements'] as num?)?.toDouble() ?? 0;
  String get price =>
      (((json['nowCost'] as num?)?.toDouble() ?? 0) / 10).toStringAsFixed(1);
  String get news => '${json['news'] ?? ''}';
}

/* ------------------------------ الـ API ----------------------------- */

class Api {
  static Future<Map<String, dynamic>> _get(String path,
      [Map<String, String>? query]) async {
    final uri = Uri.parse('$kBaseUrl$path').replace(queryParameters: query);
    final res = await http.get(uri);
    if (res.statusCode >= 400) {
      throw Exception('خطأ ${res.statusCode}');
    }
    return jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> overview() => _get('/api/overview');

  static Future<List<Player>> players({
    String search = '',
    int position = 0,
    String sort = 'totalPoints',
  }) async {
    final data = await _get('/api/players', {
      if (search.isNotEmpty) 'search': search,
      if (position > 0) 'position': '$position',
      'sort': sort,
      'limit': '60',
    });
    return ((data['players'] as List?) ?? const [])
        .map((e) => Player(e as Map<String, dynamic>))
        .toList();
  }

  static Future<Map<String, dynamic>> player(int id) =>
      _get('/api/players/$id');

  static Future<Map<String, dynamic>> squad() => _get('/api/squad');

  static Future<Map<String, dynamic>> addToSquad(int playerId) async {
    final res = await http.post(
      Uri.parse('$kBaseUrl/api/squad'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'playerId': playerId, 'action': 'add'}),
    );
    return jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> removeFromSquad(int playerId) async {
    final res = await http
        .delete(Uri.parse('$kBaseUrl/api/squad?playerId=$playerId'));
    return jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;
  }
}

/* ----------------------------- التنقل ----------------------------- */

class RootPage extends StatefulWidget {
  const RootPage({super.key});

  @override
  State<RootPage> createState() => _RootPageState();
}

class _RootPageState extends State<RootPage> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _index,
        children: const [HomeTab(), PlayersTab(), SquadTab()],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (value) => setState(() => _index = value),
        items: const [
          BottomNavigationBarItem(
              icon: Icon(Icons.insights), label: 'الإحصائيات'),
          BottomNavigationBarItem(
              icon: Icon(Icons.sports_soccer), label: 'اللاعبون'),
          BottomNavigationBarItem(icon: Icon(Icons.grid_view), label: 'تشكيلتي'),
        ],
      ),
    );
  }
}

/* --------------------------- تبويب الإحصائيات --------------------------- */

class HomeTab extends StatefulWidget {
  const HomeTab({super.key});

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  late Future<Map<String, dynamic>> _future = Api.overview();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('مركز الإحصائيات')),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('⚠️ ${snapshot.error}'));
          }
          final data = snapshot.data!;
          final gw = (data['gameweek'] as Map<String, dynamic>?) ?? const {};
          final current = gw['current'] as Map<String, dynamic>?;

          List<Player> list(String key) => ((data[key] as List?) ?? const [])
              .map((e) => Player(e as Map<String, dynamic>))
              .toList();

          return RefreshIndicator(
            onRefresh: () async =>
                setState(() => _future = Api.overview()),
            child: ListView(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    '${current?['name'] ?? 'الجولة الحالية'} · متوسط النقاط ${current?['averageEntryScore'] ?? 0}',
                    style: const TextStyle(
                        fontSize: 18, fontWeight: FontWeight.w900),
                  ),
                ),
                _group('الأعلى نقاطاً', list('topPoints'),
                    (p) => '${p.points}'),
                _group('الأفضل فورمة', list('topForm'),
                    (p) => p.form.toStringAsFixed(1)),
                _group('الأكثر ملكية', list('mostOwned'),
                    (p) => '${p.owned.toStringAsFixed(1)}%'),
                _group('أوراق مميزة', list('differentials'),
                    (p) => p.form.toStringAsFixed(1)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _group(
      String title, List<Player> players, String Function(Player) metric) {
    if (players.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Text(title,
              style: const TextStyle(
                  color: Color(0xFF00FF87), fontWeight: FontWeight.w900)),
        ),
        ...players.map((p) => PlayerTile(player: p, metric: metric(p))),
      ],
    );
  }
}

/* ---------------------------- تبويب اللاعبين ---------------------------- */

class PlayersTab extends StatefulWidget {
  const PlayersTab({super.key});

  @override
  State<PlayersTab> createState() => _PlayersTabState();
}

class _PlayersTabState extends State<PlayersTab> {
  String _search = '';
  int _position = 0;
  String _sort = 'totalPoints';
  Timer? _debounce;
  late Future<List<Player>> _future = _load();

  Future<List<Player>> _load() =>
      Api.players(search: _search, position: _position, sort: _sort);

  void _reload() => setState(() => _future = _load());

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('اللاعبون')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'ابحث عن لاعب…',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                _debounce?.cancel();
                _debounce = Timer(const Duration(milliseconds: 350), () {
                  _search = value;
                  _reload();
                });
              },
            ),
          ),
          SizedBox(
            height: 44,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 10),
              children: [
                for (final pos in [0, 1, 2, 3, 4])
                  Padding(
                    padding: const EdgeInsets.only(left: 6),
                    child: ChoiceChip(
                      label: Text(pos == 0 ? 'الكل' : kPositions[pos]!),
                      selected: _position == pos,
                      onSelected: (_) {
                        _position = pos;
                        _reload();
                      },
                    ),
                  ),
              ],
            ),
          ),
          DropdownButton<String>(
            value: _sort,
            items: const [
              DropdownMenuItem(value: 'totalPoints', child: Text('النقاط')),
              DropdownMenuItem(value: 'form', child: Text('الفورمة')),
              DropdownMenuItem(value: 'nowCost', child: Text('السعر')),
              DropdownMenuItem(
                  value: 'expectedGoalInvolvements', child: Text('xGI')),
              DropdownMenuItem(value: 'goalsScored', child: Text('الأهداف')),
              DropdownMenuItem(value: 'assists', child: Text('الصناعة')),
            ],
            onChanged: (value) {
              if (value == null) return;
              _sort = value;
              _reload();
            },
          ),
          Expanded(
            child: FutureBuilder<List<Player>>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const Center(child: CircularProgressIndicator());
                }
                final players = snapshot.data ?? const <Player>[];
                return ListView.builder(
                  itemCount: players.length,
                  itemBuilder: (_, i) => PlayerTile(
                    player: players[i],
                    metric: '${players[i].points}',
                    onAdd: () async {
                      final res = await Api.addToSquad(players[i].id);
                      if (!context.mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(res['ok'] == true
                              ? '✅ أُضيف إلى تشكيلتك'
                              : '⚠️ ${res['message']}'),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

/* ---------------------------- تبويب التشكيلة ---------------------------- */

class SquadTab extends StatefulWidget {
  const SquadTab({super.key});

  @override
  State<SquadTab> createState() => _SquadTabState();
}

class _SquadTabState extends State<SquadTab> {
  late Future<Map<String, dynamic>> _future = Api.squad();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('تشكيلتي'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => setState(() => _future = Api.squad()),
          ),
        ],
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          final data = snapshot.data ?? const {};
          final picks = (data['picks'] as List?) ?? const [];
          final summary =
              (data['summary'] as Map<String, dynamic>?) ?? const {};

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(14),
                child: Text(
                  'اللاعبون ${summary['count'] ?? 0}/15 · المتبقي £${(((summary['remaining'] as num?) ?? 0) / 10).toStringAsFixed(1)}م · النقاط ${summary['totalPoints'] ?? 0}',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              Expanded(
                child: picks.isEmpty
                    ? const Center(child: Text('التشكيلة فارغة'))
                    : ListView(
                        children: picks.map((raw) {
                          final pick = raw as Map<String, dynamic>;
                          final player =
                              Player(pick['player'] as Map<String, dynamic>);
                          return PlayerTile(
                            player: player,
                            metric: '${player.points}',
                            onRemove: () async {
                              await Api.removeFromSquad(player.id);
                              setState(() => _future = Api.squad());
                            },
                          );
                        }).toList(),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}

/* ------------------------------ عنصر اللاعب ------------------------------ */

class PlayerTile extends StatelessWidget {
  const PlayerTile({
    super.key,
    required this.player,
    required this.metric,
    this.onAdd,
    this.onRemove,
  });

  final Player player;
  final String metric;
  final VoidCallback? onAdd;
  final VoidCallback? onRemove;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: Colors.white10,
        backgroundImage: NetworkImage(playerPhoto(player.code)),
      ),
      title: Text(player.name,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
      subtitle: Text(
        '${player.team} · ${kPositions[player.position] ?? ''} · £${player.price}م · ${player.goals} هدف',
        style: const TextStyle(fontSize: 11),
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(metric,
              style: const TextStyle(
                  color: Color(0xFF00FF87), fontWeight: FontWeight.w900)),
          if (onAdd != null)
            IconButton(
                icon: const Icon(Icons.add_circle_outline), onPressed: onAdd),
          if (onRemove != null)
            IconButton(
                icon: const Icon(Icons.remove_circle_outline),
                onPressed: onRemove),
        ],
      ),
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => DetailPage(playerId: player.id)),
      ),
    );
  }
}

/* ------------------------------ صفحة اللاعب ------------------------------ */

class DetailPage extends StatelessWidget {
  const DetailPage({super.key, required this.playerId});
  final int playerId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('بطاقة اللاعب')),
      body: FutureBuilder<Map<String, dynamic>>(
        future: Api.player(playerId),
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          final data = snapshot.data ?? const {};
          final player = Player(
              (data['player'] as Map<String, dynamic>?) ?? <String, dynamic>{});
          final summary = (data['summary'] as Map<String, dynamic>?) ?? const {};
          final history = (summary['history'] as List?) ?? const [];

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Center(
                child: Image.network(playerPhoto(player.code),
                    height: 120,
                    errorBuilder: (_, __, ___) => const Icon(Icons.person)),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(player.name,
                    style: const TextStyle(
                        fontSize: 20, fontWeight: FontWeight.w900)),
              ),
              Center(
                child: Text(
                  '${player.team} · ${kPositions[player.position] ?? ''} · £${player.price}م',
                  style: const TextStyle(color: Colors.white70),
                ),
              ),
              if (player.news.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Text('⚠️ ${player.news}',
                      style: const TextStyle(color: Colors.orangeAccent)),
                ),
              const SizedBox(height: 14),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  _stat('النقاط', '${player.points}'),
                  _stat('الفورمة', player.form.toStringAsFixed(1)),
                  _stat('الأهداف', '${player.goals}'),
                  _stat('الصناعة', '${player.assists}'),
                  _stat('الدقائق', '${player.minutes}'),
                  _stat('xGI', player.xgi.toStringAsFixed(2)),
                  _stat('الملكية', '${player.owned.toStringAsFixed(1)}%'),
                ],
              ),
              const SizedBox(height: 16),
              const Text('سجل الجولات',
                  style: TextStyle(fontWeight: FontWeight.w900)),
              ...history.reversed.take(12).map((raw) {
                final row = raw as Map<String, dynamic>;
                return ListTile(
                  dense: true,
                  title: Text('الجولة ${row['round']}',
                      style: const TextStyle(fontSize: 13)),
                  subtitle: Text(
                    '${row['minutes']} دقيقة · ${row['goals_scored']} هدف · ${row['assists']} صناعة',
                    style: const TextStyle(fontSize: 11),
                  ),
                  trailing: Text('${row['total_points']}',
                      style: const TextStyle(
                          color: Color(0xFF00FF87),
                          fontWeight: FontWeight.w900)),
                );
              }),
            ],
          );
        },
      ),
    );
  }

  Widget _stat(String label, String value) => Container(
        width: 100,
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white10,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: const TextStyle(fontSize: 10, color: Colors.white54)),
            Text(value,
                style: const TextStyle(
                    fontSize: 16, fontWeight: FontWeight.w900)),
          ],
        ),
      );
}
