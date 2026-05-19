# تقرير تفصيلي عن مشروع CharityHub

تاريخ التقرير: 2026-05-18  
المسار المحلي: `D:\Charity_Hub`

## 1. ملخص تنفيذي

مشروع CharityHub هو منصة لإدارة الجمعيات الخيرية والاستهداف الاجتماعي. الهدف الأساسي منه هو تسجيل الأسر المستفيدة، إدارة بيانات أفراد الأسرة، مصادر الدخل، الحالات الصحية والإعاقات، ثم حساب درجة الاستحقاق باستخدام Scoring Engine متعدد الطبقات، مع وجود مراجعة بشرية، تحقق من الدخل، تحليلات، وسجل تدقيق.

المشروع حاليا في مرحلة متقدمة من ناحية الباك إند، خصوصا في قاعدة البيانات، نظام الصلاحيات، المصادقة، ومحرك التقييم. الفرونت إند يحتوي على واجهة واسعة مبنية بـ Next.js مع دعم عربي/إنجليزي واتجاه RTL، لكنه ما زال يحتوي على بعض التداخل بين API قديم وجديد.

أهم ملاحظة معمارية: يوجد مساران داخل المشروع:

- المسار الحديث: `Household / Person / IncomeSource / ScoreResult` تحت `/api/*`.
- المسار القديم أو Legacy: `Families / Members / Expenses / Medical` تحت `/api/v1/*`.

المسار الحديث هو الأساسي حاليا، أما `/api/v1` فهو مغلق افتراضيا ولا يعمل إلا عند تفعيل `ENABLE_LEGACY_API=true`.

## 2. هيكل المشروع

```text
Charity_Hub/
  backend/       Backend API using Express, Prisma, PostgreSQL
  frontend/      Frontend app using Next.js, React, TypeScript
  docs/          Documentation files
  nginx/         NGINX configuration
  *.md           ملفات تشغيل وحالة وتوثيق سريعة
```

أهم الملفات:

- `backend/prisma/schema.prisma`: مصدر الحقيقة الرئيسي لهيكل قاعدة البيانات.
- `backend/src/server.js`: نقطة تشغيل الخادم.
- `backend/src/app.js`: إعداد Express middleware والمسارات.
- `backend/src/routes/api.js`: Router الأساسي الحديث تحت `/api`.
- `backend/src/routes/api.v1.js`: Router قديم اختياري تحت `/api/v1`.
- `frontend/app/[locale]/layout.tsx`: Layout يدعم اللغات والاتجاه.
- `frontend/app/[locale]/dashboard/page.tsx`: Dashboard الرئيسي.
- `frontend/lib/api/client.ts`: Axios client الحديث مع JWT refresh.
- `frontend/lib/stores/*`: Zustand stores.

## 3. التقنيات المستخدمة

### Backend

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT authentication
- bcryptjs
- Joi و Zod للتحقق من البيانات
- express-rate-limit
- helmet
- compression
- Jest و Supertest للاختبارات

### Frontend

- Next.js 16 حسب `frontend/package.json`
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui و Radix UI
- Zustand
- Axios
- next-intl
- Recharts
- Playwright موجود كاعتماد dev

### Deployment / Infrastructure

- Docker Compose files موجودة
- NGINX config موجود
- PostgreSQL هو قاعدة البيانات المتوقعة

## 4. معمارية الباك إند

الباك إند منظم بشكل طبقي:

```text
backend/src/
  app.js
  server.js
  config/
  middleware/
  routes/
  modules/
  domains/
  shared/
  services/
  utils/
```

### 4.1 App و Server

`server.js` يشغل Express app على البورت المحدد في env، ويحتوي على graceful shutdown يغلق HTTP server و Prisma connection.

`app.js` يجهز:

- Trace ID middleware.
- Helmet للحماية.
- CORS.
- JSON body parser بحد `10mb`.
- Sanitization للـ body.
- Compression.
- Health endpoint على `/api/health`.
- Router الحديث على `/api`.
- Router legacy على `/api/v1` عند تفعيل `ENABLE_LEGACY_API`.
- Not found handler.
- Error handler مركزي.

### 4.2 إعدادات البيئة

الملف `backend/src/config/env.js` يقرأ:

- `PORT`
- `NODE_ENV`
- `BASE_URL`
- `DATABASE_URL`
- JWT secrets و expiry
- cache provider
- CORS origin
- `REQUIRE_AUTH`
- `ENABLE_LEGACY_API`
- scoring engine version و rule version

في production يوجد check يمنع تشغيل النظام بدون JWT secrets حقيقية.

## 5. API الحالي

### 5.1 API الحديث `/api`

المسارات الموجودة في `backend/src/routes/api.js`:

| المسار | الوظيفة |
|---|---|
| `/api/auth` | login, refresh, logout, me |
| `/api/households` | إدارة الأسر الحديثة |
| `/api/simulate` | تشغيل سيناريوهات افتراضية بدون حفظ |
| `/api/admin` | إدارة القواعد والأوزان |
| `/api/analytics` | إحصائيات وتحليلات |
| `/api/audit-logs` | سجل التدقيق |
| `/api/verification` | تحقق مصادر الدخل |

### 5.2 API القديم `/api/v1`

المسارات الموجودة في `backend/src/routes/api.v1.js`:

| المسار | الوظيفة |
|---|---|
| `/api/v1/auth` | مصادقة |
| `/api/v1/families` | إدارة أسر بالنظام القديم |
| `/api/v1/dashboard` | Dashboard legacy |
| `/api/v1/scoring` | Scoring legacy |
| `/api/v1/members` | أفراد legacy |
| `/api/v1/income` | دخل legacy/جزئي |
| `/api/v1/expenses` | مصروفات legacy |
| `/api/v1/medical` | طبي legacy |

هذا المسار غير مفعل افتراضيا، وهذا مهم لأن بعض أجزاء الفرونت ما زالت تستدعي `/api/v1/dashboard/...`.

## 6. قاعدة البيانات و Prisma Schema

`backend/prisma/schema.prisma` هو أهم ملف في المشروع. التصميم الحالي واضح أنه نسخة حديثة لمنصة Social Assistance Targeting، وفيه تعليق مهم: كل الأوزان والدرجات والقيم المالية يجب أن تستخدم `Decimal` وليس `Float`.

### 6.1 أهم Enums

- `Gender`: ذكر/أنثى.
- `MaritalStatus`: متزوج، مطلق، أرمل، أعزب.
- `ResidencyStatus`: مقيم أو غائب بسبب وفاة/سجن/طلاق/غيره.
- `EmploymentType`: لا يعمل، ضعيف، موسمي، منتظم، خارج البلد بدرجات مختلفة.
- `EmploymentQuality`: كاف، غير مستقر، ضعيف.
- `EducationLevel`: أمي، متوسط، عالي محدود، عالي مستقر.
- `StudentLevel`: طفل، حضانة، ابتدائي، إعدادي، ثانوي، جامعة.
- `PersonRole`: رب الأسرة، زوج/زوجة، طفل، تابع بالغ، آخر.
- `HousingType`: ملك، مشترك، إيجار متبرع به، إيجار.
- `SeverityGrade`: A إلى F.
- `IncomeChannel`: معاش، تكافل وكرامة، جمعيات، متبرعين، نفقة.
- `EligibilityLevel`: critical, high need, moderate need, low need, not eligible.
- `HumanDecision`: pending, approved, rejected, needs review, escalated.
- `ReviewStatus`: awaiting score, score ready, under review, field visit required, decided.
- `UserRole`: admin, supervisor, worker, viewer.
- `Locale`: ar, en.

### 6.2 Models الرئيسية

#### User

يمثل مستخدم النظام. يحتوي على:

- الاسم والبريد وكلمة المرور المشفرة.
- الدور.
- اللغة المفضلة.
- حالة النشاط.
- نطاق جغرافي اختياري: محافظة/مركز.
- علاقات مع الأسر، القرارات، audit logs، refresh tokens.

#### RefreshToken

يحفظ refresh tokens كـ hash وليس token صريح. يدعم:

- انتهاء الصلاحية.
- الإلغاء `revokedAt`.
- علاقة بالمستخدم.

#### Household

الكيان المركزي للأسرة في النظام الحديث. يحتوي على:

- كود فريد.
- المحافظة، المركز، القرية، العنوان.
- نوع السكن.
- بطاقة تموين، دعم أسري، مساعدات غذائية.
- درجة أصول بنكية.
- notes.
- draft state.
- createdBy.
- علاقات مع persons, incomeSources, temporaryBurdens, scoreResults, auditLogs.

#### Person

يمثل فرد داخل الأسرة. يحتوي على:

- الاسم، الجنس، تاريخ الميلاد.
- الدور داخل الأسرة.
- الحالة الاجتماعية.
- حالة الإقامة أو الغياب.
- هل هو رب الأسرة.
- بيانات الطالب.
- بيانات العمل.
- التعليم.
- النفقة.
- مساهمة الابن.
- حالة عروس.
- حالة السجين.
- اليتيم.
- علاقات diseases و disabilities.

#### Disease

حالة مرضية مرتبطة بشخص:

- اسم المرض.
- تكلفة العلاج.
- المتابعة.
- تأثير المرض على العمل.

#### Disability

إعاقة مرتبطة بشخص:

- الوصف.
- تأثير الإعاقة على العمل.
- احتياج مرافق.
- تكلفة علاج.

#### TemporaryBurden

أعباء مؤقتة للأسرة:

- دين.
- إصابة.
- عملية.
- عروس.
- ابن في السجن.

#### IncomeSource

مصدر دخل شهري:

- القناة.
- القيمة الشهرية Decimal.
- حالة التحقق.
- ملاحظة التحقق.
- وقت ومن قام بالتحقق.

يوجد قيد uniqueness على `householdId + channel`، أي لا يمكن تكرار نفس قناة الدخل لنفس الأسرة.

#### ScoreResult

لقطة نتيجة التقييم. يحتوي على:

- engine version و rule version.
- snapshot للأوزان.
- vulnerabilityScore.
- reductionScore.
- confidenceScore.
- fraudRiskScore.
- finalScore.
- normalizedPercent.
- systemRecommendation.
- humanDecision.
- reviewStatus.
- previousScore و scoreDelta.
- calculation snapshot.
- layer breakdown.
- عوامل إيجابية وسلبية.
- recommendations و warnings.
- rawInputSnapshot.

هذا التصميم مناسب جدا للتدقيق، لأنه يحفظ نتيجة كل تشغيل مع تفاصيلها.

#### RuleOverride

يسمح بتعديل وزن أو قاعدة معينة:

- ruleId.
- overrideValue.
- reason.
- active.
- setById.
- expiresAt.

#### AuditLog

يحفظ تغييرات النظام:

- user.
- household.
- action.
- entity.
- before/after.
- IP و user agent.

## 7. نظام المصادقة والصلاحيات

### 7.1 Authentication

الملف الأساسي: `backend/src/modules/auth/auth.service.js`

النظام يستخدم:

- Access token قصير العمر.
- Refresh token أطول عمرا.
- Refresh token rotation.
- تخزين refresh token كـ SHA-256 hash في قاعدة البيانات.
- bcrypt لمقارنة كلمة المرور.

العمليات:

- `login`: يتحقق من المستخدم وكلمة المرور ويرجع token pair.
- `refresh`: يتحقق من refresh token، يلغي القديم، ويصدر زوج جديد.
- `logout`: يلغي refresh token.
- `me`: يرجع بيانات المستخدم الحالية.

### 7.2 RBAC

الصلاحيات معرفة في `backend/src/shared/permissions.js`.

الأدوار:

- `ADMIN`: كل الصلاحيات.
- `SUPERVISOR`: قراءة/كتابة الأسر، نشر، تحقق دخل، scoring، محاكاة، قواعد قراءة، تحليلات، audit، verification bulk.
- `WORKER`: قراءة/كتابة الأسر، نشر، كتابة دخل، حساب score، قراءة score، simulate، verification read.
- `VIEWER`: قراءة الأسر والدرجات والتحليلات والتحقق.

أهم الصلاحيات:

- `household:read`
- `household:write`
- `household:publish`
- `income:write`
- `income:verify`
- `score:calculate`
- `score:read`
- `score:decide`
- `score:simulate`
- `rules:read`
- `rules:write`
- `analytics:read`
- `audit:read`
- `verification:read`
- `verification:bulk`

