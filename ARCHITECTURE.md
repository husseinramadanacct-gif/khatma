# الوثيقة المعمارية الفنية الشاملة — تطبيق «خاتمة» (Khatmah)
> **رفيقك في ختم القرآن الكريم**

---

## 1. المعمارية العامة للنظام (Technical Architecture)

يعتمد تطبيق «خاتمة» على معمارية **Modular Client-First / Provider-Based Architecture** تضمن:
1. **العمل دون اتصال بالإنترنت (Offline-Ready)** عبر IndexedDB والتخزين المحلي الموثوق.
2. **عدم اختلاق أو توليد أي بيانات قرآنية** عبر طبقة موحدة من الـ Adapters والـ Providers المرتبطة بمصادر موثوقة ومفتوحة الترخيص (Al-Quran Cloud, Quran.com API v4, EveryAyah CDN).
3. **فصل منطق الأعمال (Business Logic) تمامًا عن واجهات العرض (UI Presentation)**.
4. **دعم تعدد الختمات** مع حسابات دقيقة للورد، والتعويض المرن غير الضاغط.
5. **دقة الحفظ والاسترجاع (Surah + Ayah Canonical Addressing)**، حيث لا يتم الاعتماد على رقم الصفحة بمفرده بل على معرف السورة والآية المرجعي.

```
+-------------------------------------------------------------------------+
|                           User Interface (UI)                           |
|  [Home / Wird]   [Quran Reader]   [Khatmat Manager]   [Search]   [Settings] |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                  Application State Layer (Hooks / Stores)                |
|  • useKhatmahStore (Active Khatmah, Progress, Dynamic Wird Calculation)  |
|  • useReadingPosition (Canonical Surah+Ayah sync)                       |
|  • useAudioPlayer (Verse-synchronized audio playback, Speed, Reciter)   |
|  • useSettingsStore (Theme, Fonts, Spacing, Tajweed toggle)             |
|  • useBookmarksStore (Saved bookmarks, notes)                           |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                  Abstraction Provider Interfaces                         |
|  • IQuranProvider     (Fetch Surahs, Ayahs, Pages, Juz metadata)        |
|  • IReciterProvider   (List verified reciters, recitations)             |
|  • IAudioProvider     (Stream genuine verse audio, EveryAyah CDN)       |
|  • ITafsirProvider    (Fetch authentic Tafsir Al-Muyassar)              |
|  • ITajweedProvider   (Parse verified Tajweed rules / markings)         |
|  • INotificationSvc   (Schedule local alerts, wird reminders)           |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                         Data & Storage Services                         |
|  • IndexedDB / LocalStorage Repository (Offline Quran Text, Khatmat)    |
|  • Verified Remote Endpoints (AlQuran.cloud / EveryAyah / Tanzil)        |
+-------------------------------------------------------------------------+
```

---

## 2. نموذج قاعدة البيانات (Database ERD & Schema)

### Entity-Relationship Overview:

```
+------------------+       1:N       +----------------------+
|     Khatmah      | --------------> |      DailyWird       |
+------------------+                 +----------------------+
| id (PK, UUID)    |                 | id (PK, UUID)        |
| title            |                 | khatmahId (FK)       |
| targetDays       |                 | dayIndex (1..N)      |
| paceType         |                 | targetType (pages..) |
| paceAmount       |                 | startSurah, startAyah|
| reminderTime     |                 | endSurah, endAyah    |
| reminderEnabled  |                 | isCompleted          |
| status (active..) |                | completedAt          |
| createdAt        |                 +----------------------+
| updatedAt        |
+------------------+
        |
        | 1:1
        v
+----------------------+
|   ReadingPosition    |
+----------------------+
| khatmahId (FK)       |
| surahNumber (1..114) |
| ayahNumber (1..N)    |
| pageNumber (1..604)  |
| juzNumber (1..30)    |
| updatedAt            |
+----------------------+

+----------------------+             +----------------------+
|       Bookmark       |             |   UserPreference     |
+----------------------+             +----------------------+
| id (PK, UUID)        |             | theme (light/dark)   |
| surahNumber          |             | quranFont            |
| ayahNumber           |             | fontSize             |
| pageNumber           |             | lineSpacing          |
| note (optional)      |             | showTajweed (bool)   |
| createdAt            |             | defaultReciterId     |
+----------------------+             | audioSpeed           |
                                     | notificationAllowed  |
                                     +----------------------+
```

