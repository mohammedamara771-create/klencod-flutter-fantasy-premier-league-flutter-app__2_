double _d(dynamic value) => (value is num) ? value.toDouble() : 0.0;
int _i(dynamic value) => (value is num) ? value.toInt() : 0;
String _s(dynamic value) => value == null ? '' : value.toString();

class Player {
  Player({
    required this.id,
    required this.code,
    required this.webName,
    required this.fullName,
    required this.teamId,
    required this.teamName,
    required this.teamShort,
    required this.teamCode,
    required this.elementType,
    required this.nowCost,
    required this.totalPoints,
    required this.eventPoints,
    required this.form,
    required this.pointsPerGame,
    required this.selectedByPercent,
    required this.minutes,
    required this.goalsScored,
    required this.assists,
    required this.cleanSheets,
    required this.saves,
    required this.bonus,
    required this.bps,
    required this.ictIndex,
    required this.expectedGoals,
    required this.expectedAssists,
    required this.expectedGoalInvolvements,
    required this.valueSeason,
    required this.epNext,
    required this.costChangeStart,
    required this.status,
    required this.news,
  });

  final int id;
  final int code;
  final String webName;
  final String fullName;
  final int teamId;
  final String teamName;
  final String teamShort;
  final int teamCode;
  final int elementType;
  final int nowCost;
  final int totalPoints;
  final int eventPoints;
  final double form;
  final double pointsPerGame;
  final double selectedByPercent;
  final int minutes;
  final int goalsScored;
  final int assists;
  final int cleanSheets;
  final int saves;
  final int bonus;
  final int bps;
  final double ictIndex;
  final double expectedGoals;
  final double expectedAssists;
  final double expectedGoalInvolvements;
  final double valueSeason;
  final double epNext;
  final int costChangeStart;
  final String status;
  final String news;

  String get price => (nowCost / 10).toStringAsFixed(1);
  bool get isAvailable => status == 'a';

  factory Player.fromJson(Map<String, dynamic> json) => Player(
        id: _i(json['id']),
        code: _i(json['code']),
        webName: _s(json['webName']),
        fullName: '${_s(json['firstName'])} ${_s(json['secondName'])}'.trim(),
        teamId: _i(json['teamId']),
        teamName: _s(json['teamName']),
        teamShort: _s(json['teamShort']),
        teamCode: _i(json['teamCode']),
        elementType: _i(json['elementType']),
        nowCost: _i(json['nowCost']),
        totalPoints: _i(json['totalPoints']),
        eventPoints: _i(json['eventPoints']),
        form: _d(json['form']),
        pointsPerGame: _d(json['pointsPerGame']),
        selectedByPercent: _d(json['selectedByPercent']),
        minutes: _i(json['minutes']),
        goalsScored: _i(json['goalsScored']),
        assists: _i(json['assists']),
        cleanSheets: _i(json['cleanSheets']),
        saves: _i(json['saves']),
        bonus: _i(json['bonus']),
        bps: _i(json['bps']),
        ictIndex: _d(json['ictIndex']),
        expectedGoals: _d(json['expectedGoals']),
        expectedAssists: _d(json['expectedAssists']),
        expectedGoalInvolvements: _d(json['expectedGoalInvolvements']),
        valueSeason: _d(json['valueSeason']),
        epNext: _d(json['epNext']),
        costChangeStart: _i(json['costChangeStart']),
        status: _s(json['status']),
        news: _s(json['news']),
      );
}

class Team {
  Team({
    required this.id,
    required this.code,
    required this.name,
    required this.shortName,
    required this.strengthAttackHome,
    required this.strengthAttackAway,
    required this.strengthDefenceHome,
    required this.strengthDefenceAway,
  });

  final int id;
  final int code;
  final String name;
  final String shortName;
  final int strengthAttackHome;
  final int strengthAttackAway;
  final int strengthDefenceHome;
  final int strengthDefenceAway;

