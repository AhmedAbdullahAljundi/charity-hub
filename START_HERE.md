# 🚀 ابدأ من هنا - تعليمات سريعة

## ⚡ تشغيل سريع (5 دقائق)

### 1️⃣ إعداد Backend

افتح Terminal جديد واكتب:

```powershell
cd D:\Charity_Hub\backend

# إنشاء ملف .env
@"
DATABASE_URL=postgresql://postgres:password@localhost:5432/charityhub?schema=public
PORT=5000
JWT_SECRET=charityhub-secret-key-2024
BASELINE_COEFFICIENT=1.0
CORS_ORIGIN=http://localhost:3000
"@ | Out-File -FilePath .env -Encoding utf8

# تثبيت المكتبات
npm install

# إنشاء قاعدة البيانات (إذا لم تكن موجودة)
npm run prisma:generate
npm run prisma:migrate

# تشغيل الخادم
npm run dev
```

**✅ Backend سيعمل على:** `http://localhost:5000`

---

### 2️⃣ إعداد Frontend

افتح Terminal جديد آخر واكتب:

```powershell
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
2. ابحث عن شارة خضراء: **"الخادم يعمل بنجاح"**
3. إذا ظهرت الشارة = ✅ كل شيء يعمل!

---

## 🔧 حل المشاكل

### Backend لا يعمل؟
- تأكد من PostgreSQL يعمل
- تحقق من DATABASE_URL في .env
- تأكد من المنفذ 5000 غير مستخدم

### Frontend لا يتصل بالBackend؟
- تأكد من Backend يعمل أولاً
- تحقق من .env.local
- افتح Console في المتصفح وابحث عن أخطاء

---

## 📝 ملاحظات مهمة

1. **يجب تشغيل Backend أولاً** قبل Frontend
2. **PostgreSQL** يجب أن يكون مثبت ويعمل
3. **المنفذ 5000** للBackend و **3000** للFrontend

---

## 🎯 الخطوات التالية

بعد التأكد من أن كل شيء يعمل:
1. ✅ افتح Dashboard
2. ✅ أضف عائلة جديدة
3. ✅ أضف أفراد
4. ✅ احسب النقاط
5. ✅ شاهد التصنيف

**بالتوفيق! 🚀**
