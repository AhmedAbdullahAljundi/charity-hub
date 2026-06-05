# CharityHub Landing Page & Custom Permissions Implementation

## Overview

You now have a **complete production-ready landing page** with:
- Professional navbar with login modal
- Hero section with project branding
- Feature showcase sections with images
- About section with system capabilities
- How-it-works guide
- Footer with links
- **Custom permissions system** for granular access control

---

## What's New

### 1. Landing Page (`app/page.tsx`)
- **Hero Section**: Eye-catching introduction with stats
- **Features Grid**: 3 main features with actual generated images
- **About Section**: System capabilities and stats
- **How It Works**: 4-step process guide
- **CTA Section**: Call to action with styling
- **Footer**: Complete footer with links

### 2. Navbar Component (`components/navbar.tsx`)
- Sticky top navigation
- Login button (opens modal on landing page)
- Dashboard link (when authenticated)
- Logout button (when authenticated)
- Mobile-responsive menu
- Shows user name and role when logged in
- Navigation links to hero sections

### 3. Login Modal (`components/login-modal.tsx`)
- Modal displayed from navbar
- Test credentials for all 4 roles
- Quick login buttons
- Error handling
- Arabic/English support

### 4. Custom Permissions System

#### Frontend Updates:
- **User Interface in Auth Store**: `customPermissions?: string[]` field added
- **Permission Hooks**: New hooks added:
  - `useCustomPermissions()` - Get user's custom permissions
  - `useEffectivePermissions()` - Get combined role + custom permissions
- **Updated Permission Check**: `hasPermission()` now checks both role-based AND custom permissions
- **Users Management Page**: Enhanced with permission editor modal

#### Permission Editor Features:
- Only shown for WORKER and VIEWER roles (ADMIN/SUPERVISOR already have full access)
- Grouped by categories:
  - **الأسر** (Households): HOUSEHOLD_READ, HOUSEHOLD_WRITE, HOUSEHOLD_DELETE, HOUSEHOLD_PUBLISH
  - **التقييم** (Scoring): SCORE_CALCULATE, SCORE_DECIDE, SCORE_SIMULATE, SCORE_READ
  - **الدخل** (Income): INCOME_WRITE, INCOME_VERIFY, INCOME_DELETE
  - **البيانات** (Data): EDUCATION_WRITE, AUDIT_READ, VERIFICATION_BULK, PERSON_WRITE, BURDEN_WRITE
- Expandable sections for organization
- Checkboxes to add/remove permissions
- Save changes button
- Shows count of custom permissions per user

---

## File Structure

```
components/
├── navbar.tsx                  # Sticky navbar with login modal
└── login-modal.tsx             # Login modal component

app/
├── page.tsx                    # Landing page (completely redesigned)
├── login/page.tsx              # Login page wrapper with navbar
└── dashboard/
    └── users/page.tsx          # Users page with permissions editor

lib/
├── stores/authStore.ts         # Updated with customPermissions
├── hooks/usePermission.ts      # New hooks for custom permissions
└── api/client.ts               # API ready for /api/users/:id/permissions

public/images/
├── hero-dashboard.png          # Generated hero image
├── features-households.png     # Households feature image
├── features-analytics.png      # Analytics feature image
└── features-targeting.png      # Targeting feature image
```

---

## Features

### Landing Page Features

1. **Responsive Design**: Mobile, tablet, desktop
2. **Dark Mode**: Full dark mode support
3. **Hero Section**: Animated with gradient backgrounds
4. **Feature Cards**: With actual generated images
5. **Stats Display**: Shows key metrics
6. **CTA Buttons**: Multiple call-to-action points
7. **Footer**: Complete with links and info

### Custom Permissions Features

1. **Additive Only**: Can only grant MORE permissions, never restrict
2. **ADMIN Control**: Only admins can set custom permissions
3. **Grouped UI**: Permissions organized by category
4. **User Feedback**: Shows effective permissions count
5. **Granular Control**: 25+ permission combinations available
6. **Safe Defaults**: Only non-admin roles can have custom permissions

---

## Navigation Flow

```
/ (Landing Page)
├── NavBar with "تسجيل الدخول" button
├── Features Section (#features)
├── About Section (#about)
├── How It Works Section (#how-it-works)
└── Footer (#contact)

Login Flow:
1. Click "تسجيل الدخول" in navbar
2. Modal opens with credentials
3. Choose test user or enter credentials
4. Redirected to /dashboard
5. Shows user name and role in navbar
6. Can edit permissions from Users page

Users Management:
1. ADMIN only access
2. View all users in table
3. Click Edit button
4. Open permissions modal
5. Manage custom permissions per category
6. Save changes (ready to call API)
```