## 8. Scoring Engine

محرك التقييم هو قلب المشروع.

الملفات الأساسية:

- `backend/src/domains/scoring/engine/pipeline.js`
- `backend/src/domains/scoring/engine/engine.js`
- `backend/src/domains/scoring/engine/aggregator.js`
- `backend/src/domains/scoring/engine/normalizer.js`
- `backend/src/domains/scoring/engine/layers/*`
- `backend/src/domains/scoring/registry/ruleRegistry.js`
- `backend/src/modules/scoring/scoring.service.js`

### 8.1 Flow

`runScoringPipeline(householdId, { persist })` يعمل:

1. تحميل الأسرة كاملة من repository.
2. تحويل بيانات Prisma إلى input normalized.
3. تحميل القواعد والأوزان.
4. تشغيل `runScoringEngine`.
5. تسجيل log.
6. حفظ النتيجة في `ScoreResult` إذا كان `persist !== false`.

### 8.2 الطبقات

المحرك الحالي يحتوي على طبقات:

- `L1-head`: حالة رب الأسرة.
- `L2-dependents`: التابعين والمعالين.
- `L3-students`: الطلاب.
- `L4-vulnerability`: الهشاشة الخاصة.
- `L5-burdens`: الأعباء المؤقتة.
- `L5b-housing`: السكن.
- `L6-health`: المرض والإعاقة.
- `L7-reduction`: خصومات أو عوامل تقليل.
- `L8-income`: الدخل.

بالإضافة إلى:

- `vulnerability-engine`
- `reduction-engine`
- `confidence-engine`
- `fraud-engine`

### 8.3 Aggregation

الـ aggregator يجمع:

- vulnerabilityScore
- reductionScore
- incomeAdjustment
- confidenceScore

ثم يحسب:

- finalScore
- normalizedPercent
- systemRecommendation
- humanDecision = pending
- reviewStatus = score ready

### 8.4 ScoreResult history

كل عملية حساب يمكن أن تحفظ نتيجة جديدة، وهذا يسمح بوجود history للأسرة، ومقارنة previousScore و scoreDelta.

## 9. Modules في الباك إند

### 9.1 Auth

مسؤول عن:

- login.
- refresh.
- logout.
- me.
- إصدار JWT.
- إدارة refresh tokens.

### 9.2 Households

المسار الحديث لإدارة الأسرة:

- list مع pagination و filters.
- create draft.
- get by id.
- update.
- delete للـ admin.
- publish.
- access control حسب دور المستخدم ونطاقه الجغرافي.

### 9.3 Persons

يستخدم داخل `/households/:id/persons`:

- create/update/delete person.
- create/update/delete diseases.
- create/update/delete disabilities.

### 9.4 Income

يستخدم داخل `/households/:id/income`:

- create.
- update.
- delete.
- verify income source.

### 9.5 Scoring

مركب داخل household routes:

- calculate.
- score history.
- latest score.
- decide latest score.

### 9.6 Simulate

يشغل scoring بدون persistence:

- يأخذ householdId.
- يطبق modifications افتراضية.
- يرجع originalScore و simulatedScore و scoreDelta و affectedLayers.

### 9.7 Verification

يدير تحقق مصادر الدخل:

- list حسب status/channel.
- bulk verify.
- يسجل audit عند تغيير حالة التحقق.

### 9.8 Analytics

يوفر:

- distribution حسب recommendation.
- regional stats.
- health burden.
- score trends.
- verification stats.

يوجد cache لبعض التحليلات لمدة محددة.

### 9.9 Admin

يدير:

- عرض القواعد.
- override rule.
- revert override.
- simulate rule impact.

### 9.10 Audit

يعرض audit logs للمستخدمين أصحاب الصلاحية.

### 9.11 Legacy Modules

ما زالت موجودة:

- families.
- members.
- expenses.
- medical.
- dashboard legacy.

هذه تخص النظام القديم `/api/v1` أو أجزاء متبقية من مرحلة سابقة.

## 10. معمارية الفرونت إند

الفرونت مبني باستخدام Next.js App Router:

```text
frontend/app/
  [locale]/
    login/
    dashboard/
      page.tsx
      households/
      families/
      analytics/
      verification/
      admin/
      audit/
      medical/
      education/
      reports/
      users/
      volunteers/
```

### 10.1 Internationalization

يدعم:

- Arabic.
- English.
- `localePrefix: always`.
- default locale هو `ar`.
- `dir=rtl` للعربي و `ltr` للإنجليزي.

الرسائل موجودة في:

- `frontend/messages/ar`
- `frontend/messages/en`

### 10.2 Layout

`frontend/app/[locale]/layout.tsx`:

- يضبط metadata.
- يستخدم IBM Plex Sans Arabic.
- يوفر ThemeProvider.
- يوفر NextIntlClientProvider.
- يوفر GlobalErrorBoundary.
- يوفر Toaster.

`frontend/app/[locale]/dashboard/layout.tsx`:

- Sidebar.
- Topbar dynamic.
- main content.

### 10.3 Sidebar

القائمة الجانبية تعرض:

- Dashboard.
- Households.
- Medical.
- Education.
- Volunteers.
- Analytics.
- Verification.
- Admin.
- Audit.
- Reports.
- Users.

### 10.4 API Clients

يوجد client حديث:

- `frontend/lib/api/client.ts`

مميزاته:

- baseURL = `http://localhost:5000/api`.
- يضيف access token من localStorage.
- يضيف `Accept-Language`.
- عند 401 يحاول refresh token.
- إذا فشل refresh يحول المستخدم إلى `/[locale]/login`.

يوجد client أقدم:

- `frontend/lib/api.ts`

هذا أبسط ولا يحتوي على refresh token بنفس جودة client الحديث. وجود الاثنين يوضح وجود مرحلة انتقالية.

### 10.5 Zustand Stores

الـ stores الأساسية:

- `authStore`: login/logout/refresh/me.
- `householdStore`: CRUD للأسر الحديثة.
- `wizardStore`: إدارة wizard متعدد الخطوات و autosave.
- `scoringStore`: حساب score، latest، history، simulate.
- `dashboard`: تحميل dashboard bundle.
- `adminStore`: إدارة القواعد.
- `families`: غالبا توافق مع legacy/واجهة قديمة.

### 10.6 Wizard

يوجد wizard لإنشاء/تحرير household:

- Autosave.
- 7 steps.
- flags شرطية حسب بيانات رب الأسرة/المرض/الإعاقة/الأعباء.
- تحميل البيانات من household.
- ارتباط مع scoring store لجلب آخر score.

## 11. حالة الاختبارات والتحقق

تم تشغيل اختبارات الباك إند بالأمر:

```bash
npm.cmd test -- --runInBand
```

النتيجة:

```text
6 test suites passed
2 test suites skipped
58 tests passed
11 tests skipped
69 tests total
```

هذا مؤشر جيد أن أجزاء مهمة من الباك إند، خصوصا scoring وبعض integration tests، تعمل حاليا.

تمت محاولة تشغيل lint للفرونت:

```bash
npm.cmd run lint
```

لكن النتيجة:

```text
'eslint' is not recognized as an internal or external command
```

معنى ذلك أن `eslint` غير مثبت أو غير متاح داخل `frontend/node_modules/.bin` رغم وجود script في `package.json`.

## 12. حالة المشروع الحالية

### نقاط قوية

- Prisma schema حديث ومنظم.
- استخدام Decimal للقيم الحساسة.
- Scoring engine منفصل عن Express ومقسم إلى طبقات.
- وجود history للدرجات.
- JWT refresh rotation مطبق بطريقة جيدة.
- RBAC واضح.
- وجود audit logging.
- وجود cache للتحليلات.
- الفرونت يدعم عربي/إنجليزي و RTL.
- UI واسع ويغطي dashboard، households، verification، admin، audit.
- اختبارات الباك إند تمر بنجاح.

### نقاط غير مكتملة أو تحتاج توحيد

