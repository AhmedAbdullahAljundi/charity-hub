# 🚀 تشغيل المشروع - دليل سريع

## ✅ تم تشغيل الخوادم!

### Backend
- **الحالة:** ✅ يعمل في الخلفية
- **الرابط:** `http://localhost:5000`
- **Health Check:** `http://localhost:5000/api/health`

### Frontend
- **الحالة:** ✅ يعمل في الخلفية
- **الرابط:** `http://localhost:3000`

---

## 🔍 التحقق من التشغيل

### 1. تحقق من Backend

افتح المتصفح على:
```
http://localhost:5000/api/health
```

يجب أن ترى:
```json
{
  "status": "CharityHub Backend Running",
  "timestamp": "...",
  "environment": "development"
}
```

### 2. تحقق من Frontend

افتح المتصفح على:
```
http://localhost:3000
```

يجب أن ترى:
- ✅ صفحة Dashboard
- ✅ شارة خضراء: "الخادم يعمل بنجاح"

---

## 🛑 إيقاف الخوادم

إذا أردت إيقاف الخوادم:
- اضغط `Ctrl + C` في Terminal لكل خادم

---

## 🔧 إذا لم يعمل شيء

### Backend لا يعمل؟

1. تحقق من Terminal Backend
2. تأكد من أن PostgreSQL يعمل
3. تحقق من ملف `.env`
4. شغّل: `npm run prisma:generate`

### Frontend لا يعمل؟

1. تحقق من Terminal Frontend
2. تأكد من ملف `.env.local`
3. تأكد من أن Backend يعمل أولاً

### Frontend لا يتصل بالBackend؟

1. افتح Console في المتصفح (F12)
2. ابحث عن أخطاء CORS
3. تحقق من `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

---

## 📝 ملاحظات

- ✅ الخوادم تعمل في الخلفية
- ✅ يمكنك فتح المتصفح الآن
- ✅ إذا أردت إيقافها، اضغط Ctrl+C

**افتح:** `http://localhost:3000` 🚀
