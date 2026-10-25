import 'package:flutter/material.dart';

import '../api/fpl_api.dart';
import '../config.dart';
import '../theme.dart';

class PlayerDetailScreen extends StatefulWidget {
  const PlayerDetailScreen({super.key, required this.playerId, this.api});

  final int playerId;
  final FplApi? api;

  @override
  State<PlayerDetailScreen> createState() => _PlayerDetailScreenState();
}

class _PlayerDetailScreenState extends State<PlayerDetailScreen> {
  late final FplApi _api = widget.api ?? FplApi();
  late final Future<PlayerDetail> _future = _api.player(widget.playerId);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('بطاقة اللاعب')),
      body: FutureBuilder<PlayerDetail>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('⚠️ ${snapshot.error}'));
          }
          final detail = snapshot.data!;
          final player = detail.player;

          return ListView(
            padding: const EdgeInsets.only(bottom: 24),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          playerPhoto(player.code),
                          width: 72,
                          height: 86,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            width: 72,
                            height: 86,
                            color: Colors.white10,
                            child: const Icon(Icons.person),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              player.fullName.isEmpty
                                  ? player.webName
                                  : player.fullName,
                              style: const TextStyle(
                                  fontSize: 18, fontWeight: FontWeight.w900),
                            ),
                            Text(
                              '${player.teamName} · ${kPositions[player.elementType] ?? ''}',
                              style: const TextStyle(
                                  fontSize: 12, color: Colors.white70),
                            ),
                            const SizedBox(height: 6),
                            Wrap(
                              spacing: 6,
                              children: [
                                _pill('£${player.price}م', kCyan),
                                _pill('${player.totalPoints} نقطة', kGreen),
                                _pill(
                                  'فورمة ${player.form.toStringAsFixed(1)}',
                                  Colors.orangeAccent,
                                ),
                                _pill(
                                  '${player.selectedByPercent.toStringAsFixed(1)}% ملكية',
                                  Colors.pinkAccent,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (player.news.isNotEmpty)
                Card(
                  color: Colors.orange.withOpacity(0.12),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Text('⚠️ ${player.news}',
                        style: const TextStyle(fontSize: 12)),
                  ),
                ),
              _statsCard('إحصائيات الموسم', {
                'الدقائق': '${player.minutes}',
                'الأهداف': '${player.goalsScored}',
                'الصناعة': '${player.assists}',
                'شباك نظيفة': '${player.cleanSheets}',
                'التصديات': '${player.saves}',
                'نقاط البونص': '${player.bonus}',
                'BPS': '${player.bps}',
                'نقاط/مباراة': player.pointsPerGame.toStringAsFixed(1),
              }),
              _statsCard('المؤشرات المتقدمة', {
                'xG': player.expectedGoals.toStringAsFixed(2),
                'xA': player.expectedAssists.toStringAsFixed(2),
                'xGI': player.expectedGoalInvolvements.toStringAsFixed(2),
                'ICT': player.ictIndex.toStringAsFixed(1),
                'القيمة (ن/م)': player.valueSeason.toStringAsFixed(1),
                'متوقع الجولة': player.epNext.toStringAsFixed(1),
                'تغيّر السعر':
                    '£${(player.costChangeStart / 10).toStringAsFixed(1)}',
                'نقاط آخر جولة': '${player.eventPoints}',
              }),
              if (detail.upcoming.isNotEmpty)
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('المباريات القادمة (FDR)',
                            style: TextStyle(fontWeight: FontWeight.w900)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: detail.upcoming.take(8).map((fixture) {
                            final difficulty =
                                (fixture['difficulty'] as num?)?.toInt() ?? 3;
                            final isHome = fixture['is_home'] == true;
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: fdrColor(difficulty),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                '${fixture['event_name'] ?? ''} ${isHome ? '(أرض)' : '(خارج)'} · $difficulty',
                                style: const TextStyle(
                                    fontSize: 11,
                                    color: Colors.black,
                                    fontWeight: FontWeight.bold),
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                ),
              if (detail.history.isNotEmpty)
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('سجل الجولات',
                            style: TextStyle(fontWeight: FontWeight.w900)),
                        const SizedBox(height: 6),
                        ...detail.history.reversed.take(12).map((row) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4),
                            child: Row(
                              children: [
                                SizedBox(
                                  width: 34,
                                  child: Text('GW${row['round']}',
                                      style: const TextStyle(fontSize: 11)),
                                ),
                                Expanded(
                                  child: Text(
                                    '${row['minutes']} دقيقة · ${row['goals_scored']} هدف · ${row['assists']} صناعة · ${row['bonus']} بونص',
                                    style: const TextStyle(
                                        fontSize: 11, color: Colors.white70),
                                  ),
                                ),
                                Text(
                                  '${row['total_points']}',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w900,
                                      color: kGreen),
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _pill(String text, Color color) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: color.withOpacity(0.18),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(text,
            style: TextStyle(
                fontSize: 11, color: color, fontWeight: FontWeight.bold)),
      );

  Widget _statsCard(String title, Map<String, String> stats) => Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: stats.entries
                    .map(
                      (entry) => Container(
                        width: 100,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(entry.key,
                                style: const TextStyle(
                                    fontSize: 10, color: Colors.white54)),
                            Text(entry.value,
                                style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w900)),
                          ],
                        ),
                      ),
                    )
                    .toList(),
              ),
            ],
          ),
        ),
      );
}
