import 'package:flutter/material.dart';

const Color kPurple = Color(0xFF37003C);
const Color kDark = Color(0xFF1B0620);
const Color kGreen = Color(0xFF00FF87);
const Color kCyan = Color(0xFF04F5FF);

ThemeData buildFplTheme() {
  final base = ThemeData.dark(useMaterial3: true);
  return base.copyWith(
    scaffoldBackgroundColor: kDark,
    colorScheme: base.colorScheme.copyWith(
      primary: kGreen,
      secondary: kCyan,
      surface: const Color(0xFF240B2B),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: kPurple,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: true,
    ),
    // ملاحظة: لم نستخدم cardTheme لضمان التوافق مع كل إصدارات Flutter
    // (تغيّر نوعه بين CardTheme و CardThemeData في الإصدارات الحديثة).
    chipTheme: base.chipTheme.copyWith(
      backgroundColor: Colors.white.withOpacity(0.06),
      labelStyle: const TextStyle(fontSize: 12, color: Colors.white),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.black.withOpacity(0.3),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: kPurple,
      selectedItemColor: kGreen,
      unselectedItemColor: Colors.white60,
      type: BottomNavigationBarType.fixed,
      showUnselectedLabels: true,
    ),
  );
}

/// لون درجة صعوبة المباراة (FDR)
Color fdrColor(int difficulty) {
  if (difficulty <= 2) return const Color(0xFF2ECC71);
  if (difficulty == 3) return const Color(0xFF9E9E9E);
  if (difficulty == 4) return const Color(0xFFE67E22);
  return const Color(0xFFE74C3C);
}
