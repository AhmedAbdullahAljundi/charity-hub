# 📚 شرح ملفات Prisma في المشروع

## ما هو Prisma؟

Prisma هو **ORM (Object-Relational Mapping)** - أداة تربط بين قاعدة البيانات والكود البرمجي. بدلاً من كتابة SQL مباشرة، نكتب كود JavaScript/TypeScript و Prisma يحوله إلى SQL.

---

## 📁 ملفات Prisma في المشروع

### 1️⃣ `prisma/schema.prisma` ⭐ (الملف الرئيسي)

**الموقع:** `backend/prisma/schema.prisma`

**الوظيفة:** 
- يحدد **هيكل قاعدة البيانات** بالكامل
- يحدد **الجداول (Models)** و **العلاقات** بينها
- يحدد **الأنواع (Enums)** مثل: HousingType, Gender, EducationLevel

**المكونات:**

#### أ) Generator
```prisma
generator client {
  provider = "prisma-client-js"
}
```
- يخبر Prisma أن يولد **Prisma Client** للاستخدام في JavaScript

#### ب) Datasource
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
- يحدد نوع قاعدة البيانات (PostgreSQL)
- يحدد رابط الاتصال من ملف `.env`

#### ج) Enums (الأنواع)
```prisma
enum HousingType {
  OWNED    // ملك
  RENT     // إيجار
  SHARED   // مشترك
}
```
- أنواع ثابتة تستخدم في الجداول

#### د) Models (الجداول)
```prisma
model Family {
  id           String   @id @default(uuid())
  national_id  String   @unique
  head_name    String
  // ...
}
```
- كل `model` = جدول في قاعدة البيانات
- `@id` = المفتاح الأساسي
- `@unique` = قيمة فريدة
- `@default(uuid())` = قيمة افتراضية

---

### 2️⃣ `prisma/seed.js` 🌱

**الموقع:** `backend/prisma/seed.js`

**الوظيفة:**
- **يملأ قاعدة البيانات ببيانات أولية**
- ينشئ الأدوار والصلاحيات
- ينشئ قواعد التقييم

**متى يُستخدم:**
```bash
npm run seed
```

**مثال:**
- ينشئ أدوار: Admin, DataEntry, MedicalOfficer, Auditor
- ينشئ صلاحيات: CREATE_FAMILY, UPDATE_FAMILY, إلخ
- ينشئ قاعدة التقييم: BASELINE_COEFFICIENT = 1.0

---

## 🔧 الأوامر المهمة

### 1. Generate Prisma Client
```bash
npm run prisma:generate
```
**الوظيفة:** ينشئ ملفات Prisma Client التي تستخدمها في الكود

**متى:** بعد أي تعديل على `schema.prisma`

---

### 2. Create Database & Run Migrations
```bash
npm run prisma:migrate
```
**الوظيفة:**
- ينشئ قاعدة البيانات (إذا لم تكن موجودة)
- ينشئ جميع الجداول
- يطبق التغييرات

**متى:** أول مرة أو بعد تعديل `schema.prisma`

---

### 3. Seed Database
```bash
npm run seed
```
**الوظيفة:** يملأ قاعدة البيانات ببيانات أولية

---

### 4. Prisma Studio (واجهة رسومية)
```bash
npm run prisma:studio
```
**الوظيفة:** يفتح واجهة رسومية لعرض وتعديل البيانات

---

## 📊 الجداول (Models) في المشروع

### 1. **Family** (العائلات)
- `id` - المعرف الفريد
- `national_id` - رقم الهوية (فريد)
- `head_name` - اسم رب الأسرة
- `housing_type` - نوع السكن (OWNED/RENT/SHARED)

### 2. **Member** (الأفراد)
- مرتبط بـ `Family`
- يحتوي: الاسم، العمر، الجنس، المستوى التعليمي

### 3. **IncomeSource** (مصادر الدخل)
- مرتبط بـ `Family`
- يحتوي: النوع، المبلغ، حالة التأكيد

### 4. **Expense** (المصروفات)
- مرتبط بـ `Family`
- يحتوي: النوع، المبلغ

### 5. **MedicalRecord** (السجلات الطبية)
- مرتبط بـ `Member`
- يحتوي: الفئة الطبية، حالة مزمنة، تواريخ الخدمة

### 6. **ScoringRule** (قواعد التقييم)
- يحتوي: معاملات التقييم

### 7. **User, Role, Permission** (المستخدمين والأدوار)
- نظام RBAC (Role-Based Access Control)

### 8. **AuditLog** (سجل التعديلات)
- يسجل جميع التغييرات في النظام

---

## 🔗 العلاقات (Relations)

### مثال:
```prisma
model Family {
  members Member[]  // عائلة واحدة لها عدة أفراد
}

model Member {
  family Family @relation(...)  // فرد واحد ينتمي لعائلة واحدة
}
```

**العلاقة:** One-to-Many (واحد لكثير)
- عائلة واحدة → عدة أفراد
- فرد واحد → عائلة واحدة

---

## ⚠️ المشاكل الشائعة وحلها

### 1. "Prisma Client did not initialize"
**الحل:**
```bash
npm run prisma:generate
```

### 2. "Table does not exist"
**الحل:**
```bash
npm run prisma:migrate
```

### 3. "Cannot connect to database"
**الحل:**
- تحقق من `DATABASE_URL` في `.env`
- تأكد من أن PostgreSQL يعمل
- تحقق من كلمة المرور

---

## 📝 خطوات العمل الصحيحة

### أول مرة:
1. ✅ تعديل `schema.prisma`
2. ✅ `npm run prisma:generate`
3. ✅ `npm run prisma:migrate`
4. ✅ `npm run seed` (اختياري)

### عند التعديل:
1. ✅ تعديل `schema.prisma`
2. ✅ `npm run prisma:generate`
3. ✅ `npm run prisma:migrate`

---

## 🎯 ملخص

- **schema.prisma** = تعريف قاعدة البيانات
- **seed.js** = بيانات أولية
- **prisma generate** = إنشاء Client
- **prisma migrate** = إنشاء الجداول
- **prisma studio** = واجهة رسومية

**بالتوفيق! 🚀**
