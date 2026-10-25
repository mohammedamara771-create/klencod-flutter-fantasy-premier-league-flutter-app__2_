/// عنوان الخادم (هذا المشروع يعمل كواجهة REST للتطبيق).
/// إذا نزّلت الحزمة من صفحة "تطبيق Flutter" سيكون العنوان مضبوطاً تلقائياً.
const String kBaseUrl = '__BASE_URL__';

/// أسماء المراكز بالعربية
const Map<int, String> kPositions = {
  1: 'حارس مرمى',
  2: 'مدافع',
  3: 'وسط',
  4: 'مهاجم',
};

const Map<int, String> kPositionsShort = {
  1: 'GKP',
  2: 'DEF',
  3: 'MID',
  4: 'FWD',
};

String playerPhoto(int code) =>
    'https://resources.premierleague.com/premierleague/photos/players/110x140/p$code.png';

String teamBadge(int code) =>
    'https://resources.premierleague.com/premierleague/badges/70/t$code.png';

String money(num cost) => (cost / 10).toStringAsFixed(1);
