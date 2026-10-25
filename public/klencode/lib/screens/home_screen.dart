import 'package:flutter/material.dart';

import '../api/fpl_api.dart';
import '../models.dart';
import '../theme.dart';
import '../widgets/player_tile.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.api});
  final FplApi api;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<OverviewData> _future = widget.api.overview();
  bool _syncing = false;

  Future<void> _refresh() async {
    setState(() => _future = widget.api.overview());
    await _future;
  }

  Future<void> _sync() async {
    setState(() => _syncing = true);
    try {
      await widget.api.sync(); // مزامنة الخادم مع FPL الرسمية
      await _refresh();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('✅ تم تحديث البيانات من FPL')),
        );
      }
    } finally {
      if (mounted) setState(() => _syncing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('مركز إحصائيات الفانتازي'),
        actions: [
          IconButton(
            onPressed: _syncing ? null : _sync,
            icon: _syncing
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.refresh),
          ),
        ],
      ),
      body: FutureBuilder<OverviewData>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return _ErrorView(error: '${snapshot.error}', onRetry: _refresh);
          }
          final data = snapshot.data!;
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView(
              padding: const EdgeInsets.only(bottom: 24),
              children: [
                _GameweekCard(current: data.current, next: data.next),
                _section('الأعلى نقاطاً', 'إجمالي نقاط الموسم', data.topPoints,
                    (p) => '${p.totalPoints}', 'نقطة'),
                _section('الأفضل فورمة', 'معدل آخر الجولات', data.topForm,
                    (p) => p.form.toStringAsFixed(1), 'فورمة'),
                _section('أفضل قيمة/سعر', 'نقاط لكل مليون', data.topValue,
                    (p) => p.valueSeason.toStringAsFixed(1), 'ن/م'),
                _section('الأكثر اختياراً', 'نسبة الملكية', data.mostOwned,
                    (p) => '${p.selectedByPercent.toStringAsFixed(1)}%', 'ملكية'),
                _section('أعلى xGI', 'أهداف + صناعة متوقعة', data.topXgi,
                    (p) => p.expectedGoalInvolvements.toStringAsFixed(2), 'xGI'),
                _section('أوراق مميزة', 'ملكية أقل من 7%', data.differentials,
                    (p) => p.form.toStringAsFixed(1), 'فورمة'),
                _section('ارتفاع الأسعار 📈', 'منذ بداية الموسم', data.risers,
                    (p) => '+£${(p.costChangeStart / 10).toStringAsFixed(1)}',
                    'تغيّر'),
                _section('انخفاض الأسعار 📉', 'احذر قبل البيع', data.fallers,
                    (p) => '£${(p.costChangeStart / 10).toStringAsFixed(1)}',
                    'تغيّر'),
                if (data.injuries.isNotEmpty)
                  SectionCard(
                    title: 'إصابات وشكوك',
                    subtitle: 'لاعبون بملكية عالية وحالتهم غير جاهزة',
                    children: data.injuries
                        .map(
                          (p) => ListTile(
                            dense: true,
                            title: Text(
                              '${p.webName} (${p.teamShort})',
                              style: const TextStyle(
                                  fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                            subtitle: Text(
                              p.news.isEmpty ? 'حالة غير مؤكدة' : p.news,
                              style: const TextStyle(fontSize: 11),
                            ),
                            trailing: Text(
                              '${p.selectedByPercent.toStringAsFixed(1)}%',
                              style: const TextStyle(
                                  color: Colors.redAccent, fontSize: 12),
                            ),
                          ),
                        )
                        .toList(),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _section(
    String title,
    String subtitle,
    List<Player> players,
    String Function(Player) metric,
    String label,
  ) {
    if (players.isEmpty) return const SizedBox.shrink();
    return SectionCard(
      title: title,
      subtitle: subtitle,
      children: [
        for (var i = 0; i < players.length; i++)
          PlayerTile(
            player: players[i],
            rank: i + 1,
            metric: metric(players[i]),
            metricLabel: label,
          ),
      ],
    );
  }
}

class _GameweekCard extends StatelessWidget {
  const _GameweekCard({this.current, this.next});
  final GameEvent? current;
  final GameEvent? next;

  @override
  Widget build(BuildContext context) {
    String fmt(DateTime? date) => date == null
        ? '—'
        : '${date.day}/${date.month} - ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';

    return Card(
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            colors: [kGreen.withOpacity(0.18), Colors.transparent],
            begin: Alignment.topRight,
            end: Alignment.bottomLeft,
          ),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Fantasy Premier League',
              style: TextStyle(color: kGreen, fontSize: 11),
            ),
            const SizedBox(height: 4),
            Text(
              current?.name ?? 'الجولة الحالية',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 6),
            Text(
              'متوسط نقاط الجولة: ${current?.averageEntryScore ?? 0}',
              style: const TextStyle(fontSize: 12, color: Colors.white70),
            ),
            Text(
              'الجولة القادمة: ${next?.name ?? '—'} · الموعد النهائي ${fmt(next?.deadlineTime)}',
              style: const TextStyle(fontSize: 12, color: Colors.white70),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.error, required this.onRetry});
  final String error;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off, size: 40, color: Colors.white38),
            const SizedBox(height: 12),
            Text(
              'تعذر جلب البيانات\n$error',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: Colors.white70),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () => onRetry(),
              child: const Text('إعادة المحاولة'),
            ),
          ],
        ),
      ),
    );
  }
}
