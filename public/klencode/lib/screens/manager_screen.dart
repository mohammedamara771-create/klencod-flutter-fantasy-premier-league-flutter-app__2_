import 'package:flutter/material.dart';

import '../api/fpl_api.dart';
import '../config.dart';
import '../theme.dart';

class ManagerScreen extends StatefulWidget {
  const ManagerScreen({super.key, required this.api});
  final FplApi api;

  @override
  State<ManagerScreen> createState() => _ManagerScreenState();
}

class _ManagerScreenState extends State<ManagerScreen> {
  final TextEditingController _controller = TextEditingController();
  Map<String, dynamic>? _data;
  String? _error;
  bool _loading = false;

  Future<void> _lookup() async {
    final id = int.tryParse(_controller.text.trim());
    if (id == null) {
      setState(() => _error = 'أدخل رقم فريق صحيح');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await widget.api.manager(id);
      if (data['ok'] != true) {
        setState(() {
          _data = null;
          _error = data['message']?.toString() ?? 'تعذر جلب البيانات';
        });
      } else {
        setState(() => _data = data);
      }
    } catch (error) {
      setState(() {
        _data = null;
        _error = '$error';
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final entry = _data?['entry'] as Map<String, dynamic>?;
    final history = _data?['history'] as Map<String, dynamic>?;
    final current = (history?['current'] as List?) ?? const [];

    return Scaffold(
      appBar: AppBar(title: const Text('حسابي في FPL')),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          const Text(
            'أدخل رقم فريقك (Team ID) الموجود في رابط صفحة النقاط على الموقع الرسمي:\nfantasy.premierleague.com/entry/1234567/event/1',
            style: TextStyle(fontSize: 12, color: Colors.white70),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(hintText: 'مثال: 1234567'),
                ),
              ),
              const SizedBox(width: 8),
              FilledButton(
                onPressed: _loading ? null : _lookup,
                child: Text(_loading ? '...' : 'عرض'),
              ),
            ],
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text('⚠️ $_error',
                  style: const TextStyle(color: Colors.redAccent)),
            ),
          if (entry != null) ...[
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${entry['name']}',
                        style: const TextStyle(
                            fontSize: 18, fontWeight: FontWeight.w900)),
                    Text(
                      '${entry['player_first_name']} ${entry['player_last_name']}',
                      style: const TextStyle(
                          fontSize: 12, color: Colors.white70),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: [
                        _metric('إجمالي النقاط',
                            '${entry['summary_overall_points'] ?? 0}', kGreen),
                        _metric(
                            'الترتيب العالمي',
                            '${entry['summary_overall_rank'] ?? '—'}',
                            kCyan),
                        _metric('نقاط آخر جولة',
                            '${entry['summary_event_points'] ?? 0}',
                            Colors.orangeAccent),
                        _metric(
                          'قيمة الفريق',
                          '£${money(((entry['last_deadline_value'] ?? 0) as num) + ((entry['last_deadline_bank'] ?? 0) as num))}م',
                          Colors.pinkAccent,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('الأداء جولة بجولة',
                        style: TextStyle(fontWeight: FontWeight.w900)),
                    const SizedBox(height: 8),
                    ...current.map((raw) {
                      final row = raw as Map<String, dynamic>;
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Row(
                          children: [
                            SizedBox(
                                width: 42,
                                child: Text('GW${row['event']}',
                                    style: const TextStyle(fontSize: 11))),
                            Expanded(
                              child: Text(
                                'الإجمالي ${row['total_points']} · ترتيب ${row['overall_rank'] ?? '—'} · احتياط ${row['points_on_bench']}',
                                style: const TextStyle(
                                    fontSize: 11, color: Colors.white70),
                              ),
                            ),
                            Text('${row['points']}',
                                style: const TextStyle(
                                    fontWeight: FontWeight.w900,
                                    color: kGreen)),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _metric(String label, String value, Color color) => Container(
        width: 150,
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: const TextStyle(fontSize: 10, color: Colors.white54)),
            Text(value,
                style: TextStyle(
                    fontSize: 18, fontWeight: FontWeight.w900, color: color)),
          ],
        ),
      );
}
