# CharityHub - Complete Setup Guide

## Quick Start

### Backend Setup (5 minutes)

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with your database credentials

# 4. Initialize database
npm run prisma:generate
npm run prisma:migrate

# 5. Seed database (optional)
npm run seed

# 6. Start server
npm run dev
```

Backend will run on: `http://localhost:5000`

### Frontend Setup (3 minutes)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env.local file
cp .env.local.example .env.local
# .env.local is already configured correctly

# 4. Start development server
npm run dev
```

Frontend will run on: `http://localhost:3000`

## Testing Full Flow

### Step 1: Verify Backend Health

```bash
curl http://localhost:5000/api/health
```

Expected:
```json
{
  "status": "CharityHub Backend Running",
  "timestamp": "...",
  "environment": "development"
}
```

### Step 2: Verify Frontend Connection

1. Open `http://localhost:3000`
2. Check Dashboard page
3. Look for green badge: **"الخادم يعمل بنجاح"**

### Step 3: Add Family

1. Navigate to Families page (or create it)
2. Click "إضافة عائلة"
3. Fill form:
   - اسم رب الأسرة: أحمد محمد
   - رقم الهوية: 1234567890
   - الهاتف: 0501234567
   - العنوان: الرياض، حي النرجس
   - نوع السكن: إيجار
4. Click "حفظ"
5. See success toast: "تم إضافة العائلة بنجاح"

### Step 4: Add Members

1. Open family profile (click on family)
2. Go to "الأفراد" tab
3. Click "إضافة فرد"
4. Fill form:
   - الاسم الكامل: فاطمة أحمد
   - العمر: 35
   - الجنس: أنثى
   - المستوى التعليمي: ثانوي
   - معاق: ✓
5. Click "حفظ"

### Step 5: Add Income

1. Go to "الدخل" tab
2. Click "إضافة مصدر دخل"
3. Fill form:
   - نوع الدخل: مساعدات
   - المبلغ: 2000
   - مؤكد: ✓
4. Click "حفظ"

### Step 6: Calculate Score

1. Go to "نتيجة التقييم" tab
2. Score is calculated automatically
3. See:
   - إجمالي الاحتياج
   - إجمالي الدخل
   - مؤشر الهشاشة
   - التصنيف (with colored badge)

### Step 7: View Classification

Check the classification badge:
- **Fragile (هش للغاية)** → Red badge
- **Weak (ضعيف)** → Orange badge
- **Moderate (متوسط)** → Blue badge
- **OutOfPriority (خارج الأولوية)** → Gray badge

## API Endpoints

### Families
- `GET /api/v1/families` - List families
- `POST /api/v1/families` - Create family
- `GET /api/v1/families/:id` - Get family
- `PUT /api/v1/families/:id` - Update family
- `DELETE /api/v1/families/:id` - Delete family
- `GET /api/v1/families/:id/score` - Get family score

### Scoring
- `GET /api/v1/scoring/:familyId` - Calculate score

## Troubleshooting

### Backend Issues

**Database Connection Error:**
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
# Test connection: psql -U username -d charityhub
```

**Port Already in Use:**
```bash
# Change PORT in .env
# Or kill process: lsof -ti:5000 | xargs kill
```

### Frontend Issues

**Cannot Connect to Backend:**
1. Ensure backend is running
2. Check `.env.local` has correct API URL
3. Verify CORS is configured in backend

**CORS Errors:**
1. Check backend `CORS_ORIGIN` in `.env`
2. Restart backend server
3. Clear browser cache

## File Structure

```
CharityHub/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app
│   │   ├── server.js           # Server entry
│   │   ├── config/             # Configuration
│   │   ├── middleware/         # Middleware
│   │   ├── routes/             # API routes
│   │   ├── modules/            # Feature modules
│   │   └── services/           # Business logic
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── .env                    # Environment variables
│
└── frontend/
    ├── app/                    # Next.js pages
    ├── components/             # React components
    ├── lib/                    # Utilities & API
    ├── store/                  # Zustand stores
    └── .env.local              # Environment variables
```

## Next Steps

1. ✅ Backend running on port 5000
2. ✅ Frontend running on port 3000
3. ✅ Health check working
4. ✅ Add Family form working
5. ✅ Scoring calculation working
6. ⏭️ Add authentication
7. ⏭️ Add more features
8. ⏭️ Deploy to production

## Support

For issues:
1. Check console logs (backend & frontend)
2. Verify environment variables
3. Check database connection
4. Review API responses in Network tab

Happy coding! 🚀
