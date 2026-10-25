import 'package:flutter/material.dart';

import '../api/fpl_api.dart';
import '../config.dart';
import '../models.dart';
import '../theme.dart';

class SquadScreen extends StatefulWidget {
  const SquadScreen({super.key, required this.api});
  final FplApi api;

  @override
  State<SquadScreen> createState() => _SquadScreenState();
}

class _SquadScreenState extends State<SquadScreen> {
  late Future<SquadData> _future = widget.api.squad();

  void _reload() => setState(() => _future = widget.api.squad());

  Future<void> _run(Future<SquadData> Function() task) async {
    try {
      final data = await task();
      if (!mounted) return;
      setState(() => _future = Future.value(data));
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('⚠️ $error')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('تشكيلتي'),
        actions: [
          IconButton(
            tooltip: 'مسح التشكيلة',
            icon: const Icon(Icons.delete_outline),
            onPressed: () =>
                _run(() => widget.api.squadAction(action: 'clear')),
          ),
          IconButton(icon: const Icon(Icons.refresh), onPressed: _reload),
        ],
      ),
      body: FutureBuilder<SquadData>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('⚠️ ${snapshot.error}'));
          }
          final data = snapshot.data!;
          final summary = data.summary;

          return ListView(
            padding: const EdgeInsets.only(bottom: 24),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _metric('الميزانية المتبقية',
                              '£${money(summary.remaining)}م', kGreen),
                          _metric('اللاعبون', '${summary.count}/15', kCyan),
                          _metric('نقاط التشكيلة', '${summary.totalPoints}',
                              Colors.orangeAccent),
                        ],
                      ),
                      const SizedBox(height: 10),
                      LinearProgressIndicator(
                        value: (summary.spent / 1000).clamp(0.0, 1.0),
                        backgroundColor: Colors.white12,
                        color: kGreen,
                        minHeight: 6,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        summary.complete
                            ? '✅ التشكيلة مكتملة وصالحة'
                            : 'أكمل 15 لاعباً (2 حراس · 5 مدافعين · 5 وسط · 3 مهاجمين) بحد 3 لاعبين لكل نادٍ',
                        style: const TextStyle(
                            fontSize: 11, color: Colors.white70),
                      ),
                      Text(
                        'النقاط المتوقعة للجولة القادمة: ${summary.expectedPoints.toStringAsFixed(1)}',
                        style: const TextStyle(
                            fontSize: 11, color: Colors.white54),
                      ),
                    ],
                  ),
                ),
              ),
              if (data.picks.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(24),
                  child: Text(
                    'تشكيلتك فارغة — اذهب إلى تبويب «اللاعبون» واضغط ＋ لإضافة لاعبين.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white60),
                  ),
                ),
              for (final position in [1, 2, 3, 4])
                ..._positionSection(data, position),
            ],
          );
        },
      ),
    );
  }

  List<Widget> _positionSection(SquadData data, int position) {
    final picks = data.picks
        .where((pick) => pick.player.elementType == position)
        .toList();
    if (picks.isEmpty) return const [];
    return [
      Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
        child: Text(
          kPositions[position]!,
          style: const TextStyle(
              fontWeight: FontWeight.w900, color: kGreen, fontSize: 13),
        ),
      ),
      ...picks.map(
        (pick) => Card(
          margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.white10,
              backgroundImage: NetworkImage(playerPhoto(pick.player.code)),
            ),
            title: Row(
              children: [
                Flexible(
                  child: Text(pick.player.webName,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
                if (pick.isCaptain) _tag('C', kGreen),
                if (pick.isViceCaptain) _tag('V', kCyan),
              ],
            ),
            subtitle: Text(
              '${pick.player.teamShort} · £${pick.player.price}م · ${pick.player.totalPoints} نقطة',
              style: const TextStyle(fontSize: 11),
            ),
            trailing: PopupMenuButton<String>(
              onSelected: (value) {
                if (value == 'remove') {
                  _run(() => widget.api.removeFromSquad(pick.playerId));
                } else {
                  _run(() => widget.api
                      .squadAction(playerId: pick.playerId, action: value));
                }
              },
              itemBuilder: (_) => const [
                PopupMenuItem(value: 'captain', child: Text('تعيين كابتن')),
                PopupMenuItem(value: 'vice', child: Text('تعيين نائب الكابتن')),
                PopupMenuItem(value: 'remove', child: Text('إزالة من التشكيلة')),
              ],
            ),
          ),
        ),
      ),
    ];
  }

  Widget _metric(String label, String value, Color color) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: const TextStyle(fontSize: 10, color: Colors.white54)),
          Text(value,
              style: TextStyle(
                  fontSize: 18, fontWeight: FontWeight.w900, color: color)),
        ],
      );

  Widget _tag(String text, Color color) => Container(
        margin: const EdgeInsets.only(right: 4),
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
        decoration: BoxDecoration(
            color: color, borderRadius: BorderRadius.circular(20)),
        child: Text(text,
            style: const TextStyle(
                fontSize: 10,
                color: Colors.black,
                fontWeight: FontWeight.w900)),
      );
}
