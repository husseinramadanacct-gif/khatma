import { Reciter } from '../types';

/**
 * قائمة القراء المعتمدة رسميًا وروابط التلاوات الحقيقية من EveryAyah و Islamic Network
 */
export const VERIFIED_RECITERS: Reciter[] = [
  {
    id: 'alafasy',
    name: 'Mishary Rashid Alafasy',
    arabicName: 'مشاري راشد العفاسي',
    subfolder: 'Alafasy_128kbps',
    style: 'حفص عن عاصم - مرتل',
    bitrate: '128kbps',
    serverType: 'everyayah',
  },
  {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    arabicName: 'محمود خليل الحصري',
    subfolder: 'Husary_128kbps',
    style: 'حفص عن عاصم - مرتل معلم',
    bitrate: '128kbps',
    serverType: 'everyayah',
  },
  {
    id: 'abdulbasit',
    name: 'Abdul Basit Abdul Samad',
    arabicName: 'عبد الباسط عبد الصمد',
    subfolder: 'Abdul_Basit_Murattal_192kbps',
    style: 'حفص عن عاصم - مرتل',
    bitrate: '192kbps',
    serverType: 'everyayah',
  },
  {
    id: 'minshawy',
    name: 'Muhammad Siddiq Al-Minshawi',
    arabicName: 'محمد صديق المنشاوي',
    subfolder: 'Minshawy_Murattal_128kbps',
    style: 'حفص عن عاصم - مرتل',
    bitrate: '128kbps',
    serverType: 'everyayah',
  },
  {
    id: 'ghamadi',
    name: 'Saad Al-Ghamdi',
    arabicName: 'سعد الغامدي',
    subfolder: 'Ghamadi_40kbps',
    style: 'حفص عن عاصم - مرتل',
    bitrate: '40kbps',
    serverType: 'everyayah',
  },
  {
    id: 'shatri',
    name: 'Abu Bakr Al-Shatri',
    arabicName: 'أبو بكر الشاطري',
    subfolder: 'Abu_Bakr_Ash-Shaatree_128kbps',
    style: 'حفص عن عاصم - مرتل',
    bitrate: '128kbps',
    serverType: 'everyayah',
  },
  {
    id: 'muaiqly',
    name: 'Maher Al-Muaiqly',
    arabicName: 'ماهر المعيقلي',
    subfolder: 'MaherAlMuaiqly128kbps',
    style: 'حفص عن عاصم - مرتل',
    bitrate: '128kbps',
    serverType: 'everyayah',
  }
];

export const ReciterProvider = {
  getReciters(): Reciter[] {
    return VERIFIED_RECITERS;
  },

  getReciterById(id: string): Reciter {
    const found = VERIFIED_RECITERS.find(r => r.id === id);
    return found || VERIFIED_RECITERS[0];
  },

  /**
   * توليد رابط الصوت الحقيقي للآية بصيغة EveryAyah القياسية المعتمدة:
   * https://everyayah.com/data/{subfolder}/{SSSAAA}.mp3
   * حيث SSS هو رقم السورة من 3 خانات، و AAA هو رقم الآية من 3 خانات
   */
  getAyahAudioUrl(reciterId: string, surahNumber: number, ayahNumber: number): string {
    const reciter = this.getReciterById(reciterId);
    const surahPadded = String(surahNumber).padStart(3, '0');
    const ayahPadded = String(ayahNumber).padStart(3, '0');

    // المصدر الرئيسي: EveryAyah CDN
    return `https://everyayah.com/data/${reciter.subfolder}/${surahPadded}${ayahPadded}.mp3`;
  },

  /**
   * رابط بديل سريع عبر Islamic Network CDN (للشيخ العفاسي)
   */
  getAyahGlobalAudioUrl(globalAyahNumber: number): string {
    return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNumber}.mp3`;
  }
};
