import 'package:flutter/material.dart';

import '../api/fpl_api.dart';
import '../config.dart';
import '../models.dart';
import '../theme.dart';

class FixturesScreen extends StatefulWidget {
  const FixturesScreen({super.key, required this.api});
  final FplApi api;

  @override
  State<FixturesScreen> createState() => _FixturesScreenState();
}

class _FixturesScreenState extends State<FixturesScreen> {
  int? _event;
  late Future<_Bundle> _future = _load();

  Future<_Bundle> _load() async {
    final teams = await widget.api.teams();
    final data = await widget.api.fixtures(event: _event);
    return _Bundle(teams: teams, data: data);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('المباريات وصعوبتها')),
      body: FutureBuilder<_Bundle>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('⚠️ ${snapshot.error}'));
          }
          final bundle = snapshot.data!;
          final teamMap = {for (final t in bundle.teams) t.id: t};
          final events = bundle.data.events;
          final fixtures = bundle.data.fixtures;

          return Column(
            children: [
              SizedBox(
                height: 52,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  children: events
                      .map(
                        (event) => Padding(
                          padding: const EdgeInsets.only(left: 6, top: 8),
                          child: ChoiceChip(
                            label: Text('${event.id}'),
                            selected: _event == event.id,
                            onSelected: (_) {
                              setState(() {
                                _event = event.id;
                                _future = _load();
                              });
                            },
                          ),
                        ),
                      )
                      .toList(),
                ),
              ),
              Expanded(
                child: ListView.builder(
                  itemCount: fixtures.length,
                  itemBuilder: (context, index) {
                    final fixture = fixtures[index];
                    final home = teamMap[fixture.teamH];
                    final away = teamMap[fixture.teamA];
                    final kickoff = fixture.kickoffTime;
                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                        child: Row(
                          children: [
                            _fdrBadge(fixture.teamHDifficulty),
                            const SizedBox(width: 6),
                            if (home != null)
                              Image.network(teamBadge(home.code),
                                  width: 22,
                                  height: 22,
                                  errorBuilder: (_, __, ___) =>
                                      const SizedBox(width: 22)),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(home?.shortName ?? '?',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold)),
                            ),
                            Column(
                              children: [
                                Text(
                                  fixture.started || fixture.finished
                                      ? '${fixture.teamHScore ?? 0} - ${fixture.teamAScore ?? 0}'
                                      : (kickoff == null
                                          ? '—'
                                          : '${kickoff.day}/${kickoff.month} ${kickoff.hour.toString().padLeft(2, '0')}:${kickoff.minute.toString().padLeft(2, '0')}'),
                                  style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize:
                                        fixture.finished || fixture.started
                                            ? 16
                                            : 11,
                                    color: fixture.finished || fixture.started
                                        ? kGreen
                                        : Colors.white70,
                                  ),
                                ),
                                Text(
                                  fixture.finished
                                      ? 'انتهت'
                                      : fixture.started
                                          ? 'جارية'
                                          : 'لم تبدأ',
                                  style: const TextStyle(
                                      fontSize: 9, color: Colors.white38),
                                ),
                              ],
                            ),
                            Expanded(
                              child: Align(
                                alignment: Alignment.centerLeft,
                                child: Text(away?.shortName ?? '?',
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold)),
                              ),
                            ),
                            if (away != null)
                              Image.network(teamBadge(away.code),
                                  width: 22,
                                  height: 22,
                                  errorBuilder: (_, __, ___) =>
                                      const SizedBox(width: 22)),
                            const SizedBox(width: 6),
                            _fdrBadge(fixture.teamADifficulty),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _fdrBadge(int difficulty) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          color: fdrColor(difficulty),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text('$difficulty',
            style: const TextStyle(
                fontSize: 11,
                color: Colors.black,
                fontWeight: FontWeight.w900)),
      );
}

class _Bundle {
  _Bundle({required this.teams, required this.data});
  final List<Team> teams;
  final FixturesData data;
}
