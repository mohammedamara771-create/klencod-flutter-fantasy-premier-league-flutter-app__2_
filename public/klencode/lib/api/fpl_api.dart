import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config.dart';
import '../models.dart';

/// عميل يتصل بخادم التطبيق (Next.js) الذي يجلب بياناته
/// من الواجهة الرسمية fantasy.premierleague.com/api
class FplApi {
  FplApi({String? baseUrl}) : baseUrl = baseUrl ?? kBaseUrl;

  final String baseUrl;

  Uri _uri(String path, [Map<String, String>? query]) =>
      Uri.parse('$baseUrl$path').replace(queryParameters: query);

  Future<Map<String, dynamic>> _get(Uri uri) async {
    final res = await http.get(uri, headers: {'Accept': 'application/json'});
    if (res.statusCode >= 400) {
      throw Exception('خطأ في الخادم (${res.statusCode})');
    }
    return jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;
  }

  /// ملخص اللوحة الرئيسية
  Future<OverviewData> overview() async {
    final data = await _get(_uri('/api/overview'));
    List<Player> list(String key) => ((data[key] as List?) ?? const [])
        .map((e) => Player.fromJson(e as Map<String, dynamic>))
        .toList();

    final gw = (data['gameweek'] as Map<String, dynamic>?) ?? const {};
    return OverviewData(
      current: gw['current'] == null
          ? null
          : GameEvent.fromJson(gw['current'] as Map<String, dynamic>),
      next: gw['next'] == null
          ? null
          : GameEvent.fromJson(gw['next'] as Map<String, dynamic>),
      topPoints: list('topPoints'),
      topForm: list('topForm'),
      topValue: list('topValue'),
      mostOwned: list('mostOwned'),
      topXgi: list('topXgi'),
      differentials: list('differentials'),
      risers: list('risers'),
      fallers: list('fallers'),
      injuries: list('injuries'),
    );
  }

  /// قائمة اللاعبين مع الفلاتر
  Future<List<Player>> players({
    String? search,
    int position = 0,
    int team = 0,
    int? maxCost,
    String sort = 'totalPoints',
    bool availableOnly = false,
    int limit = 50,
  }) async {
    final data = await _get(_uri('/api/players', {
      if (search != null && search.isNotEmpty) 'search': search,
      if (position > 0) 'position': '$position',
      if (team > 0) 'team': '$team',
      if (maxCost != null) 'maxCost': '$maxCost',
      if (availableOnly) 'available': '1',
      'sort': sort,
      'limit': '$limit',
    }));
    return ((data['players'] as List?) ?? const [])
        .map((e) => Player.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// تفاصيل لاعب + سجل الجولات + المباريات القادمة
  Future<PlayerDetail> player(int id) async {
    final data = await _get(_uri('/api/players/$id'));
    final summary = (data['summary'] as Map<String, dynamic>?) ?? const {};
    return PlayerDetail(
      player: Player.fromJson(data['player'] as Map<String, dynamic>),
      history: ((summary['history'] as List?) ?? const [])
          .cast<Map<String, dynamic>>(),
      upcoming: ((summary['fixtures'] as List?) ?? const [])
          .cast<Map<String, dynamic>>(),
    );
  }

  Future<List<Team>> teams() async {
    final data = await _get(_uri('/api/teams'));
    return ((data['teams'] as List?) ?? const [])
        .map((e) => Team.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<FixturesData> fixtures({int? event}) async {
    final data = await _get(
      _uri('/api/fixtures', {if (event != null) 'event': '$event'}),
    );
    return FixturesData(
      fixtures: ((data['fixtures'] as List?) ?? const [])
          .map((e) => FixtureItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      events: ((data['events'] as List?) ?? const [])
          .map((e) => GameEvent.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  /// إحصائيات مدير FPL عبر رقم الفريق
  Future<Map<String, dynamic>> manager(int teamId) =>
      _get(_uri('/api/manager/$teamId'));

  /// مزامنة فورية مع الواجهة الرسمية للعبة
  Future<bool> sync() async {
    final res = await http.post(_uri('/api/sync'));
    final data =
        jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;
    return data['ok'] == true;
  }

  Future<SquadData> squad() async {
    final data = await _get(_uri('/api/squad'));
    return _squadFrom(data);
  }

  Future<SquadData> squadAction({
    int? playerId,
    String action = 'add',
  }) async {
    final res = await http.post(
      _uri('/api/squad'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        if (playerId != null) 'playerId': playerId,
        'action': action,
      }),
    );
    final data =
        jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw Exception(data['message']?.toString() ?? 'تعذر تنفيذ العملية');
    }
    return _squadFrom(data);
  }

  Future<SquadData> removeFromSquad(int playerId) async {
    final res = await http.delete(
      _uri('/api/squad', {'playerId': '$playerId'}),
    );
    final data =
        jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;
    return _squadFrom(data);
  }

  SquadData _squadFrom(Map<String, dynamic> data) => SquadData(
        picks: ((data['picks'] as List?) ?? const [])
            .map((e) => SquadPick.fromJson(e as Map<String, dynamic>))
            .toList(),
        summary: SquadSummary.fromJson(
          (data['summary'] as Map<String, dynamic>?) ?? const {},
        ),
      );
}

class OverviewData {
  OverviewData({
    required this.current,
    required this.next,
    required this.topPoints,
    required this.topForm,
    required this.topValue,
    required this.mostOwned,
    required this.topXgi,
    required this.differentials,
    required this.risers,
    required this.fallers,
    required this.injuries,
  });

  final GameEvent? current;
  final GameEvent? next;
  final List<Player> topPoints;
  final List<Player> topForm;
  final List<Player> topValue;
  final List<Player> mostOwned;
  final List<Player> topXgi;
  final List<Player> differentials;
  final List<Player> risers;
  final List<Player> fallers;
  final List<Player> injuries;
}

class PlayerDetail {
  PlayerDetail({
    required this.player,
    required this.history,
    required this.upcoming,
  });

  final Player player;
  final List<Map<String, dynamic>> history;
  final List<Map<String, dynamic>> upcoming;
}

class FixturesData {
  FixturesData({required this.fixtures, required this.events});
  final List<FixtureItem> fixtures;
  final List<GameEvent> events;
}
