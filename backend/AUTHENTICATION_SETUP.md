# 🔐 Authentication System - Setup Guide

## ✅ ما تم إنجازه

### 1. Authentication Module (`src/modules/auth/`)

#### الملفات:
- ✅ `auth.controller.js` - معالجات HTTP
- ✅ `auth.service.js` - منطق الأعمال (Login, JWT)
- ✅ `auth.validator.js` - التحقق من المدخلات (Joi)
- ✅ `auth.routes.js` - تعريفات المسارات

### 2. Middleware (`src/middleware/`)

#### الملفات:
- ✅ `auth.js` - `requireAuth` middleware (محسّن - بدون استعلام قاعدة بيانات)
- ✅ `rbac.js` - `requirePermission` middleware (محسّن - يقرأ من token)

### 3. Security Features

- ✅ Password hashing (bcryptjs, salt rounds = 10)
- ✅ JWT token generation
- ✅ Permissions embedded in token
- ✅ Input validation (Joi)
- ✅ Error handling

---

## 🚀 كيفية الاستخدام

### 1. تسجيل الدخول

```bash
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@charityhub.com",
  "password": "password123"
}
```

**الرد:**
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "user": {
      "id": "uuid",
      "name": "أحمد محمد",
      "email": "admin@charityhub.com",
      "role": {
        "name": "Admin"
      },
      "permissions": ["CREATE_FAMILY", "UPDATE_FAMILY", ...]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. استخدام Token في الطلبات

```bash
GET http://localhost:5000/api/v1/families
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. حماية المسارات

**مثال في `families.routes.js`:**
```javascript
router.post(
  '/',
  requireAuth,                    // التحقق من Token
  requirePermission('CREATE_FAMILY'), // التحقق من الصلاحية
  familiesController.create
)
```

---

## 🔑 JWT Token Structure

### Payload:
```json
{
  "userId": "uuid",
  "role": "Admin",
  "permissions": ["CREATE_FAMILY", "UPDATE_FAMILY", ...],
  "email": "admin@charityhub.com"
}
```

### المميزات:
- ✅ **Expiration:** 24 ساعة
- ✅ **Secret:** من `JWT_SECRET` في `.env`
- ✅ **Permissions embedded:** لا حاجة لاستعلام قاعدة البيانات

---

## 📋 المسارات المحمية

### Families Routes:
- `GET /api/v1/families` - يتطلب `VIEW_SCORING`
- `POST /api/v1/families` - يتطلب `CREATE_FAMILY`
- `PUT /api/v1/families/:id` - يتطلب `UPDATE_FAMILY`
- `DELETE /api/v1/families/:id` - يتطلب `DELETE_FAMILY`
- `GET /api/v1/families/:id/score` - يتطلب `VIEW_SCORING`

### Scoring Routes:
- `GET /api/v1/scoring/:familyId` - يتطلب `VIEW_SCORING`

---

## 🧪 اختبار النظام

### 1. إنشاء مستخدم تجريبي

```sql
-- في PostgreSQL
INSERT INTO users (id, name, email, password, role_id)
VALUES (
  gen_random_uuid(),
  'أحمد محمد',
  'admin@charityhub.com',
  '$2a$10$...', -- كلمة مرور مشفرة
  (SELECT id FROM roles WHERE name = 'Admin')
);
```

### 2. تسجيل الدخول

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@charityhub.com",
    "password": "password123"
  }'
```

### 3. استخدام Token

```bash
curl http://localhost:5000/api/v1/families \
  -H "Authorization: Bearer <token>"
```

---

## ⚙️ الإعدادات المطلوبة

### ملف `.env`:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

---

## 🔒 الأمان

### Password Hashing:
- ✅ bcryptjs مع salt rounds = 10
- ✅ لا يتم تخزين كلمات المرور كنص عادي

### Token Security:
- ✅ HTTP Bearer scheme
- ✅ Expiration: 24 hours
- ✅ Secret من environment variables
- ✅ Permissions في token (لا استعلام قاعدة بيانات)

### Input Validation:
- ✅ Joi validation
- ✅ رسائل خطأ عربية

---

## 📝 ملاحظات مهمة

1. **Permissions في Token:** الصلاحيات موجودة في token، لا حاجة لاستعلام قاعدة البيانات في كل طلب
2. **Password Hashing:** جميع كلمات المرور مشفرة بـ bcryptjs
3. **Clean Architecture:** منطق الأعمال في Service، Controllers رقيقة
4. **Error Handling:** معالجة أخطاء موحدة مع رسائل عربية

---

## 🎯 الخطوات التالية

1. ✅ إنشاء مستخدم تجريبي في قاعدة البيانات
2. ✅ اختبار Login API
3. ✅ اختبار المسارات المحمية
4. ✅ ربط Frontend مع Authentication

**بالتوفيق! 🚀**