  factory Team.fromJson(Map<String, dynamic> json) => Team(
        id: _i(json['id']),
        code: _i(json['code']),
        name: _s(json['name']),
        shortName: _s(json['shortName']),
        strengthAttackHome: _i(json['strengthAttackHome']),
        strengthAttackAway: _i(json['strengthAttackAway']),
        strengthDefenceHome: _i(json['strengthDefenceHome']),
        strengthDefenceAway: _i(json['strengthDefenceAway']),
      );
}

class FixtureItem {
  FixtureItem({
    required this.id,
    required this.event,
    required this.kickoffTime,
    required this.teamH,
    required this.teamA,
    required this.teamHScore,
    required this.teamAScore,
    required this.teamHDifficulty,
    required this.teamADifficulty,
    required this.finished,
    required this.started,
  });

  final int id;
  final int event;
  final DateTime? kickoffTime;
  final int teamH;
  final int teamA;
  final int? teamHScore;
  final int? teamAScore;
  final int teamHDifficulty;
  final int teamADifficulty;
  final bool finished;
  final bool started;

  factory FixtureItem.fromJson(Map<String, dynamic> json) => FixtureItem(
        id: _i(json['id']),
        event: _i(json['event']),
        kickoffTime: json['kickoffTime'] == null
            ? null
            : DateTime.tryParse(json['kickoffTime'].toString())?.toLocal(),
        teamH: _i(json['teamH']),
        teamA: _i(json['teamA']),
        teamHScore: json['teamHScore'] == null ? null : _i(json['teamHScore']),
        teamAScore: json['teamAScore'] == null ? null : _i(json['teamAScore']),
        teamHDifficulty: _i(json['teamHDifficulty']),
        teamADifficulty: _i(json['teamADifficulty']),
        finished: json['finished'] == true,
        started: json['started'] == true,
      );
}

class GameEvent {
  GameEvent({
    required this.id,
    required this.name,
    required this.deadlineTime,
    required this.finished,
    required this.averageEntryScore,
  });

  final int id;
  final String name;
  final DateTime? deadlineTime;
  final bool finished;
  final int averageEntryScore;

  factory GameEvent.fromJson(Map<String, dynamic> json) => GameEvent(
        id: _i(json['id']),
        name: _s(json['name']),
        deadlineTime: json['deadlineTime'] == null
            ? null
            : DateTime.tryParse(json['deadlineTime'].toString())?.toLocal(),
        finished: json['finished'] == true,
        averageEntryScore: _i(json['averageEntryScore']),
      );
}

class SquadPick {
  SquadPick({
    required this.playerId,
    required this.isCaptain,
    required this.isViceCaptain,
    required this.player,
  });

  final int playerId;
  final bool isCaptain;
  final bool isViceCaptain;
  final Player player;

  factory SquadPick.fromJson(Map<String, dynamic> json) => SquadPick(
        playerId: _i(json['playerId']),
        isCaptain: json['isCaptain'] == true,
        isViceCaptain: json['isViceCaptain'] == true,
        player: Player.fromJson(json['player'] as Map<String, dynamic>),
      );
}

class SquadSummary {
  SquadSummary({
    required this.count,
    required this.spent,
    required this.remaining,
    required this.totalPoints,
    required this.expectedPoints,
    required this.complete,
  });

  final int count;
  final int spent;
  final int remaining;
  final int totalPoints;
  final double expectedPoints;
  final bool complete;

  factory SquadSummary.fromJson(Map<String, dynamic> json) => SquadSummary(
        count: _i(json['count']),
        spent: _i(json['spent']),
        remaining: _i(json['remaining']),
        totalPoints: _i(json['totalPoints']),
        expectedPoints: _d(json['expectedPoints']),
        complete: json['complete'] == true,
      );
}

class SquadData {
  SquadData({required this.picks, required this.summary});
  final List<SquadPick> picks;
  final SquadSummary summary;
}
