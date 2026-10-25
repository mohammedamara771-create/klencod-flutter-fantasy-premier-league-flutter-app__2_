import 'package:flutter/material.dart';

import '../config.dart';
import '../models.dart';
import '../screens/player_detail_screen.dart';

class PlayerTile extends StatelessWidget {
  const PlayerTile({
    super.key,
    required this.player,
    this.metric,
    this.metricLabel,
    this.rank,
    this.trailingAction,
  });

  final Player player;
  final String? metric;
  final String? metricLabel;
  final int? rank;
  final Widget? trailingAction;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      leading: SizedBox(
        width: 58,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (rank != null)
              SizedBox(
                width: 18,
                child: Text(
                  '$rank',
                  style: const TextStyle(fontSize: 11, color: Colors.white54),
                ),
              ),
            CircleAvatar(
              radius: 18,
              backgroundColor: Colors.white10,
              backgroundImage: NetworkImage(playerPhoto(player.code)),
            ),
          ],
        ),
      ),
      title: Text(
        player.webName,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
      ),
      subtitle: Text(
        '${player.teamShort} · ${kPositionsShort[player.elementType] ?? ''} · £${player.price}م',
        style: const TextStyle(fontSize: 11, color: Colors.white60),
      ),
      trailing: trailingAction ??
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                metric ?? '${player.totalPoints}',
                style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF00FF87),
                  fontSize: 15,
                ),
              ),
              if (metricLabel != null)
                Text(
                  metricLabel!,
                  style: const TextStyle(fontSize: 10, color: Colors.white38),
                ),
            ],
          ),
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => PlayerDetailScreen(playerId: player.id),
        ),
      ),
    );
  }
}

class SectionCard extends StatelessWidget {
  const SectionCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.children,
  });

  final String title;
  final String subtitle;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 2, 14, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 15,
                    ),
                  ),
                  Text(
                    subtitle,
                    style:
                        const TextStyle(fontSize: 11, color: Colors.white38),
                  ),
                ],
              ),
            ),
            ...children,
          ],
        ),
      ),
    );
  }
}
