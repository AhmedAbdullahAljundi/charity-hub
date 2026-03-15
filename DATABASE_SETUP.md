# 🗄️ إعداد قاعدة البيانات - دليل شامل

## الطريقتان لإنشاء قاعدة البيانات:

### ✅ الطريقة 1: إنشاء يدوي (مُوصى بها) ⭐

**المميزات:**
- تحكم كامل في قاعدة البيانات
- يمكنك رؤية قاعدة البيانات في pgAdmin أو أي أداة أخرى
- أسهل في إدارة الصلاحيات

**الخطوات:**

#### 1. افتح PostgreSQL (pgAdmin أو psql)

#### 2. أنشئ قاعدة البيانات يدوياً:

**في pgAdmin:**
1. انقر بالزر الأيمن على "Databases"
2. اختر "Create" → "Database"
3. اكتب الاسم: `charityhub`
4. اضغط "Save"

**أو في psql (Command Line):**
```sql
-- افتح psql
psql -U postgres

-- أنشئ قاعدة البيانات
CREATE DATABASE charityhub;

-- تحقق من الإنشاء
\l

-- اخرج
\q
```

#### 3. عدّل ملف `.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/charityhub?schema=public
```

(استبدل `YOUR_PASSWORD` بكلمة مرور PostgreSQL)

#### 4. شغّل Prisma Migrate:

```powershell
cd D:\Charity_Hub\backend
npm run prisma:migrate
```

**عند السؤال عن اسم Migration:**
اكتب: `init` أو اضغط Enter

**النتيجة:**
- ✅ سينشئ جميع الجداول تلقائياً
- ✅ لن ينشئ قاعدة البيانات (لأنها موجودة)

---

### ✅ الطريقة 2: إنشاء تلقائي (أسهل) 🚀

**المميزات:**
- أسهل وأسرع
- لا يحتاج فتح pgAdmin

**الخطوات:**

#### 1. تأكد من أن PostgreSQL يعمل

#### 2. عدّل ملف `.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/charityhub?schema=public
```

**⚠️ مهم:** قاعدة البيانات `charityhub` **لا يجب أن تكون موجودة** - Prisma سينشئها تلقائياً

#### 3. شغّل Prisma Migrate:

```powershell
cd D:\Charity_Hub\backend
npm run prisma:migrate
```

**عند السؤال عن اسم Migration:**
اكتب: `init` أو اضغط Enter

**النتيجة:**
- ✅ سينشئ قاعدة البيانات `charityhub` تلقائياً
- ✅ سينشئ جميع الجداول تلقائياً

---

## 📋 الخطوات الكاملة (الطريقة التلقائية):

```powershell
# 1. تأكد من PostgreSQL يعمل
# 2. عدّل .env (DATABASE_URL)

# 3. شغّل Prisma Migrate
cd D:\Charity_Hub\backend
npm run prisma:migrate

# 4. (اختياري) املأ قاعدة البيانات
npm run seed

# 5. شغّل الخادم
npm run dev
```

---

## 🔍 التحقق من قاعدة البيانات:

### في pgAdmin:
1. افتح pgAdmin
2. ابحث عن قاعدة البيانات `charityhub`
3. افتحها → Schemas → public → Tables
4. يجب أن ترى جميع الجداول:
   - families
   - members
   - income_sources
   - expenses
   - medical_records
   - إلخ...

### في psql:
```sql
-- الاتصال بقاعدة البيانات
psql -U postgres -d charityhub

-- عرض الجداول
\dt

-- عرض محتوى جدول
SELECT * FROM families;

-- اخرج
\q
```

---

## ⚠️ حل المشاكل:

### مشكلة: "database does not exist"

**الحل:**
- استخدم الطريقة 1 (إنشاء يدوي)
- أو تأكد من أن PostgreSQL يعمل

### مشكلة: "password authentication failed"

**الحل:**
1. تحقق من كلمة المرور في `.env`
2. جرب إعادة تعيين كلمة مرور PostgreSQL

### مشكلة: "permission denied"

**الحل:**
- تأكد من أن المستخدم `postgres` لديه صلاحيات كافية
- أو استخدم مستخدم آخر

---

## 🎯 التوصية:

**استخدم الطريقة 2 (التلقائية)** إذا:
- ✅ تريد الحل الأسرع
- ✅ لا تمانع أن Prisma ينشئ قاعدة البيانات

**استخدم الطريقة 1 (اليدوية)** إذا:
- ✅ تريد تحكم كامل
- ✅ تريد رؤية قاعدة البيانات في pgAdmin قبل Migration
- ✅ لديك متطلبات خاصة للصلاحيات

---

## 📝 ملخص:

| الطريقة | المميزات | متى تستخدمها |
|---------|----------|--------------|
| **يدوية** | تحكم كامل، مرئية في pgAdmin | إذا تريد التحكم الكامل |
| **تلقائية** | أسهل وأسرع | للبدء السريع ⭐ |

**بالتوفيق! 🚀**