---

## 3. عقود الواجهات والـ Providers (Provider Architecture & API Contracts)

### 3.1 IQuranProvider
```typescript
export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  startPage: number;
}

export interface Ayah {
  number: number;             // Global verse number (1..6236)
  numberInSurah: number;      // Verse number within surah
  text: string;               // Authentic Uthmani script
  surahNumber: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | object;
}

export interface IQuranProvider {
  getSurahs(): Promise<SurahMeta[]>;
  getSurah(number: number): Promise<{ meta: SurahMeta; ayahs: Ayah[] }>;
  getPage(pageNumber: number): Promise<{ pageNumber: number; ayahs: Ayah[] }>;
  getJuz(juzNumber: number): Promise<{ juzNumber: number; ayahs: Ayah[] }>;
  search(query: string): Promise<SearchResult[]>;
}
```

### 3.2 IReciterProvider & IAudioProvider
```typescript
export interface Reciter {
  id: string;
  name: string;
  subfolder: string;         // EveryAyah subfolder or AlQuran identifier
  bitrate: string;
  style: string;             // 'حفص عن عاصم - مرتل'
}

export interface IAudioProvider {
  getAyahAudioUrl(reciterId: string, surah: number, ayah: number): string;
}
```

### 3.3 ITafsirProvider
```typescript
export interface AyahTafsir {
  surahNumber: number;
  ayahNumber: number;
  tafsirName: string;
  text: string;
}

export interface ITafsirProvider {
  getTafsir(surah: number, ayah: number, edition?: string): Promise<AyahTafsir>;
}
```

---

## 4. خطة الحسابات الرياضية للورد والتعويض (Wird Calculation Engine)

1. **إجمالي صفحات المصحف الشريف**: 604 صفحة.
2. **الورد الثابت**:
   - صفحات: مثلاً 5 صفحات يوميًا = 604 / 5 ≈ 121 يومًا.
   - أجزاء: جزء يوميًا = 30 يومًا.
   - أحزاب: حزب يوميًا (نصف جزء) = 60 يومًا.
3. **الورد المتغير حسب الأيام (Target Days)**:
   - المستخدم يحدد 30 يومًا -> الورد الأساسي = 604 / 30 = 20.13 صفحة/يوم (~ 1 جزء يوميًا).
4. **خوارزمية التعويض المرن (Missed Wird Compensation)**:
   - عند تأخر المستخدم أيامًا دون قراءة، لا نلومه، بل نقدم خيارات:
     1. **التعويض التدريجي**: توزيع الصفحات الفائتة على الأيام المتبقية مع سقف منطقي لا يتجاوز 1.5x من الورد اليومي الأصلي.
     2. **تمديد تاريخ الختم**: الحفاظ على وتيرة القراءة المريحة ذاتها وتأجيل موعد النهاية بعدد أيام الانقطاع.
     3. **تخطي الفائت**: اعتبار الورد الحالي يبدأ من موقعه الحالي وإعادة جدولة المتبقي.

---

## 5. مصفوفة إدارة المخاطر (Risk Register)

| الخطر | المستوى | خطة التخفيف (Mitigation) |
|---|---|---|
| تحريف أو خطأ في النص القرآني | حرج | استخدام نصوص مصحف المدينة المنورة المعتمدة من مجمع الملك فهد عبر AlQuran.cloud API و tanzil.net، وعدم توليد أي آيات برمجيًا |
| انقطاع الإنترنت أو بطء الاتصال | مرتفع | تخزين بيانات السور المفهرسة محليًا في IndexedDB/LocalStorage، مع وضع Offline fallback واضح |
| اختلاف أرقام الصفحات بين الطبعات | متوسط | الاعتماد الحصري على السورة ورقم الآية كمعرف أساسي (Canonical Key)، واعتبار الصفحة معيارًا استرشاديًا |
| روابط صوتية معطوبة | متوسط | استخدام سيرفرات EveryAyah المعتمدة عالميًا والمستقرة منذ أكثر من عقد بصيغة `SSSAAA.mp3` |
| تشتيت القارئ بكثرة الأزرار والزخارف | منخفض | تصميم بسيط، هادئ، يراعي التركيز البصري والطباعة العربية الراقية (Amiri Quran) |
