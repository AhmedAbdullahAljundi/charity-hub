# 🚀 تشغيل المشروع - خطوة بخطوة

## ⚡ الخطوات السريعة

### الخطوة 1: إعداد Backend

افتح **Terminal جديد** (PowerShell أو CMD) واكتب:

```powershell
# الانتقال لمجلد Backend
cd D:\Charity_Hub\backend

# إنشاء ملف .env (انسخ والصق هذا الأمر كاملاً)
@"
DATABASE_URL=postgresql://postgres:password@localhost:5432/charityhub?schema=public
PORT=5000
JWT_SECRET=charityhub-secret-key-2024
BASELINE_COEFFICIENT=1.0
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8

# تثبيت المكتبات
npm install

# إنشاء قاعدة البيانات
npm run prisma:generate
npm run prisma:migrate

# تشغيل الخادم
npm run dev
```

**✅ Backend سيعمل على:** `http://localhost:5000`

---

### الخطوة 2: إعداد Frontend

افتح **Terminal جديد آخر** (PowerShell أو CMD) واكتب:

```powershell
# الانتقال لمجلد Frontend
cd D:\Charity_Hub\frontend

# إنشاء ملف .env.local
@"
NEXT_PUBLIC_API_URL=http://localhost:5000/api
"@ | Out-File -FilePath .env.local -Encoding utf8

# تثبيت المكتبات
npm install

# تشغيل التطبيق
npm run dev
```

**✅ Frontend سيعمل على:** `http://localhost:3000`

---

## ✅ التحقق من الاتصال

1. افتح المتصفح: `http://localhost:3000`
2. ابحث عن شارة خضراء في أعلى الصفحة: **"الخادم يعمل بنجاح"**
3. إذا ظهرت الشارة = ✅ كل شيء يعمل بشكل صحيح!

---

## 🔧 ملاحظات مهمة

### قبل البدء:
- ✅ تأكد من أن **PostgreSQL** مثبت ويعمل
- ✅ غيّر `password` في DATABASE_URL بكلمة مرور PostgreSQL الخاصة بك
- ✅ تأكد من أن المنفذ **5000** و **3000** غير مستخدمين

### إذا ظهرت أخطاء:

**Backend لا يعمل:**
- تحقق من أن PostgreSQL يعمل
- تحقق من DATABASE_URL في ملف .env
- تأكد من تثبيت جميع المكتبات: `npm install`

**Frontend لا يتصل بالBackend:**
- تأكد من أن Backend يعمل أولاً على `http://localhost:5000`
- تحقق من ملف .env.local
- افتح Console في المتصفح (F12) وابحث عن أخطاء

---

## 📝 الأوامر المهمة

### Backend:
```powershell
cd D:\Charity_Hub\backend
npm run dev          # تشغيل في وضع التطوير
npm start            # تشغيل في وضع الإنتاج
npm run seed         # ملء قاعدة البيانات ببيانات تجريبية
```

### Frontend:
```powershell
cd D:\Charity_Hub\frontend
npm run dev          # تشغيل في وضع التطوير
npm run build        # بناء للتطوير
npm start            # تشغيل في وضع الإنتاج
```

---

## 🎯 بعد التشغيل

1. ✅ افتح `http://localhost:3000`
2. ✅ تحقق من شارة "الخادم يعمل بنجاح"
3. ✅ جرب إضافة عائلة جديدة
4. ✅ جرب حساب النقاط

**بالتوفيق! 🚀**