- وجود ازدواجية بين `families` و `households`.
- وجود ازدواجية بين `/api` و `/api/v1`.
- dashboard store في الفرونت يستدعي `/v1/dashboard/...` رغم أن legacy API مغلق افتراضيا.
- وجود clientين للـ API في الفرونت.
- بعض ملفات docs قديمة أو لا تطابق الكود الحالي بالكامل.
- بعض النصوص العربية في docs/logs تظهر بترميز مكسور.
- frontend lint لا يعمل لأن eslint غير متاح.
- git status يحتوي تغييرات كثيرة جدا، منها `node_modules` و generated Prisma client.

## 13. مخاطر تقنية

### 13.1 خطر API mismatch

الفرونت الحديث يعتمد غالبا على `/api/households`، لكن dashboard store يستخدم `/api/v1/dashboard`. إذا لم يتم تفعيل legacy API، الداشبورد قد يفشل جزئيا أو كليا.

### 13.2 خطر ازدواجية الدومين

وجود `Family` legacy و `Household` modern قد يسبب:

- تكرار logic.
- اختلاف في شكل البيانات.
- صعوبة الصيانة.
- أخطاء في الفرونت عند الانتقال بين صفحات قديمة وحديثة.

### 13.3 خطر Git / Repository hygiene

ظهور `node_modules` وملفات generated في git status يجعل المراجعة والدمج أصعب، وقد يسبب تضخم المستودع.

### 13.4 خطر التوثيق غير المتزامن

بعض ملفات docs تصف endpoints قد لا تطابق المسارات الفعلية. مثال: API reference يذكر `/api/scoring/:id/recalculate` بينما الكود الحالي يركب scoring routes داخل `/api/households/:id`.

### 13.5 خطر عدم تحقق الفرونت

عدم عمل lint يعني أن أخطاء TypeScript/ESLint قد تكون موجودة ولم تظهر بعد.

## 14. توصيات مرتبة بالأولوية

### أولوية 1: توحيد API

- اعتماد `/api` كمسار رسمي.
- نقل أي functionality من `/api/v1/dashboard` إلى `/api/analytics` أو `/api/dashboard` حديث.
- تحديث frontend dashboard store لاستخدام endpoints حديثة.
- إيقاف الاعتماد على legacy تدريجيا.

### أولوية 2: توحيد الدومين

- اعتبار `Household` هو الاسم الرسمي.
- تحديد هل `families` مجرد legacy أم سيتم حذفها.
- تحويل أي صفحات frontend قديمة من families إلى households أو فصلها بوضوح.

### أولوية 3: تنظيف API clients

- اعتماد `frontend/lib/api/client.ts` فقط.
- حذف أو تجميد `frontend/lib/api.ts`.
- توحيد token handling و refresh behavior.

### أولوية 4: إصلاح frontend tooling

- تثبيت eslint أو تعديل script.
- تشغيل:

```bash
npm install
npm run lint
npm run build
```

داخل `frontend`.

### أولوية 5: تنظيف Git

- التأكد من `.gitignore` يحتوي:

```gitignore
node_modules/
.next/
dist/
coverage/
*.tsbuildinfo
backend/node_modules/.prisma/client/
```

- إزالة tracking من generated files إذا كانت متتبعة سابقا.

### أولوية 6: تحديث التوثيق

- تحديث `docs/API_REFERENCE.md` حسب المسارات الفعلية.
- تحديث `README.md` بترميز UTF-8 صحيح.
- كتابة Migration note بين legacy و modern.

## 15. خريطة تشغيل مختصرة

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Health:

```text
GET http://localhost:5000/api/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

URL:

```text
http://localhost:3000
```

## 16. التقييم النهائي

المشروع قوي ومبني على أساس جيد، خصوصا في الباك إند ومحرك التقييم. هو ليس مجرد CRUD بسيط؛ فيه domain logic واضح، scoring pipeline، صلاحيات، تحقق، audit، وanalytics.

لكن المشروع في حالة انتقالية بين نسخة قديمة ونسخة حديثة. أكبر مهمة الآن ليست إضافة features جديدة، بل تثبيت المعمارية:

1. اعتماد `Household` و `/api` كالمسار الرسمي.
2. نقل dashboard بالكامل للمسار الحديث.
3. تنظيف legacy أو عزله.
4. إصلاح tooling للفرونت.
5. تنظيف repository من الملفات generated والحزم.

بعد هذه الخطوات سيكون المشروع أسهل بكثير في التطوير، الاختبار، والنشر.