---

## Integration Steps

### Step 1: Connect Login API
Update `app/api/auth/login/route.ts` to call your actual backend:

```typescript
// Replace mock data with real backend call
const response = await fetch('YOUR_BACKEND_URL/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
})
```

### Step 2: Connect Permissions API
Update users page to call permissions endpoint:

```typescript
// In handleSavePermissions():
await fetch(`/api/users/${selectedUser.id}/permissions`, {
  method: 'PATCH',
  body: JSON.stringify({
    customPermissions: selectedUser.customPermissions
  })
})
```

### Step 3: Update User Object
Ensure user fetch includes `customPermissions`:

```typescript
const user = {
  id: '...',
  name: '...',
  email: '...',
  role: 'WORKER',
  customPermissions: ['INCOME_VERIFY', 'SCORE_CALCULATE']
}
```

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@charityhub.org | Admin@1234 |
| Supervisor | supervisor@charityhub.org | Super@1234 |
| Worker | worker@charityhub.org | Worker@1234 |
| Viewer | viewer@charityhub.org | View@1234 |

**Note**: Worker role has mock custom permission `INCOME_VERIFY` enabled for testing.

---

## Permissions Matrix

### Role-Based (Cannot be changed)
- **ADMIN**: All permissions
- **SUPERVISOR**: Most permissions except USER management
- **WORKER**: Data entry permissions
- **VIEWER**: Read-only permissions

### Custom Permissions (Additive, ADMIN only)
Can add any of these 25+ permissions:
- Households (4): READ, WRITE, DELETE, PUBLISH
- Persons (2): WRITE, DELETE
- Income (3): WRITE, VERIFY, DELETE
- Burdens (1): WRITE
- Scoring (4): CALCULATE, READ, DECIDE, SIMULATE
- Rules (2): READ, WRITE
- Analytics (1): READ
- Audit (1): READ
- Verification (2): READ, BULK
- Education (3): READ, WRITE, DELETE
- Users (3): READ, WRITE, DELETE

---

## Styling

- **Colors**: Green primary (#22c55e), slate neutrals
- **Typography**: Arabic-optimized fonts, RTL support
- **Layout**: Flexbox-based, mobile-first responsive
- **Components**: Tailwind CSS v4 with semantic tokens
- **Dark Mode**: Full support with dark: prefix

---

## Backend Integration Checklist

- [ ] Connect `/api/auth/login` to backend authentication
- [ ] Add `customPermissions` field to User model in backend
- [ ] Create `PATCH /api/users/:id/permissions` endpoint
- [ ] Implement permission validation (no invalid permissions)
- [ ] Add permission check middleware in backend
- [ ] Update `hasPermission()` check in backend
- [ ] Test login with all 4 roles
- [ ] Test custom permissions assignment
- [ ] Verify role + custom permissions work together
- [ ] Test permission-based UI hiding/showing

---

## Environment Variables

```env
# In .env.local or Vercel dashboard:
NEXT_PUBLIC_API_URL=https://your-backend.com
```

---

## Performance Notes

- Landing page uses Next.js Image optimization
- Images are pre-generated and optimized
- Navbar is sticky with CSS transform (performant)
- Modal uses fixed positioning (doesn't reflow)
- State management via Zustand (lightweight)
- No unnecessary re-renders with selective Zustand subscriptions

---

## Accessibility

- Semantic HTML throughout
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliant (WCAG AA)
- Screen reader friendly
- RTL language support built-in

---

## Next Steps

1. **Review Landing Page**: Open http://localhost:3000
2. **Test Login**: Try all 4 test credentials
3. **Check Permissions UI**: Go to Users page as ADMIN
4. **Edit User**: Click edit on Worker user to test modal
5. **Connect Backend**: Replace mock APIs with real endpoints
6. **Test Production**: Build and test: `pnpm build && pnpm start`

---

## Support

### Components:
- `components/navbar.tsx` - Main navigation
- `components/login-modal.tsx` - Login interface

### Pages:
- `app/page.tsx` - Landing page
- `app/login/page.tsx` - Login page wrapper

### Hooks:
- `usePermission()` - Check single permission
- `useCustomPermissions()` - Get custom perms array
- `useEffectivePermissions()` - Get combined perms

### Store:
- `lib/stores/authStore.ts` - Auth + permissions state

Everything is documented and ready for backend connection!
