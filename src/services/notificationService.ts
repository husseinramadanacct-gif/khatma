/**
 * خدمة التنبيهات والإشعارات للورد اليومي لتطبيق «خاتمة»
 */
export const NotificationService = {
  /**
   * طلب إذن الإشعارات من المتصفح
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('هذا المتصفح لا يدعم التنبيهات المحلية');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.error('خطأ في طلب إذن الإشعارات:', e);
      return false;
    }
  },

  /**
   * إرسال تنبيه فوري
   */
  sendNotification(title: string, body: string, icon = '/favicon.ico'): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      new Notification(title, {
        body,
        icon,
        dir: 'rtl',
        lang: 'ar',
      });
    } catch (e) {
      console.warn('تعذر إظهار الإشعار:', e);
    }
  },

  /**
   * إشعار حلول وقت الورد
   */
  notifyWirdReminder(pagesCount: number, surahName: string): void {
    this.sendNotification(
      'حان وقت وردك اليوم 🌙',
      `لديك ${pagesCount} صفحات من سورة ${surahName} لإكمال وردك المبارك اليوم.`
    );
  },

  /**
   * إشعار تأخر الورد الهادئ
   */
  notifyMissedWirdReminder(missedPages: number): void {
    this.sendNotification(
      'تذكير لطيف بقراءة القرآن ✨',
      `لديك ${missedPages} صفحات من وردك السابق، يمكنك تعويضها براحة أو استئناف القراءة.`
    );
  },

  /**
   * إشعار مباركة إتمام الختمة
   */
  notifyKhatmahCompleted(title: string): void {
    this.sendNotification(
      'مبارك إتمام الختمة! 🎉',
      `أتممت بفضل الله «${title}». نسأل الله أن يجعله شفيعًا ونورًا لك.`
    );
  }
};
