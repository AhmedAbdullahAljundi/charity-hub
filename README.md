# CharityHub - نظام إدارة الجمعيات الخيرية

## نظرة عامة / Overview

CharityHub is a comprehensive charity management system designed for charitable organizations to manage beneficiaries, donors, volunteers, and staff workflows. The system handles complex PMT (Proxy Means Test) scoring, medical eligibility, educational tracking, and financial assistance distribution.

CharityHub هو نظام شامل لإدارة الجمعيات الخيرية مصمم لإدارة المستفيدين والمتبرعين والمتطوعين وطاقم العمل. يتعامل النظام مع نظام تقييم PMT المعقد، الأهلية الطبية، المتابعة التعليمية، وتوزيع المساعدات المالية.

## المميزات / Features

### ✅ مكتمل / Completed
- ✅ نظام تسجيل الأسر (Family Registration)
- ✅ إدارة الأفراد (Members Management)
- ✅ إدارة الدخل والمصروفات (Income/Expenses Management)
- ✅ السجل الطبي (Medical Records)
- ✅ نظام التقييم PMT (PMT Scoring System)
- ✅ نظام الأهلية الطبية (Medical Eligibility)
- ✅ لوحة التحكم (Dashboard)
- ✅ نظام المصادقة والصلاحيات (Authentication & RBAC)

### 🚧 قيد التطوير / In Progress
- 🚧 المتابعة التعليمية (Educational Tracking)
- 🚧 البحث الميداني (Field Research)
- 🚧 إدارة التوزيع (Distribution Management)
- 🚧 التقارير (Reports)
- 🚧 سجل التعديلات (Audit Log)

## التقنيات المستخدمة / Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **React** (JavaScript)
- **Tailwind CSS**
- **Shadcn/UI**
- **Zustand** (State Management)
- **React Hook Form + Zod** (Forms & Validation)
- **Axios** (API Client)
- **Recharts** (Charts)

### Backend
- **Node.js 18+**
- **Express.js**
- **PostgreSQL**
- **Prisma ORM**
- **JWT** (Authentication)
- **bcryptjs** (Password Hashing)
- **Joi** (Validation)

## البنية / Architecture

```
CharityHub/
├── backend/          # Backend API
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── middleware/  # Express middleware
│   │   ├── modules/     # Feature modules
│   │   ├── services/    # Business logic
│   │   ├── utils/       # Utilities
│   │   └── routes/      # Route aggregators
│   ├── prisma/       # Database schema
│   └── package.json
│
├── frontend/         # Frontend App
│   ├── app/          # Next.js pages
│   ├── components/   # React components
│   ├── lib/          # Utilities & API
│   ├── store/        # Zustand stores
│   └── package.json
│
└── docs/            # Documentation
    ├── WORKFLOW_DOCUMENTATION.md
    ├── PROMPTS/
    └── LEARNING_GUIDE.md
```

## التثبيت والتشغيل / Installation & Setup

### المتطلبات / Requirements
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. تثبيت Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 2. تثبيت Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with API URL
npm run dev
```

### 3. الوصول / Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/api/health

## الوثائق / Documentation

### 📚 الوثائق الكاملة / Full Documentation

1. **WORKFLOW_DOCUMENTATION.md** - توثيق سير العمل الكامل (Arabic & English)
2. **PROMPTS/FRONTEND_PROMPT.md** - Prompt احترافي للفرونت
3. **PROMPTS/BACKEND_PROMPT.md** - Prompt احترافي للباك
4. **LEARNING_GUIDE.md** - دليل التعلم وأفضل برامج AI

### 📖 قراءة الوثائق / Read Documentation

```bash
# Open documentation files
docs/WORKFLOW_DOCUMENTATION.md
docs/PROMPTS/FRONTEND_PROMPT.md
docs/PROMPTS/BACKEND_PROMPT.md
docs/LEARNING_GUIDE.md
```

## API Endpoints

### Families
- `GET /api/v1/families` - List families
- `GET /api/v1/families/:id` - Get family
- `POST /api/v1/families` - Create family
- `PUT /api/v1/families/:id` - Update family
- `DELETE /api/v1/families/:id` - Delete family
- `GET /api/v1/families/:id/score` - Get PMT score

### Members
- `GET /api/v1/members/family/:familyId` - List members
- `POST /api/v1/members/family/:familyId` - Add member
- `PUT /api/v1/members/:id` - Update member
- `DELETE /api/v1/members/:id` - Delete member

### Income & Expenses
- `GET /api/v1/income/family/:familyId` - List income
- `POST /api/v1/income/family/:familyId` - Add income
- `GET /api/v1/expenses/family/:familyId` - List expenses
- `POST /api/v1/expenses/family/:familyId` - Add expense

### Medical
- `GET /api/v1/medical/family/:familyId` - List records
- `POST /api/v1/medical/member/:memberId` - Add record
- `GET /api/v1/medical/evaluate/:familyId` - Evaluate eligibility

## نظام PMT (Proxy Means Test)

النظام يحسب مؤشر الهشاشة بناءً على:
- معاملات العائل (حسب السن)
- معاملات البالغين
- معاملات الأطفال (حسب السن والتعليم)
- معاملات الأمراض المزمنة
- معاملات الإعاقة
- معاملات السكن
- معاملات حالة الأسرة
- معاملات العمل (سالبة)

التصنيف:
- هش للغاية (Very Fragile)
- هش (Fragile)
- ضعيف (Weak)
- متوسط (Moderate)
- خارج الأولوية (Out of Priority)

## نظام الأهلية الطبية

- **الفئة أ**: 90 يوم بين الخدمات
- **الفئة ب**: 60 يوم بين الخدمات
- **الفئة ج**: 30 يوم بين الخدمات
- **مزمن**: تقليل الفترة بـ 10 أيام

## الصلاحيات / Permissions

- `CREATE_FAMILY` - إنشاء عائلة
- `UPDATE_FAMILY` - تحديث عائلة
- `DELETE_FAMILY` - حذف عائلة
- `VIEW_SCORING` - عرض التقييم
- `APPROVE_MEDICAL` - الموافقة على العلاج
- `VIEW_AUDIT_LOG` - عرض سجل التعديلات

## الأدوار / Roles

- **Admin** - إدارة كاملة
- **DataEntry** - إدخال البيانات
- **MedicalOfficer** - الموافقة على العلاج
- **Auditor** - مراجعة السجلات

## المساهمة / Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## الترخيص / License

This project is private and proprietary.

## الدعم / Support

For support, please contact the development team.

## شكر خاص / Acknowledgments

- Shadcn/UI for the component library
- Prisma for the excellent ORM
- Next.js team for the amazing framework

---

**Made with ❤️ for Charity Organizations**
