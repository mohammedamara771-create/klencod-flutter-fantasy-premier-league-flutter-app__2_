# تطبيق فانتازي الدوري الإنجليزي — مشروع Flutter جاهز (KlenCode IDE / GitHub Actions)

تطبيق جوال يعرض كل إحصائيات لعبة فانتازي الدوري الإنجليزي الممتاز،
ويجلب بياناته من الواجهة الرسمية `fantasy.premierleague.com/api` عبر خادم هذا المشروع.

> **مهم جداً:** محتويات هذا الملف المضغوط يجب أن تكون في **جذر المستودع**،
> أي أن `pubspec.yaml` يقع مباشرة بجانب `lib/` و`android/` وليس داخل مجلد فرعي.

---

## حل خطأ: `Expected to find project root in current working directory`

الخطأ يعني أن `flutter pub get` لم يجد `pubspec.yaml` في المجلد الذي يعمل فيه.

**الحل المضمون:** استخدم ملف `.github/workflows/build-apk.yml` المرفق — فهو **ذاتي الإصلاح**:

- يبحث عن `pubspec.yaml` في أي مجلد داخل المستودع ويبني من داخله تلقائياً.
- إذا لم يجد `pubspec.yaml` إطلاقاً، **ينشئ مشروع Flutter كاملاً** من ملف `main.dart` الموجود.
- يعيد توليد `android/` ليطابق إصدار Flutter على الرانر (يمنع أخطاء Gradle).
- يضيف حزمة `http` وصلاحية الإنترنت تلقائياً.

### خطوتان مهمتان

1. **احذف ملف الـ workflow القديم** من `.github/workflows/` — وجود ملفين يجعل القديم يفشل باستمرار.
2. ضع الملف الجديد بالمسار الدقيق: `.github/workflows/build-apk.yml` ثم Commit.

ثم: تبويب **Actions** ← شغّل **بناء تطبيق APK** ← نزّل `fpl-stats-apk` من Artifacts.

### الشكل المثالي لجذر المستودع

```
pubspec.yaml
analysis_options.yaml
README.md
.gitignore
lib/
android/
.github/workflows/build-apk.yml
```

> ملاحظة: حتى لو لم يكن هذا هو ترتيبك، سيعمل الـ workflow الجديد على أي حال.

---

## بناء APK تلقائياً (GitHub Actions)

الحزمة تحتوي على `.github/workflows/build-apk.yml` الذي:
1. يتحقق من وجود `pubspec.yaml` في الجذر ويعطي رسالة واضحة إن لم يوجد.
2. يعيد توليد مجلد `android/` بما يطابق **إصدار Flutter المثبّت على الرانر** (يمنع أخطاء Gradle/AGP).
3. يضيف صلاحية الإنترنت تلقائياً إلى `AndroidManifest.xml`.
4. ينفّذ `flutter pub get` ثم `flutter build apk --release`.
5. يرفع ملف `app-release.apk` كـ Artifact يمكنك تنزيله من صفحة التشغيل.

بعد رفع الملفات: افتح تبويب **Actions** → شغّل **بناء تطبيق APK** → نزّل `fpl-stats-apk`.

---

## التشغيل داخل KlenCode IDE

### الطريقة 1 — المشروع الكامل
1. ارفع/افتح محتويات الحزمة كمشروع.
2. اضغط **Pub Get**.
3. اضغط **Run ▶** أو **Build APK**.

### الطريقة 2 — ملف واحد (الأسرع للتجربة)
1. أنشئ مشروع Flutter جديد.
2. أضف في `pubspec.yaml` تحت `dependencies`: `http: ^1.2.2`
3. الصق محتوى `single_file/main.dart` في `lib/main.dart`.
4. Pub Get ثم Run.

---

## ضبط عنوان الخادم

في `lib/config.dart` (أو أعلى `single_file/main.dart`):

```dart
const String kBaseUrl = 'https://عنوان-موقعك';
```

عند تنزيل الحزمة من صفحة «تحميل تطبيق Flutter» داخل الموقع يكون العنوان **مضبوطاً تلقائياً**.

---

## محتوى المشروع

```
pubspec.yaml                 إعدادات الحزم (http)
analysis_options.yaml
.gitignore
.github/workflows/build-apk.yml   بناء APK تلقائياً
android/                     مشروع أندرويد (صلاحية إنترنت مفعّلة)
lib/
 ├─ main.dart                التنقل بين 5 تبويبات
 ├─ config.dart              عنوان الخادم والثوابت
 ├─ theme.dart               ثيم ألوان FPL
 ├─ models.dart              نماذج البيانات
 ├─ api/fpl_api.dart         عميل REST كامل
 ├─ widgets/player_tile.dart
 └─ screens/                 home · players · player_detail · fixtures · squad · manager
single_file/main.dart        نسخة ملف واحد
```

## الشاشات

| الشاشة | المحتوى |
|---|---|
| الإحصائيات | الجولة الحالية/القادمة، الأعلى نقاطاً، الفورمة، القيمة، الملكية، xGI، الأوراق المميزة، الأسعار، الإصابات |
| اللاعبون | بحث + فلترة بالمركز + 17 طريقة ترتيب + إضافة للتشكيلة |
| بطاقة اللاعب | كل الإحصائيات والمؤشرات المتقدمة + المباريات القادمة (FDR) + سجل الجولات |
| تشكيلتي | ميزانية 100م، قيود المراكز، الكابتن والنائب، حذف لاعب |
| المباريات | اختيار الجولة + النتائج + درجة الصعوبة |
| حسابي | إحصائيات حسابك في FPL عبر Team ID |

## واجهات الخادم المستخدمة

```
GET    /api/overview
GET    /api/players?search=&position=&team=&sort=&limit=
GET    /api/players/{id}
GET    /api/teams
GET    /api/fixtures?event=
GET    /api/manager/{teamId}
GET    /api/squad        POST /api/squad       DELETE /api/squad?playerId=
GET    /api/watchlist    POST /api/watchlist   DELETE /api/watchlist?playerId=
POST   /api/sync
```

> هذا المشروع غير تابع رسمياً للدوري الإنجليزي الممتاز، والبيانات مصدرها الواجهة العامة للعبة.
