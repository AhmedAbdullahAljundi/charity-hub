# CharityHub Frontend - Integration Guide

## 📦 Overview

This is a **frontend-only implementation** of the CharityHub Social Assistance Targeting Platform. The frontend is fully functional with mock data and ready to connect to your backend API.

**Key Features:**
- ✅ Complete authentication flow (login with mock data)
- ✅ Role-based access control (ADMIN, SUPERVISOR, WORKER, VIEWER)
- ✅ RTL (Arabic) and LTR (English) support
- ✅ Dark mode support
- ✅ Permission-based UI components
- ✅ Dashboard with user management
- ✅ Households management interface
- ✅ Mock API route for testing

## 🔐 Authentication

### Current Implementation (Mock)

**Mock API Endpoint:** `/api/auth/login` (POST)

**Test Credentials:**
```
Email: admin@charityhub.org
Password: Admin@1234
Role: ADMIN

Email: supervisor@charityhub.org
Password: Super@1234
Role: SUPERVISOR

Email: worker@charityhub.org
Password: Worker@1234
Role: WORKER

Email: viewer@charityhub.org
Password: View@1234
Role: VIEWER
```

### How to Connect to Backend

1. **Locate the mock API route:**
   ```
   app/api/auth/login/route.ts
   ```

2. **Replace the mock implementation with your backend call:**

```typescript
// Current: Mock implementation
const user = mockUsers[email.toLowerCase()]

// Replace with:
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})

const data = await response.json()
if (!response.ok) {
  return NextResponse.json(
    { error: data.message || 'Login failed' },
    { status: response.status }
  )
}

return NextResponse.json(data, { status: 200 })
```

3. **Add environment variable to `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001  # Your backend URL
```

## 📁 Project Structure

```
app/
├── page.tsx                 # Home page
├── layout.tsx               # Root layout (RTL, dark mode)
├── login/
│   ├── page.tsx            # Login page wrapper
│   └── login-form.tsx      # Login form component
├── dashboard/
│   ├── layout.tsx          # Dashboard layout with sidebar
│   ├── page.tsx            # Dashboard home
│   ├── households/
│   │   └── page.tsx        # Households list (mock data)
│   ├── users/
│   │   └── page.tsx        # Users management (ADMIN only)
│   └── 403/
│       └── page.tsx        # Forbidden access page
└── api/
    └── auth/
        └── login/
            └── route.ts    # Authentication endpoint (mock)

lib/
├── stores/
│   └── authStore.ts        # Zustand auth store with permissions
├── hooks/
│   ├── usePermission.ts    # Permission hooks
│   ├── useAuthGuard.ts     # Route protection hook
│   └── useRole.ts          # Role-specific hooks
└── utils.ts                # Utility functions
```

## 🔌 Auth Store & Hooks

### Auth Store (`lib/stores/authStore.ts`)

The store uses **Zustand** with persistence middleware to manage:
- Token (stored in localStorage)
- User data
- Permissions
- Loading state and errors

```typescript
import { useAuthStore } from '@/lib/stores/authStore'

const { token, user, login, logout, hasPermission } = useAuthStore()
```

### Permission Hooks (`lib/hooks/usePermission.ts`)

```typescript
import { 
  usePermission, 
  useRole, 
  useIsAdmin,
  useIsViewer,
  useUser,
  useLogout 
} from '@/lib/hooks/usePermission'

// Check specific permission
const canEdit = usePermission('HOUSEHOLD_WRITE')
const canDelete = usePermission('HOUSEHOLD_DELETE')

// Check role
const isAdmin = useIsAdmin()
const role = useRole()

// Get user data
const user = useUser()

// Logout
const logout = useLogout()
```

### Auth Guard Hook (`lib/hooks/useAuthGuard.ts`)

```typescript
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

// Protect routes and check authentication
const { user, isAuthenticated } = useAuthGuard(['ADMIN'])
```

## 🔑 Permission Matrix

The frontend mirrors your backend permission structure:

