# 🔧 إصلاح وتشغيل المشروع

## ✅ تم إصلاح المشاكل التالية:

1. ✅ تم إنشاء ملف `.env` في Backend
2. ✅ تم إنشاء ملف `.env.local` في Frontend
3. ✅ تم تعديل الكود ليعمل بدون قاعدة بيانات (للاختبار)

---

## 🚀 خطوات التشغيل الآن:

### 1️⃣ تشغيل Backend

افتح Terminal واكتب:

```powershell
cd D:\Charity_Hub\backend

# تأكد من تثبيت المكتبات
npm install

# شغل الخادم
npm run dev
```

**✅ Backend سيعمل على:** `http://localhost:5000`

**للتحقق:**
افتح المتصفح على: `http://localhost:5000/api/health`

يجب أن ترى:
```json
{
  "status": "CharityHub Backend Running",
  "timestamp": "...",
  "environment": "development"
}
```

---

### 2️⃣ تشغيل Frontend

افتح Terminal جديد واكتب:

```powershell
cd D:\Charity_Hub\frontend

# تأكد من تثبيت المكتبات
npm install

# شغل التطبيق
npm run dev
```

**✅ Frontend سيعمل على:** `http://localhost:3000`

---

## ⚠️ ملاحظات مهمة:

### إذا ظهرت رسالة تحذير عن DATABASE_URL:

هذا طبيعي! الخادم سيعمل لكن ميزات قاعدة البيانات لن تعمل.

**لإصلاح هذا:**

1. تأكد من أن PostgreSQL مثبت ويعمل
2. افتح ملف `backend/.env`
3. غيّر `DATABASE_URL` إلى:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/charityhub?schema=public
   ```
   (استبدل `YOUR_PASSWORD` بكلمة مرور PostgreSQL)

4. شغل:
   ```powershell
   cd D:\Charity_Hub\backend
   npm run prisma:generate
   npm run prisma:migrate
   ```

---

## 🧪 اختبار سريع:

### اختبار Backend:
```powershell
# في Terminal جديد
curl http://localhost:5000/api/health
```

أو افتح المتصفح: `http://localhost:5000/api/health`

### اختبار Frontend:
1. افتح: `http://localhost:3000`
2. ابحث عن شارة خضراء: **"الخادم يعمل بنجاح"**

---

## 🔍 حل المشاكل:

### Backend لا يعمل:
- ✅ تحقق من أن المنفذ 5000 غير مستخدم
- ✅ تحقق من ملف `.env` موجود
- ✅ شغل: `npm install` في مجلد backend

### Frontend لا يعمل:
- ✅ تحقق من أن المنفذ 3000 غير مستخدم
- ✅ تحقق من ملف `.env.local` موجود
- ✅ شغل: `npm install` في مجلد frontend

### Frontend لا يتصل بالBackend:
- ✅ تأكد من أن Backend يعمل أولاً
- ✅ افتح Console في المتصفح (F12) وابحث عن أخطاء
- ✅ تحقق من `.env.local` يحتوي على: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

---

## 📝 الأوامر السريعة:

```powershell
# Backend
cd D:\Charity_Hub\backend
npm install
npm run dev

# Frontend (في Terminal جديد)
cd D:\Charity_Hub\frontend
npm install
npm run dev
```

**بالتوفيق! 🚀**
