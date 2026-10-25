import 'package:flutter/material.dart';

import 'api/fpl_api.dart';
import 'screens/fixtures_screen.dart';
import 'screens/home_screen.dart';
import 'screens/manager_screen.dart';
import 'screens/players_screen.dart';
import 'screens/squad_screen.dart';
import 'theme.dart';

void main() => runApp(const FplApp());

class FplApp extends StatelessWidget {
  const FplApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'فانتازي بريميرليغ',
      debugShowCheckedModeBanner: false,
      theme: buildFplTheme(),
      builder: (context, child) => Directionality(
        textDirection: TextDirection.rtl,
        child: child ?? const SizedBox.shrink(),
      ),
      home: const RootPage(),
    );
  }
}

class RootPage extends StatefulWidget {
  const RootPage({super.key});

  @override
  State<RootPage> createState() => _RootPageState();
}

class _RootPageState extends State<RootPage> {
  final FplApi _api = FplApi();
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      HomeScreen(api: _api),
      PlayersScreen(api: _api),
      SquadScreen(api: _api),
      FixturesScreen(api: _api),
      ManagerScreen(api: _api),
    ];

    return Scaffold(
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (value) => setState(() => _index = value),
        items: const [
          BottomNavigationBarItem(
              icon: Icon(Icons.insights), label: 'الإحصائيات'),
          BottomNavigationBarItem(
              icon: Icon(Icons.sports_soccer), label: 'اللاعبون'),
          BottomNavigationBarItem(
              icon: Icon(Icons.grid_view), label: 'تشكيلتي'),
          BottomNavigationBarItem(
              icon: Icon(Icons.calendar_month), label: 'المباريات'),
          BottomNavigationBarItem(
              icon: Icon(Icons.person), label: 'حسابي'),
        ],
      ),
    );
  }
}
