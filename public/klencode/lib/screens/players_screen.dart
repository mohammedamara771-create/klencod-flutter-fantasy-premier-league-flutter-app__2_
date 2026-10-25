import 'dart:async';

import 'package:flutter/material.dart';

import '../api/fpl_api.dart';
import '../config.dart';
import '../models.dart';
import '../widgets/player_tile.dart';

const Map<String, String> kSorts = {
  'totalPoints': 'النقاط',
  'form': 'الفورمة',
  'valueSeason': 'القيمة/السعر',
  'nowCost': 'السعر',
  'selectedByPercent': 'الملكية',
  'pointsPerGame': 'نقاط/مباراة',
  'goalsScored': 'الأهداف',
  'assists': 'الصناعة',
  'cleanSheets': 'شباك نظيفة',
  'saves': 'التصديات',
  'bonus': 'نقاط البونص',
  'ictIndex': 'مؤشر ICT',
  'expectedGoals': 'xG',
  'expectedAssists': 'xA',
  'expectedGoalInvolvements': 'xGI',
  'minutes': 'الدقائق',
  'epNext': 'النقاط المتوقعة',
};

class PlayersScreen extends StatefulWidget {
  const PlayersScreen({super.key, required this.api});
  final FplApi api;

  @override
  State<PlayersScreen> createState() => _PlayersScreenState();
}

class _PlayersScreenState extends State<PlayersScreen> {
  final TextEditingController _controller = TextEditingController();
  Timer? _debounce;
  String _search = '';
  int _position = 0;
  String _sort = 'totalPoints';
  bool _availableOnly = false;
  late Future<List<Player>> _future = _load();

  Future<List<Player>> _load() => widget.api.players(
        search: _search,
        position: _position,
        sort: _sort,
        availableOnly: _availableOnly,
        limit: 80,
      );

  void _reload() => setState(() => _future = _load());

  void _onSearch(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () {
      _search = value;
      _reload();
    });
  }

  Future<void> _addToSquad(Player player) async {
    try {
      await widget.api.squadAction(playerId: player.id, action: 'add');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('✅ أُضيف ${player.webName} إلى تشكيلتك')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('⚠️ $error')));
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('قاعدة بيانات اللاعبين')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 4),
            child: TextField(
              controller: _controller,
              onChanged: _onSearch,
              decoration: const InputDecoration(
                hintText: 'ابحث عن لاعب… مثال: Salah',
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),
          SizedBox(
            height: 44,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
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
                Padding(
                  padding: const EdgeInsets.only(left: 6),
                  child: FilterChip(
                    label: const Text('الجاهزون فقط'),
                    selected: _availableOnly,
                    onSelected: (value) {
                      _availableOnly = value;
                      _reload();
                    },
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            child: Row(
              children: [
                const Text('ترتيب حسب: ', style: TextStyle(fontSize: 12)),
                Expanded(
                  child: DropdownButton<String>(
                    value: _sort,
                    isExpanded: true,
                    underline: const SizedBox.shrink(),
                    items: kSorts.entries
                        .map(
                          (e) => DropdownMenuItem(
                            value: e.key,
                            child: Text(e.value,
                                style: const TextStyle(fontSize: 13)),
                          ),
                        )
                        .toList(),
                    onChanged: (value) {
                      if (value == null) return;
                      _sort = value;
                      _reload();
                    },
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Player>>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(child: Text('⚠️ ${snapshot.error}'));
                }
                final players = snapshot.data ?? const <Player>[];
                if (players.isEmpty) {
                  return const Center(child: Text('لا توجد نتائج'));
                }
                return ListView.builder(
                  itemCount: players.length,
                  itemBuilder: (context, index) {
                    final player = players[index];
                    return PlayerTile(
                      player: player,
                      rank: index + 1,
                      trailingAction: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                '${player.totalPoints}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF00FF87),
                                ),
                              ),
                              Text(
                                'فورمة ${player.form.toStringAsFixed(1)}',
                                style: const TextStyle(
                                    fontSize: 10, color: Colors.white38),
                              ),
                            ],
                          ),
                          IconButton(
                            tooltip: 'أضف إلى تشكيلتي',
                            icon: const Icon(Icons.add_circle_outline,
                                color: Color(0xFF04F5FF)),
                            onPressed: () => _addToSquad(player),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
