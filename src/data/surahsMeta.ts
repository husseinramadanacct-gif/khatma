import { SurahMeta } from '../types';

/**
 * البيانات المعتمدة لجميع سور القرآن الكريم الـ 114
 * مطابقة لمصحف المدينة النبوية (مجمع الملك فهد لطباعة المصحف الشريف)
 */
export const SURAHS_METADATA: SurahMeta[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Faatiha", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan", startPage: 1, juzNumber: 1 },
  { number: 2, name: "البقرة", englishName: "Al-Baqara", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan", startPage: 2, juzNumber: 1 },
  { number: 3, name: "آل عمران", englishName: "Aal-i-Imraan", englishNameTranslation: "The Family of Imraan", numberOfAyahs: 200, revelationType: "Medinan", startPage: 50, juzNumber: 3 },
  { number: 4, name: "النساء", englishName: "An-Nisaa", englishNameTranslation: "The Women", numberOfAyahs: 176, revelationType: "Medinan", startPage: 77, juzNumber: 4 },
  { number: 5, name: "المائدة", englishName: "Al-Maaida", englishNameTranslation: "The Table", numberOfAyahs: 120, revelationType: "Medinan", startPage: 106, juzNumber: 6 },
  { number: 6, name: "الأنعام", englishName: "Al-An'aam", englishNameTranslation: "The Cattle", numberOfAyahs: 165, revelationType: "Meccan", startPage: 128, juzNumber: 7 },
  { number: 7, name: "الأعراف", englishName: "Al-A'raaf", englishNameTranslation: "The Heights", numberOfAyahs: 206, revelationType: "Meccan", startPage: 151, juzNumber: 8 },
  { number: 8, name: "الأنفال", englishName: "Al-Anfaal", englishNameTranslation: "The Spoils of War", numberOfAyahs: 75, revelationType: "Medinan", startPage: 177, juzNumber: 9 },
  { number: 9, name: "التوبة", englishName: "At-Tawba", englishNameTranslation: "The Repentance", numberOfAyahs: 129, revelationType: "Medinan", startPage: 187, juzNumber: 10 },
  { number: 10, name: "يونس", englishName: "Yunus", englishNameTranslation: "Jonah", numberOfAyahs: 109, revelationType: "Meccan", startPage: 208, juzNumber: 11 },
  { number: 11, name: "هود", englishName: "Hud", englishNameTranslation: "Hud", numberOfAyahs: 123, revelationType: "Meccan", startPage: 221, juzNumber: 11 },
  { number: 12, name: "يوسف", englishName: "Yusuf", englishNameTranslation: "Joseph", numberOfAyahs: 111, revelationType: "Meccan", startPage: 235, juzNumber: 12 },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", englishNameTranslation: "The Thunder", numberOfAyahs: 43, revelationType: "Medinan", startPage: 249, juzNumber: 13 },
  { number: 14, name: "ابراهيم", englishName: "Ibrahim", englishNameTranslation: "Abraham", numberOfAyahs: 52, revelationType: "Meccan", startPage: 255, juzNumber: 13 },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", englishNameTranslation: "The Rocky Tract", numberOfAyahs: 99, revelationType: "Meccan", startPage: 262, juzNumber: 14 },
  { number: 16, name: "النحل", englishName: "An-Nahl", englishNameTranslation: "The Bee", numberOfAyahs: 128, revelationType: "Meccan", startPage: 267, juzNumber: 14 },
  { number: 17, name: "الإسراء", englishName: "Al-Israa", englishNameTranslation: "The Night Journey", numberOfAyahs: 111, revelationType: "Meccan", startPage: 282, juzNumber: 15 },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", englishNameTranslation: "The Cave", numberOfAyahs: 110, revelationType: "Meccan", startPage: 293, juzNumber: 15 },
  { number: 19, name: "مريم", englishName: "Maryam", englishNameTranslation: "Mary", numberOfAyahs: 98, revelationType: "Meccan", startPage: 305, juzNumber: 16 },
  { number: 20, name: "طه", englishName: "Taa-Haa", englishNameTranslation: "Taa-Haa", numberOfAyahs: 135, revelationType: "Meccan", startPage: 312, juzNumber: 16 },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbiyaa", englishNameTranslation: "The Prophets", numberOfAyahs: 112, revelationType: "Meccan", startPage: 322, juzNumber: 17 },
  { number: 22, name: "الحج", englishName: "Al-Hajj", englishNameTranslation: "The Pilgrimage", numberOfAyahs: 78, revelationType: "Medinan", startPage: 332, juzNumber: 17 },
  { number: 23, name: "المؤمنون", englishName: "Al-Muminoon", englishNameTranslation: "The Believers", numberOfAyahs: 118, revelationType: "Meccan", startPage: 342, juzNumber: 18 },
  { number: 24, name: "النور", englishName: "An-Noor", englishNameTranslation: "The Light", numberOfAyahs: 64, revelationType: "Medinan", startPage: 350, juzNumber: 18 },
  { number: 25, name: "الفرقان", englishName: "Al-Furqaan", englishNameTranslation: "The Criterion", numberOfAyahs: 77, revelationType: "Meccan", startPage: 359, juzNumber: 18 },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'araa", englishNameTranslation: "The Poets", numberOfAyahs: 227, revelationType: "Meccan", startPage: 367, juzNumber: 19 },
  { number: 27, name: "النمل", englishName: "An-Naml", englishNameTranslation: "The Ant", numberOfAyahs: 93, revelationType: "Meccan", startPage: 377, juzNumber: 19 },
  { number: 28, name: "القصص", englishName: "Al-Qasas", englishNameTranslation: "The Stories", numberOfAyahs: 88, revelationType: "Meccan", startPage: 385, juzNumber: 20 },
  { number: 29, name: "العنكبوت", englishName: "Al-Ankaboot", englishNameTranslation: "The Spider", numberOfAyahs: 69, revelationType: "Meccan", startPage: 396, juzNumber: 20 },
  { number: 30, name: "الروم", englishName: "Ar-Room", englishNameTranslation: "The Romans", numberOfAyahs: 60, revelationType: "Meccan", startPage: 404, juzNumber: 21 },
  { number: 31, name: "لقمان", englishName: "Luqman", englishNameTranslation: "Luqman", numberOfAyahs: 34, revelationType: "Meccan", startPage: 411, juzNumber: 21 },
  { number: 32, name: "السجدة", englishName: "As-Sajda", englishNameTranslation: "The Prostration", numberOfAyahs: 30, revelationType: "Meccan", startPage: 415, juzNumber: 21 },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzaab", englishNameTranslation: "The Combined Forces", numberOfAyahs: 73, revelationType: "Medinan", startPage: 418, juzNumber: 21 },
  { number: 34, name: "سبإ", englishName: "Saba", englishNameTranslation: "Sheba", numberOfAyahs: 54, revelationType: "Meccan", startPage: 428, juzNumber: 22 },
  { number: 35, name: "فاطر", englishName: "Faatir", englishNameTranslation: "Originator", numberOfAyahs: 45, revelationType: "Meccan", startPage: 434, juzNumber: 22 },
  { number: 36, name: "يس", englishName: "Yaseen", englishNameTranslation: "Yaseen", numberOfAyahs: 83, revelationType: "Meccan", startPage: 440, juzNumber: 22 },
  { number: 37, name: "الصافات", englishName: "As-Saaffaat", englishNameTranslation: "Those Who Set The Ranks", numberOfAyahs: 182, revelationType: "Meccan", startPage: 446, juzNumber: 23 },
  { number: 38, name: "ص", englishName: "Saad", englishNameTranslation: "Saad", numberOfAyahs: 88, revelationType: "Meccan", startPage: 453, juzNumber: 23 },
  { number: 39, name: "الزمر", englishName: "Az-Zumar", englishNameTranslation: "The Troops", numberOfAyahs: 75, revelationType: "Meccan", startPage: 458, juzNumber: 23 },
  { number: 40, name: "غافر", englishName: "Ghafir", englishNameTranslation: "The Forgiver", numberOfAyahs: 85, revelationType: "Meccan", startPage: 467, juzNumber: 24 },
  { number: 41, name: "فصلت", englishName: "Fussilat", englishNameTranslation: "Explained in Detail", numberOfAyahs: 54, revelationType: "Meccan", startPage: 477, juzNumber: 24 },
  { number: 42, name: "الشورى", englishName: "Ash-Shura", englishNameTranslation: "The Consultation", numberOfAyahs: 53, revelationType: "Meccan", startPage: 483, juzNumber: 25 },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", englishNameTranslation: "The Ornaments of Gold", numberOfAyahs: 89, revelationType: "Meccan", startPage: 489, juzNumber: 25 },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhaan", englishNameTranslation: "The Smoke", numberOfAyahs: 59, revelationType: "Meccan", startPage: 496, juzNumber: 25 },
  { number: 45, name: "الجاثية", englishName: "Al-Jaathiya", englishNameTranslation: "The Crouching", numberOfAyahs: 37, revelationType: "Meccan", startPage: 499, juzNumber: 25 },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaaf", englishNameTranslation: "The Wind-Curved Sandhills", numberOfAyahs: 35, revelationType: "Meccan", startPage: 502, juzNumber: 26 },
  { number: 47, name: "محمد", englishName: "Muhammad", englishNameTranslation: "Muhammad", numberOfAyahs: 38, revelationType: "Medinan", startPage: 507, juzNumber: 26 },
  { number: 48, name: "الفتح", englishName: "Al-Fath", englishNameTranslation: "The Victory", numberOfAyahs: 29, revelationType: "Medinan", startPage: 511, juzNumber: 26 },
  { number: 49, name: "الحجرات", englishName: "Al-Hujuraat", englishNameTranslation: "The Rooms", numberOfAyahs: 18, revelationType: "Medinan", startPage: 515, juzNumber: 26 },
  { number: 50, name: "ق", englishName: "Qaaf", englishNameTranslation: "Qaaf", numberOfAyahs: 45, revelationType: "Meccan", startPage: 518, juzNumber: 26 },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhaariyaat", englishNameTranslation: "The Winnowing Winds", numberOfAyahs: 60, revelationType: "Meccan", startPage: 520, juzNumber: 26 },
  { number: 52, name: "الطور", englishName: "At-Toor", englishNameTranslation: "The Mount", numberOfAyahs: 49, revelationType: "Meccan", startPage: 523, juzNumber: 27 },
  { number: 53, name: "النجم", englishName: "An-Najm", englishNameTranslation: "The Star", numberOfAyahs: 62, revelationType: "Meccan", startPage: 526, juzNumber: 27 },
  { number: 54, name: "القمر", englishName: "Al-Qamar", englishNameTranslation: "The Moon", numberOfAyahs: 55, revelationType: "Meccan", startPage: 528, juzNumber: 27 },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahmaan", englishNameTranslation: "The Beneficent", numberOfAyahs: 78, revelationType: "Medinan", startPage: 531, juzNumber: 27 },
  { number: 56, name: "الواقعة", englishName: "Al-Waaqia", englishNameTranslation: "The Inevitable", numberOfAyahs: 96, revelationType: "Meccan", startPage: 534, juzNumber: 27 },
  { number: 57, name: "الحديد", englishName: "Al-Hadid", englishNameTranslation: "The Iron", numberOfAyahs: 29, revelationType: "Medinan", startPage: 537, juzNumber: 27 },
  { number: 58, name: "المجادلة", englishName: "Al-Mujaadila", englishNameTranslation: "The Pleading Woman", numberOfAyahs: 22, revelationType: "Medinan", startPage: 542, juzNumber: 28 },
  { number: 59, name: "الحشر", englishName: "Al-Hashr", englishNameTranslation: "The Exile", numberOfAyahs: 24, revelationType: "Medinan", startPage: 545, juzNumber: 28 },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahana", englishNameTranslation: "She That Is To Be Examined", numberOfAyahs: 13, revelationType: "Medinan", startPage: 549, juzNumber: 28 },
  { number: 61, name: "الصف", englishName: "As-Saff", englishNameTranslation: "The Ranks", numberOfAyahs: 14, revelationType: "Medinan", startPage: 551, juzNumber: 28 },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'a", englishNameTranslation: "Friday", numberOfAyahs: 11, revelationType: "Medinan", startPage: 553, juzNumber: 28 },
  { number: 63, name: "المنافقون", englishName: "Al-Munaafiqoon", englishNameTranslation: "The Hypocrites", numberOfAyahs: 11, revelationType: "Medinan", startPage: 554, juzNumber: 28 },
  { number: 64, name: "التغابن", englishName: "At-Taghaabun", englishNameTranslation: "Mutual Disillusion", numberOfAyahs: 18, revelationType: "Medinan", startPage: 556, juzNumber: 28 },
  { number: 65, name: "الطلاق", englishName: "At-Talaaq", englishNameTranslation: "The Divorce", numberOfAyahs: 12, revelationType: "Medinan", startPage: 558, juzNumber: 28 },
  { number: 66, name: "التحريم", englishName: "At-Tahrim", englishNameTranslation: "The Prohibition", numberOfAyahs: 12, revelationType: "Medinan", startPage: 560, juzNumber: 28 },
  { number: 67, name: "الملك", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", numberOfAyahs: 30, revelationType: "Meccan", startPage: 562, juzNumber: 29 },
  { number: 68, name: "القلم", englishName: "Al-Qalam", englishNameTranslation: "The Pen", numberOfAyahs: 52, revelationType: "Meccan", startPage: 564, juzNumber: 29 },
  { number: 69, name: "الحاقة", englishName: "Al-Haaqqa", englishNameTranslation: "The Reality", numberOfAyahs: 52, revelationType: "Meccan", startPage: 566, juzNumber: 29 },
  { number: 70, name: "المعارج", englishName: "Al-Ma'aarij", englishNameTranslation: "The Ascending Stairways", numberOfAyahs: 44, revelationType: "Meccan", startPage: 568, juzNumber: 29 },
  { number: 71, name: "نوح", englishName: "Nooh", englishNameTranslation: "Noah", numberOfAyahs: 28, revelationType: "Meccan", startPage: 570, juzNumber: 29 },
  { number: 72, name: "الجن", englishName: "Al-Jinn", englishNameTranslation: "The Jinn", numberOfAyahs: 28, revelationType: "Meccan", startPage: 572, juzNumber: 29 },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil", englishNameTranslation: "The Enshrouded One", numberOfAyahs: 20, revelationType: "Meccan", startPage: 574, juzNumber: 29 },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir", englishNameTranslation: "The Cloaked One", numberOfAyahs: 56, revelationType: "Meccan", startPage: 575, juzNumber: 29 },
  { number: 75, name: "القيامة", englishName: "Al-Qiyaama", englishNameTranslation: "The Resurrection", numberOfAyahs: 40, revelationType: "Meccan", startPage: 577, juzNumber: 29 },
  { number: 76, name: "الإنسان", englishName: "Al-Insaan", englishNameTranslation: "Man", numberOfAyahs: 31, revelationType: "Medinan", startPage: 578, juzNumber: 29 },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalaat", englishNameTranslation: "The Emissaries", numberOfAyahs: 50, revelationType: "Meccan", startPage: 580, juzNumber: 29 },
  { number: 78, name: "النبإ", englishName: "An-Naba", englishNameTranslation: "The Tidings", numberOfAyahs: 40, revelationType: "Meccan", startPage: 582, juzNumber: 30 },
  { number: 79, name: "النازعات", englishName: "An-Naazi'aat", englishNameTranslation: "Those Who Drag Forth", numberOfAyahs: 46, revelationType: "Meccan", startPage: 583, juzNumber: 30 },
  { number: 80, name: "عبس", englishName: "Abasa", englishNameTranslation: "He Frowned", numberOfAyahs: 42, revelationType: "Meccan", startPage: 585, juzNumber: 30 },
  { number: 81, name: "التكوير", englishName: "At-Takwir", englishNameTranslation: "The Overthrowing", numberOfAyahs: 29, revelationType: "Meccan", startPage: 586, juzNumber: 30 },
  { number: 82, name: "الانفطار", englishName: "Al-Infitaar", englishNameTranslation: "The Cleaving", numberOfAyahs: 19, revelationType: "Meccan", startPage: 587, juzNumber: 30 },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin", englishNameTranslation: "Defrauding", numberOfAyahs: 36, revelationType: "Meccan", startPage: 587, juzNumber: 30 },
  { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaaq", englishNameTranslation: "The Splitting Open", numberOfAyahs: 25, revelationType: "Meccan", startPage: 589, juzNumber: 30 },
  { number: 85, name: "البروج", englishName: "Al-Burooj", englishNameTranslation: "The Mansions of the Stars", numberOfAyahs: 22, revelationType: "Meccan", startPage: 590, juzNumber: 30 },
  { number: 86, name: "الطارق", englishName: "At-Taariq", englishNameTranslation: "The Morning Star", numberOfAyahs: 17, revelationType: "Meccan", startPage: 591, juzNumber: 30 },
  { number: 87, name: "الأعلى", englishName: "Al-A'laa", englishNameTranslation: "The Most High", numberOfAyahs: 19, revelationType: "Meccan", startPage: 591, juzNumber: 30 },
  { number: 88, name: "الغاشية", englishName: "Al-Ghaashiya", englishNameTranslation: "The Overwhelming", numberOfAyahs: 26, revelationType: "Meccan", startPage: 592, juzNumber: 30 },
  { number: 89, name: "الفجر", englishName: "Al-Fajr", englishNameTranslation: "The Dawn", numberOfAyahs: 30, revelationType: "Meccan", startPage: 593, juzNumber: 30 },
  { number: 90, name: "البلد", englishName: "Al-Balad", englishNameTranslation: "The City", numberOfAyahs: 20, revelationType: "Meccan", startPage: 594, juzNumber: 30 },
  { number: 91, name: "الشمس", englishName: "Ash-Shams", englishNameTranslation: "The Sun", numberOfAyahs: 15, revelationType: "Meccan", startPage: 595, juzNumber: 30 },
  { number: 92, name: "الليل", englishName: "Al-Layl", englishNameTranslation: "The Night", numberOfAyahs: 21, revelationType: "Meccan", startPage: 595, juzNumber: 30 },
  { number: 93, name: "الضحى", englishName: "Ad-Dhuhaa", englishNameTranslation: "The Morning Hours", numberOfAyahs: 11, revelationType: "Meccan", startPage: 596, juzNumber: 30 },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", englishNameTranslation: "The Consolation", numberOfAyahs: 8, revelationType: "Meccan", startPage: 596, juzNumber: 30 },
  { number: 95, name: "التين", englishName: "At-Tin", englishNameTranslation: "The Fig", numberOfAyahs: 8, revelationType: "Meccan", startPage: 597, juzNumber: 30 },
  { number: 96, name: "العلق", englishName: "Al-Alaq", englishNameTranslation: "The Clot", numberOfAyahs: 19, revelationType: "Meccan", startPage: 597, juzNumber: 30 },
  { number: 97, name: "القدر", englishName: "Al-Qadr", englishNameTranslation: "The Power, Fate", numberOfAyahs: 5, revelationType: "Meccan", startPage: 598, juzNumber: 30 },
  { number: 98, name: "البينة", englishName: "Al-Bayyina", englishNameTranslation: "The Clear Proof", numberOfAyahs: 8, revelationType: "Medinan", startPage: 598, juzNumber: 30 },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzala", englishNameTranslation: "The Earthquake", numberOfAyahs: 8, revelationType: "Medinan", startPage: 599, juzNumber: 30 },
  { number: 100, name: "العاديات", englishName: "Al-Aadiyaat", englishNameTranslation: "The Courser", numberOfAyahs: 11, revelationType: "Meccan", startPage: 599, juzNumber: 30 },
  { number: 101, name: "القارعة", englishName: "Al-Qaari'a", englishNameTranslation: "The Calamity", numberOfAyahs: 11, revelationType: "Meccan", startPage: 600, juzNumber: 30 },
  { number: 102, name: "التكاثر", englishName: "At-Takaathur", englishNameTranslation: "Competition in Increase", numberOfAyahs: 8, revelationType: "Meccan", startPage: 600, juzNumber: 30 },
  { number: 103, name: "العصر", englishName: "Al-Asr", englishNameTranslation: "The Declining Day, Epoch", numberOfAyahs: 3, revelationType: "Meccan", startPage: 601, juzNumber: 30 },
  { number: 104, name: "الهمزة", englishName: "Al-Humaza", englishNameTranslation: "The Traducer", numberOfAyahs: 9, revelationType: "Meccan", startPage: 601, juzNumber: 30 },
  { number: 105, name: "الفيل", englishName: "Al-Fil", englishNameTranslation: "The Elephant", numberOfAyahs: 5, revelationType: "Meccan", startPage: 601, juzNumber: 30 },
  { number: 106, name: "قريش", englishName: "Quraysh", englishNameTranslation: "Quraysh", numberOfAyahs: 4, revelationType: "Meccan", startPage: 602, juzNumber: 30 },
  { number: 107, name: "الماعون", englishName: "Al-Maa'oon", englishNameTranslation: "Small Kindnesses", numberOfAyahs: 7, revelationType: "Meccan", startPage: 602, juzNumber: 30 },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", englishNameTranslation: "Abundance", numberOfAyahs: 3, revelationType: "Meccan", startPage: 602, juzNumber: 30 },
  { number: 109, name: "الكافرون", englishName: "Al-Kaafiroon", englishNameTranslation: "The Disbelievers", numberOfAyahs: 6, revelationType: "Meccan", startPage: 603, juzNumber: 30 },
  { number: 110, name: "النصر", englishName: "An-Nasr", englishNameTranslation: "Divine Support", numberOfAyahs: 3, revelationType: "Medinan", startPage: 603, juzNumber: 30 },
  { number: 111, name: "المسد", englishName: "Al-Masad", englishNameTranslation: "The Palm Fibre", numberOfAyahs: 5, revelationType: "Meccan", startPage: 603, juzNumber: 30 },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlaas", englishNameTranslation: "Sincerity", numberOfAyahs: 4, revelationType: "Meccan", startPage: 604, juzNumber: 30 },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", englishNameTranslation: "The Daybreak", numberOfAyahs: 5, revelationType: "Meccan", startPage: 604, juzNumber: 30 },
  { number: 114, name: "الناس", englishName: "An-Naas", englishNameTranslation: "Mankind", numberOfAyahs: 6, revelationType: "Meccan", startPage: 604, juzNumber: 30 },
];

