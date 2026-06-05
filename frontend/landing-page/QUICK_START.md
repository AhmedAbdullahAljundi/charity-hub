# CharityHub Frontend - Quick Start Guide

## 🎯 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd charityhub-frontend
pnpm install
```
⏱️ ~2 minutes

### Step 2: Run Development Server
```bash
pnpm dev
```
⏱️ ~30 seconds

### Step 3: Open in Browser
```
http://localhost:3000
```
✅ You're now running the app!

---

## 🔐 Test Login (5 Seconds)

### Default Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@charityhub.org | Admin@1234 |
| **Supervisor** | supervisor@charityhub.org | Super@1234 |
| **Worker** | worker@charityhub.org | Worker@1234 |
| **Viewer** | viewer@charityhub.org | View@1234 |

### Try It Out
1. Go to `/login`
2. Enter: `admin@charityhub.org`
3. Password: `Admin@1234`
4. Click "تسجيل الدخول"
5. ✅ You're logged in!

---

## 📱 What You'll See

### Home Page
```
┌─────────────────────────────────────┐
│          CharityHub Logo             │
│                                      │
│      نرحب بك (Welcome)               │
│      Social Assistance Platform      │
│      [تسجيل الدخول Button]          │
└─────────────────────────────────────┘
```

### Login Page
```
┌─────────────────┬─────────────────┐
│                 │                  │
│  Gradient Panel │  Login Form      │
│  • Logo         │  • Email Input   │
│  • Features     │  • Password      │
│  • Quote        │  • Remember Me   │
│                 │  • Submit Button │
│                 │  • Footer        │
│                 │                  │
└─────────────────┴─────────────────┘
```

### Dashboard
```
┌──────────┬────────────────────────┐
│ Sidebar  │ Main Content           │
│          │                        │
│ CH Logo  │ Welcome Card           │
│ ────────── KPI Cards             │
│ Dashboard│ Quick Links            │
│ Families │                        │
│ Users    │                        │
│ ────────── User Menu (Top Right) │
│ Profile  │ • Role Badge           │
│ • Avatar │ • Last Login           │
│          │ • Settings             │
│          │ • Logout               │
└──────────┴────────────────────────┘
```

---

## 🎮 Interactive Features to Try

### 1. Login as Different Roles
```
Try admin@charityhub.org    → See full dashboard
Try worker@charityhub.org   → See limited menu
Try viewer@charityhub.org   → See read-only interface
```

### 2. Test Dark Mode
```
Look for dark mode toggle (or use system preference)
Everything adapts to dark theme
```

### 3. Test RTL/LTR
```
Change browser language to Arabic
Interface automatically becomes RTL (right-to-left)
All icons flip correctly
```

### 4. Mobile View
```
Press F12 → Click Device Toolbar (Ctrl+Shift+M)
Try iPhone layout
Sidebar should collapse
Everything should be readable
```

### 5. Explore Navigation
```
Click different menu items
Try /dashboard → /dashboard/households → /dashboard/users
Try logging out and logging back in
```

---

## 🔧 Environment Setup (Optional)

Create `.env.local` in the root directory:

```bash
# Backend API URL (when ready to connect)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional: API timeout
NEXT_PUBLIC_API_TIMEOUT=30000
```

**Note:** Currently uses mock data. Set these when connecting to backend.

---

## 📂 Project Structure (Quick Overview)

```
charityhub-frontend/
├── app/                          # Next.js app directory
│   ├── login/                    # Login pages
│   ├── dashboard/                # Protected dashboard
│   │   ├── households/           # Households list
│   │   └── users/                # User management
│   └── api/                      # API routes
│
├── lib/                          # Utilities & business logic
│   ├── api/                      # API client (Axios)
│   ├── hooks/                    # React hooks
│   └── stores/                   # State management (Zustand)
│
└── public/                       # Static assets
```

---

## 🚀 Common Tasks

### View the Login Page
```
URL: http://localhost:3000/login
No login required - go directly
```

### Access Dashboard
```
1. Go to /login
2. Enter credentials
3. Click login
4. Redirected to /dashboard
```

### Check Permissions
```
1. Login as VIEWER
2. Try clicking edit button → Hidden!
3. Logout and login as ADMIN
4. Edit button appears
```

### View Households (Mock Data)
```
1. Login
2. Click "الأسر" (Families) in sidebar
3. See mock household list
4. Try search feature
```

### View Users (Admin Only)
```
1. Login as ADMIN
2. Click "إدارة المستخدمين" (User Management)
3. See user list
4. (Non-admin users see 403 error)
```

---

## 🔍 Code Examples

### Check User Permissions in Code
```typescript
import { usePermission } from '@/lib/hooks/usePermission'

