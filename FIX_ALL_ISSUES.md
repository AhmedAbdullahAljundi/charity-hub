# 🔧 إصلاح جميع المشاكل - دليل شامل

## ❌ المشاكل الموجودة:

### 1. ملف `schema.prisma` غير موجود ✅ تم الإصلاح
### 2. Prisma Client غير مُنشأ ✅ يحتاج تشغيل
### 3. قاعدة البيانات غير موجودة ✅ يحتاج إنشاء

---

## ✅ الحلول خطوة بخطوة:

### الخطوة 1: إنشاء Prisma Client

```powershell
cd D:\Charity_Hub\backend
npm run prisma:generate
```

**النتيجة المتوقعة:**
```
✔ Generated Prisma Client
```

---

### الخطوة 2: إنشاء قاعدة البيانات والجداول

**أولاً:** تأكد من أن PostgreSQL يعمل

**ثانياً:** عدّل ملف `.env`:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/charityhub?schema=public
```
(استبدل `YOUR_PASSWORD` بكلمة مرور PostgreSQL)

**ثالثاً:** شغّل:
```powershell
cd D:\Charity_Hub\backend
npm run prisma:migrate
```

**عند السؤال عن اسم Migration:**
اكتب: `init` أو اضغط Enter

**النتيجة المتوقعة:**
```
✔ Database created
✔ Applied migration
```

---

### الخطوة 3: ملء قاعدة البيانات ببيانات أولية (اختياري)

```powershell
cd D:\Charity_Hub\backend
npm run seed
```

**النتيجة المتوقعة:**
```
✅ Created 4 roles
✅ Created 6 permissions
✅ Created role-permission mappings
```

---

### الخطوة 4: تشغيل Backend

```powershell
cd D:\Charity_Hub\backend
npm run dev
```

**النتيجة المتوقعة:**
```
🚀 CharityHub Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Port: 5000
🌍 Environment: development
🔗 URL: http://localhost:5000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**للتحقق:**
افتح: `http://localhost:5000/api/health`

يجب أن ترى:
```json
{
  "status": "CharityHub Backend Running",
  "timestamp": "...",
  "environment": "development"
}
```

---

### الخطوة 5: تشغيل Frontend

افتح **Terminal جديد**:

```powershell
cd D:\Charity_Hub\frontend
npm install
npm run dev
```

**النتيجة المتوقعة:**
```
▲ Next.js 14.2.5
- Local:        http://localhost:3000
```

**للتحقق:**
افتح: `http://localhost:3000`

يجب أن ترى:
- ✅ صفحة Dashboard
- ✅ شارة خضراء: "الخادم يعمل بنجاح"

---

## 🔍 حل المشاكل الشائعة:

### مشكلة 1: "Cannot connect to database"

**الأسباب:**
- PostgreSQL غير شغال
- DATABASE_URL خاطئ
- كلمة المرور خاطئة

**الحل:**
1. شغّل PostgreSQL
2. تحقق من `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/charityhub?schema=public
   ```
3. جرب الاتصال:
   ```powershell
   psql -U postgres -d charityhub
   ```

---

### مشكلة 2: "Prisma Client did not initialize"

**الحل:**
```powershell
cd D:\Charity_Hub\backend
npm run prisma:generate
```

---

### مشكلة 3: "Table does not exist"

**الحل:**
```powershell
cd D:\Charity_Hub\backend
npm run prisma:migrate
```

---

### مشكلة 4: "Port 5000 already in use"

**الحل:**
```powershell
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# أو غيّر PORT في .env
PORT=5001
```

---

### مشكلة 5: "Port 3000 already in use"

**الحل:**
```powershell
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# أو شغّل على منفذ آخر
npm run dev -- -p 3001
```

---

### مشكلة 6: Frontend لا يتصل بالBackend

**الحل:**
1. تأكد من أن Backend يعمل على `http://localhost:5000`
2. تحقق من `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
3. افتح Console في المتصفح (F12) وابحث عن أخطاء
4. تحقق من CORS في Backend

---

## 📋 قائمة التحقق (Checklist):

### Backend:
- [ ] ملف `.env` موجود
- [ ] `DATABASE_URL` صحيح
- [ ] PostgreSQL يعمل
- [ ] `npm install` تم
- [ ] `npm run prisma:generate` تم
- [ ] `npm run prisma:migrate` تم
- [ ] `npm run dev` يعمل
- [ ] `http://localhost:5000/api/health` يعمل

### Frontend:
- [ ] ملف `.env.local` موجود
- [ ] `NEXT_PUBLIC_API_URL` صحيح
- [ ] `npm install` تم
- [ ] `npm run dev` يعمل
- [ ] `http://localhost:3000` يعمل
- [ ] شارة "الخادم يعمل بنجاح" تظهر

---

## 🚀 الأوامر السريعة (نسخ ولصق):

### إعداد كامل:
```powershell
# Backend
cd D:\Charity_Hub\backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev

# Frontend (Terminal جديد)
cd D:\Charity_Hub\frontend
npm install
npm run dev
```

---

## 📞 إذا استمرت المشاكل:

1. **تحقق من الأخطاء في Terminal**
2. **افتح Console في المتصفح (F12)**
3. **تحقق من ملفات `.env` و `.env.local`**
4. **تأكد من أن PostgreSQL يعمل**
5. **جرب إعادة تشغيل كل شيء**

**بالتوفيق! 🚀**