```typescript
const PERMISSIONS = {
  // Households
  HOUSEHOLD_READ: ['ADMIN','SUPERVISOR','WORKER','VIEWER'],
  HOUSEHOLD_WRITE: ['ADMIN','SUPERVISOR','WORKER'],
  HOUSEHOLD_DELETE: ['ADMIN'],
  
  // Users Management
  USER_READ: ['ADMIN'],
  USER_WRITE: ['ADMIN'],
  USER_DELETE: ['ADMIN'],
  
  // And more...
}
```

## 🚀 Running the Frontend

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Visit `http://localhost:3000` and login with mock credentials.

## 🎨 Styling & Theming

- **Color scheme:** Green (#22C55E) as primary brand color
- **Dark mode:** Built-in with Tailwind CSS (toggle in browser DevTools)
- **RTL/LTR:** Supports both Arabic and English
- **Spacing:** Uses Tailwind spacing scale
- **Typography:** System fonts with Geist fallback

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: `sm`, `md`, `lg`
- Sidebar collapses on mobile
- Touch-friendly interfaces

## 🔄 Data Flow

### Login Flow
```
1. User enters credentials on /login
2. Form submitted to /api/auth/login
3. Backend validates and returns token + user data
4. Token + user stored in Zustand store (persisted)
5. Redirect to /dashboard
```

### Authorization Flow
```
1. Component loads
2. useAuthGuard() checks authentication
3. usePermission() checks specific permission
4. Conditionally render UI based on permissions
```

## 📝 Environment Variables

```env
# Add to .env.local

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional: API timeout
NEXT_PUBLIC_API_TIMEOUT=30000

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## 🔗 Integration Checklist

- [ ] Replace `/api/auth/login` route with backend call
- [ ] Update `NEXT_PUBLIC_API_URL` environment variable
- [ ] Test login with backend credentials
- [ ] Implement API calls for households list (GET `/api/households`)
- [ ] Implement API calls for household CRUD operations
- [ ] Implement API calls for users management (GET `/api/users`)
- [ ] Add error handling and loading states
- [ ] Test permission checks with different roles
- [ ] Verify PII masking for VIEWER role
- [ ] Deploy to production

## 🛠️ Adding New Features

### Adding a New Page

1. Create page in `app/dashboard/feature/page.tsx`
2. Use `useAuthGuard()` to protect the route
3. Use `usePermission()` to conditionally render features
4. Import hooks from `lib/hooks/`

### Adding API Integration

1. Create API route in `app/api/feature/route.ts` or call external backend
2. Use the auth token from `useAuthStore` for authenticated requests
3. Handle errors and loading states

### Adding Permissions

1. Update permission matrix in `lib/stores/authStore.ts`
2. Use `usePermission('PERMISSION_NAME')` in components
3. Update backend permissions matrix to match

## 🐛 Troubleshooting

**Login not working?**
- Check mock credentials match the form
- Verify `/api/auth/login` endpoint is working
- Check browser console for errors

**Dark mode not working?**
- Ensure `dark:` classes are used throughout
- Check Tailwind config includes dark mode

**RTL not working?**
- Verify `dir="rtl"` is set in `html` tag
- Use logical CSS properties (`ps-`, `pe-`, `start-`, `end-`)
- Check icons have `rtl:rotate-180` class

**Permissions not working?**
- Verify user role matches permission matrix
- Check useAuthStore is returning correct user role
- Test with mock users (try admin role first)

## 📚 Tech Stack

- **Framework:** Next.js 16
- **UI Components:** shadcn/ui + Tailwind CSS
- **State Management:** Zustand
- **Forms:** React Hook Form
- **Validation:** Zod
- **HTTP Client:** Axios (ready to use)
- **Icons:** Lucide React
- **i18n:** next-intl (ready for integration)

## 📧 Support

For questions about this frontend implementation, refer to:
- Tailwind documentation: https://tailwindcss.com
- Next.js docs: https://nextjs.org
- Zustand docs: https://github.com/pmndrs/zustand
- shadcn/ui: https://ui.shadcn.com

---

**Ready to connect to your backend?** Start with replacing the `/api/auth/login` route and update the API calls throughout the app to point to your backend endpoints!