export function MyComponent() {
  const canEdit = usePermission('HOUSEHOLD_WRITE')
  const canDelete = usePermission('HOUSEHOLD_DELETE')
  
  return (
    <div>
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
    </div>
  )
}
```

### Get Current User
```typescript
import { useUser } from '@/lib/hooks/usePermission'

export function UserProfile() {
  const user = useUser()
  
  return <p>Welcome, {user?.name}!</p>
}
```

### Make API Call (When Backend Ready)
```typescript
import { householdsAPI } from '@/lib/api/client'

const { data } = await householdsAPI.list()
const household = await householdsAPI.get('household-id')
await householdsAPI.create(newData)
```

---

## 📊 Build & Deploy

### Build for Production
```bash
pnpm build
```
✅ Creates optimized build in `.next/`

### Start Production Server
```bash
pnpm start
```
✅ Runs production build locally

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | `pnpm dev -p 3001` |
| Dependencies error | Delete `node_modules` and `pnpm-lock.yaml`, then `pnpm install` |
| Dark mode not working | Check browser supports CSS custom properties |
| RTL not working | Try different language in browser settings |
| Mock login not working | Clear localStorage: DevTools → Storage → Clear All |

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Full documentation |
| `INTEGRATION_GUIDE.md` | Backend integration steps |
| `DEPLOYMENT_GUIDE.md` | Production deployment |
| `IMPLEMENTATION_SUMMARY.md` | What's been built |
| `BACKEND_INTEGRATION_CHECKLIST.md` | Integration tracking |

---

## ✨ Features at a Glance

- ✅ **Role-Based Access Control** - 4 user roles with permissions
- ✅ **Responsive Design** - Works on mobile, tablet, desktop
- ✅ **Dark Mode** - Built-in theme support
- ✅ **RTL/LTR** - Arabic and English support
- ✅ **Type Safe** - 100% TypeScript
- ✅ **Fast** - Built with Turbopack
- ✅ **Secure** - Authentication & authorization ready
- ✅ **Documented** - Complete guides included
- ✅ **Mock Data** - Test without backend
- ✅ **Production Ready** - Deploy anywhere

---

## 🎯 Next Steps

1. ✅ **Run it** - `pnpm dev`
2. ✅ **Test it** - Use mock credentials
3. ✅ **Explore it** - Click around, see how it works
4. ✅ **Understand it** - Review the code structure
5. ✅ **Connect it** - See `INTEGRATION_GUIDE.md`
6. ✅ **Deploy it** - See `DEPLOYMENT_GUIDE.md`

---

## 💬 Need Help?

1. **Check Documentation**
   - README.md - Full reference
   - INTEGRATION_GUIDE.md - Backend integration
   - lib/api/examples.tsx - Code samples

2. **Check Logs**
   - Browser DevTools (F12)
   - Network tab for API calls
   - Console for errors

3. **Review Code**
   - Example components show patterns
   - Comments explain complex parts

---

## 🎉 You're Ready!

Your CharityHub frontend is running and ready to:
- Test with mock data
- Connect to your backend
- Deploy to production
- Scale to users

**Happy coding!** 🚀

---

```
╭─────────────────────────────────────╮
│  CharityHub Frontend                │
│  Frontend-Only Implementation       │
│  Ready for Backend Integration      │
│                                     │
│  http://localhost:3000              │
│  admin@charityhub.org / Admin@1234  │
│                                     │
│  Start: pnpm dev                    │
│  Build: pnpm build                  │
│  Deploy: vercel                     │
╰─────────────────────────────────────╯
```