/**
 * دالة مساعدة للحصول على بيانات سورة معينة
 */
export function getSurahMeta(surahNumber: number): SurahMeta {
  const found = SURAHS_METADATA.find(s => s.number === surahNumber);
  if (!found) {
    return SURAHS_METADATA[0]; // الفاتحة كقيمة افتراضية آمنة
  }
  return found;
}

/**
 * دالة مساعدة لمعرفة السورة التي تبدأ فيها صفحة معينة
 */
export function getSurahByPage(pageNumber: number): SurahMeta {
  // البحث عن السورة التي رقم بدايتها أقل من أو يساوي الصفحة المطلوبة
  for (let i = SURAHS_METADATA.length - 1; i >= 0; i--) {
    if (pageNumber >= SURAHS_METADATA[i].startPage) {
      return SURAHS_METADATA[i];
    }
  }
  return SURAHS_METADATA[0];
}

/**
 * قائمة الأجزاء الثلاثين مع صفحة البداية واسم أول سورة فيها
 */
export interface JuzMeta {
  number: number;
  name: string;
  startPage: number;
  surahNumber: number;
  surahName: string;
}

export const JUZ_METADATA: JuzMeta[] = [
  { number: 1, name: "الجزء الأول", startPage: 1, surahNumber: 1, surahName: "الفاتحة" },
  { number: 2, name: "الجزء الثاني", startPage: 22, surahNumber: 2, surahName: "البقرة" },
  { number: 3, name: "الجزء الثالث", startPage: 42, surahNumber: 2, surahName: "البقرة" },
  { number: 4, name: "الجزء الرابع", startPage: 62, surahNumber: 3, surahName: "آل عمران" },
  { number: 5, name: "الجزء الخامس", startPage: 82, surahNumber: 4, surahName: "النساء" },
  { number: 6, name: "الجزء السادس", startPage: 102, surahNumber: 4, surahName: "النساء" },
  { number: 7, name: "الجزء السابع", startPage: 122, surahNumber: 5, surahName: "المائدة" },
  { number: 8, name: "الجزء الثامن", startPage: 142, surahNumber: 6, surahName: "الأنعام" },
  { number: 9, name: "الجزء التاسع", startPage: 162, surahNumber: 7, surahName: "الأعراف" },
  { number: 10, name: "الجزء العاشر", startPage: 182, surahNumber: 8, surahName: "الأنفال" },
  { number: 11, name: "الجزء الحادي عشر", startPage: 202, surahNumber: 9, surahName: "التوبة" },
  { number: 12, name: "الجزء الثاني عشر", startPage: 222, surahNumber: 11, surahName: "هود" },
  { number: 13, name: "الجزء الثالث عشر", startPage: 242, surahNumber: 12, surahName: "يوسف" },
  { number: 14, name: "الجزء الرابع عشر", startPage: 262, surahNumber: 15, surahName: "الحجر" },
  { number: 15, name: "الجزء الخامس عشر", startPage: 282, surahNumber: 17, surahName: "الإسراء" },
  { number: 16, name: "الجزء السادس عشر", startPage: 302, surahNumber: 18, surahName: "الكهف" },
  { number: 17, name: "الجزء السابع عشر", startPage: 322, surahNumber: 21, surahName: "الأنبياء" },
  { number: 18, name: "الجزء الثامن عشر", startPage: 342, surahNumber: 23, surahName: "المؤمنون" },
  { number: 19, name: "الجزء التاسع عشر", startPage: 362, surahNumber: 25, surahName: "الفرقان" },
  { number: 20, name: "الجزء العشرون", startPage: 382, surahNumber: 27, surahName: "النمل" },
  { number: 21, name: "الجزء الحادي والعشرون", startPage: 402, surahNumber: 29, surahName: "العنكبوت" },
  { number: 22, name: "الجزء الثاني والعشرون", startPage: 422, surahNumber: 33, surahName: "الأحزاب" },
  { number: 23, name: "الجزء الثالث والعشرون", startPage: 442, surahNumber: 36, surahName: "يس" },
  { number: 24, name: "الجزء الرابع والعشرون", startPage: 462, surahNumber: 39, surahName: "الزمر" },
  { number: 25, name: "الجزء الخامس والعشرون", startPage: 482, surahNumber: 41, surahName: "فصلت" },
  { number: 26, name: "الجزء السادس والعشرون", startPage: 502, surahNumber: 46, surahName: "الأحقاف" },
  { number: 27, name: "الجزء السابع والعشرون", startPage: 522, surahNumber: 51, surahName: "الذاريات" },
  { number: 28, name: "الجزء الثامن والعشرون", startPage: 542, surahNumber: 58, surahName: "المجادلة" },
  { number: 29, name: "الجزء التاسع والعشرون", startPage: 562, surahNumber: 67, surahName: "الملك" },
  { number: 30, name: "الجزء الثلاثون", startPage: 582, surahNumber: 78, surahName: "النبإ" },
];
