# API Tutorial Report (Charity Hub)

## الهدف من التقرير
التقرير ده معمول لك كمراجعة عملية سريعة للـ API الموجودة عندك في المشروع، بأسلوب قريب من التوتوريال.

## 1) القاعدة العامة (General Rule)

1. كل API بتبدأ من `http://localhost:5000/api/v1` (إلا health العامة فيها `/api/health`).
2. شكل أي Route غالبًا:
   - `router.METHOD('/path', requireAuth, requirePermission('PERMISSION'), controller.method)`
3. أغلب الـ endpoints محمية بـ JWT token:
   - Header: `Authorization: Bearer <TOKEN>`
4. في المشروع عندك طبقتين حماية:
   - `requireAuth`: يتأكد إن المستخدم مسجل دخول.
   - `requirePermission`: يتأكد من صلاحية معينة (زي `CREATE_FAMILY`, `VIEW_SCORING`).
5. الردود غالبًا موحدة:
   - نجاح: `{ success: true, data, message? }`
   - خطأ: `{ success: false, code, message, details }`

## 2) السينتاكس الموجود فعليًا في مشروعك

### A) Routing Syntax

```js
router.post('/login', authController.login)
router.get('/me', requireAuth, authController.getMe)
router.post('/register', requirePermission('CREATE_FAMILY'), familiesController.register)
```

### B) Controller Syntax

```js
async (req, res, next) => {
  try {
    // business logic
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}
```

### C) Validation Syntax

عندك Joi schemas زي:
- `auth.validator.js` (login)
- `families.validator.js` (payload كبير للتسجيل الكامل)

نمطها:
```js
const schema = Joi.object({ ... })
const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true })
```

## 3) استخدامات الـ API عندك

1. Authentication
   - Login / Logout / Get current user.
2. Families Management
   - إنشاء/تعديل/حذف/عرض عائلات.
   - تسجيل عائلة كامل (`/families/register`) ببيانات مرتبطة.
3. Related Data CRUD
   - أعضاء الأسرة (Members)
   - الدخل (Income)
   - المصروفات (Expenses)
   - الحالات الطبية (Medical)
4. Scoring & Dashboard
   - حساب/إعادة حساب درجة الاستحقاق.
   - إحصائيات Dashboard.

## 4) أشكال البيانات (API Shapes)

### Path Params
مثال:
- `GET /families/:id`
- `DELETE /expenses/:id`

### Query Params
مثال:
- `GET /families?page=1&limit=50&search=...`

### JSON Body
مثال login:
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

مثال add expense:
```json
{
  "amount": 500,
  "category": "food",
  "description": "monthly groceries",
  "date": "2026-03-05"
}
```

## 5) Tutorial عملي: تبدأ منين؟

1. شغل السيرفر backend.
2. اختبر Health:
   - `GET /api/health`
3. اعمل Login:
   - `POST /api/v1/auth/login`
4. انسخ `token` من response.
5. في أي endpoint محمي، حط Header:
   - `Authorization: Bearer <TOKEN>`
6. جرّب endpoint CRUD زي families أو expenses.

## 6) Cheat Sheet (Endpoints سريعة)

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Families
- `POST /api/v1/families/register`
- `GET /api/v1/families`
- `GET /api/v1/families/:id`
- `POST /api/v1/families`
- `PUT /api/v1/families/:id`
- `DELETE /api/v1/families/:id`
- `GET /api/v1/families/:id/score`

### Family sub-resources
- `POST /api/v1/families/:id/persons`
- `DELETE /api/v1/families/persons/:personId`
- `POST /api/v1/families/:id/incomes`
- `DELETE /api/v1/families/incomes/:incomeId`
- `POST /api/v1/families/:id/expenses`
- `DELETE /api/v1/families/expenses/:expenseId`
- `POST /api/v1/families/persons/:personId/medical`
- `DELETE /api/v1/families/medical/:medicalId`

### Expenses module
- `GET /api/v1/expenses/family/:familyId`
- `GET /api/v1/expenses/:id`
- `POST /api/v1/expenses/family/:familyId`
- `PUT /api/v1/expenses/:id`
- `DELETE /api/v1/expenses/:id`

### Others
- `GET /api/v1/dashboard/stats`
- `GET /api/v1/scoring/:familyId`
- `POST /api/v1/scoring/:familyId/recalculate`

## 7) Postman Tutorial (خطوة بخطوة)

1. اعمل Environment:
   - `base_url = http://localhost:5000/api/v1`
   - `token =` (فاضي في الأول)
2. Request 1 (Login):
   - `POST {{base_url}}/auth/login`
   - Body JSON:
```json
{
  "email": "admin@charityhub.local",
  "password": "123456"
}
```
3. من response، انسخ `data.token` أو `token` حسب الريسبونس الفعلي.
4. حط Authorization في باقي requests:
   - Type: Bearer Token
   - Value: `{{token}}`
5. Request 2 (Get me):
   - `GET {{base_url}}/auth/me`
6. Request 3 (List families):
   - `GET {{base_url}}/families?page=1&limit=10`
7. Request 4 (Create expense):
   - `POST {{base_url}}/expenses/family/<familyId>`
   - Body JSON:
```json
{
  "amount": 300,
  "category": "transport",
  "description": "weekly transport"
}
```

## 8) الأخطاء الشائعة وحلها

1. `401 AUTH_REQUIRED`:
   - السبب: مفيش token أو صيغة الهيدر غلط.
   - الحل: تأكد من `Authorization: Bearer <TOKEN>`.
2. `401 INVALID_TOKEN` أو `TOKEN_EXPIRED`:
   - السبب: token منتهي أو غلط.
   - الحل: Login من جديد وخد token جديد.
3. `403 PERMISSION_DENIED`:
   - السبب: المستخدم معندوش الصلاحية المطلوبة للـ endpoint.
   - الحل: استخدم يوزر role مناسب أو عدّل الصلاحيات.
4. `400 VALIDATION_ERROR`:
   - السبب: body ناقص أو نوع بيانات خطأ.
   - الحل: راجع schema المطلوبة (خصوصًا Joi validators).
5. `404 Not Found`:
   - السبب: endpoint غلط أو `id` مش موجود.
   - الحل: راجع URL ووجود السجل في DB.
6. `P2025` (Prisma):
   - السبب: update/delete على سجل مش موجود.
   - الحل: تأكد من الـ id قبل العملية.

## 9) ملاحظة مهمة في وضع التطوير

لو `NODE_ENV=development` و `REQUIRE_AUTH=false`، بعض المسارات ممكن تعدي بدون token (mock user).
ده مفيد للتجربة المحلية فقط، ومش مفروض تعتمد عليه في production.

## 10) ملف مرجعي للأماكن المهمة في الكود

- `backend/src/app.js`
- `backend/src/routes/api.v1.js`
- `backend/src/middleware/auth.js`
- `backend/src/middleware/rbac.js`
- `backend/src/middleware/errorHandler.js`
- `backend/src/modules/auth/*`
- `backend/src/modules/families/*`
- `backend/src/modules/expenses/*`

---

لو عايز نسخة تانية "مستوى مبتدئ جدًا" ممكن أعملها لك كـ "Recipe" جاهزة: 
- كل Endpoint ومعاه Request/Response متوقعين سطر بسطر.
