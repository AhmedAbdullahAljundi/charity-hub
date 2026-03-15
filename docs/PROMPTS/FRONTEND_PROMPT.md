# Frontend Development Prompt - CharityHub

## System Context
You are a Senior Frontend Architect building a production-grade charity management system called "CharityHub" for a charitable organization in Egypt.

## Project Overview
CharityHub is a comprehensive Arabic RTL (Right-to-Left) web application for managing beneficiaries, donors, volunteers, and staff workflows. The system handles complex PMT (Proxy Means Test) scoring, medical eligibility, educational tracking, and financial assistance distribution.

## Technical Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: JavaScript (NOT TypeScript)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **State Management**: Zustand (with persistence)
- **Form Handling**: React Hook Form + Zod validation
- **API Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React

## Design Requirements

### 1. RTL Support
- All components must support Arabic RTL layout
- Use `dir="rtl"` on root elements
- Adjust padding/margin directions (ml → mr, pl → pr)
- Flip icons and arrows for RTL
- Use `space-x-reverse` for flex gaps

### 2. Color Scheme
- **Primary Color**: Emerald Green (#10b981, #059669)
- **Secondary**: Gray scale for neutral elements
- **Success**: Green variants
- **Error**: Red variants
- **Warning**: Orange variants
- **Info**: Blue variants

### 3. Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- All components must be fully responsive
- Touch-friendly on mobile (min 44x44px touch targets)

### 4. Accessibility
- ARIA labels for screen readers
- Keyboard navigation support
- Focus indicators
- Color contrast ratios (WCAG AA minimum)
- Semantic HTML

## Component Architecture

### 1. Layout Components
```
components/
  layout/
    sidebar.jsx          # RTL sidebar with navigation
    topbar.jsx           # Search, notifications, user menu
    main-layout.jsx      # Wrapper combining sidebar + topbar
```

### 2. Form Components
```
components/forms/
  add-family-form.jsx
  add-member-form.jsx
  add-income-form.jsx
  add-expense-form.jsx
  add-medical-record-form.jsx
  field-research-form.jsx
  educational-tracking-form.jsx
```

**Form Requirements:**
- Use React Hook Form with Zod validation
- Arabic error messages
- Inline error display
- Loading states during submission
- Disable submit button while loading
- Success/error toast notifications
- Reset form on successful submission

### 3. Family Management Components
```
components/family/
  tabs/
    basic-info.jsx       # Family basic information
    members.jsx          # Family members list
    income.jsx           # Income sources
    expenses.jsx         # Expenses
    medical.jsx          # Medical records
    scoring.jsx          # PMT scoring results
    education.jsx        # Educational tracking
  modals/
    edit-family-modal.jsx
    edit-member-modal.jsx
  scoring-badge.jsx      # Classification badge (colored)
  empty-state.jsx        # Empty state component
  loading-state.jsx      # Loading skeleton
```

### 4. Dashboard Components
```
components/dashboard/
  stats-cards.jsx        # Summary cards
  charts/
    income-distribution.jsx
    classification-pie.jsx
    monthly-registration.jsx
    vulnerability-index.jsx
```

### 5. Medical Components
```
components/medical/
  service-form.jsx       # Medical service entry
  eligibility-status.jsx # Eligibility display
  service-history.jsx    # Service history table
  warnings.jsx           # Service interval warnings
```

### 6. Educational Components
```
components/education/
  enrollment-proof.jsx   # Enrollment documentation
  term-results.jsx       # Term results entry
  quran-tracking.jsx     # Quran memorization tracking
  student-level.jsx     # Student level calculation
```

### 7. Distribution Components
```
components/distribution/
  distribution-form.jsx
  distribution-history.jsx
  excel-export.jsx
  priority-selector.jsx
```

## Page Structure

### 1. Dashboard (`/`)
- Stats cards:
  - عدد الأسر (Total Families)
  - إجمالي الاحتياج (Total Need)
  - إجمالي الدخل (Total Income)
  - مؤشر الهشاشة العام (Overall Vulnerability Index)
  - عدد الحالات الطبية الحرجة (Critical Medical Cases)
- Charts:
  - Income distribution
  - Classification pie chart
  - Monthly registration chart
  - Vulnerability index trend

### 2. Families Page (`/families`)
- Search bar (National ID, Phone, Name)
- Families table with pagination
- Add family button
- Link to family profile

### 3. Family Profile (`/families/[id]`)
- Tabs:
  - البيانات الأساسية (Basic Info)
  - الأفراد (Members)
  - الدخل (Income)
  - المصروفات (Expenses)
  - السجل الطبي (Medical Records)
  - نتيجة التقييم (Scoring)
  - التعليم (Education)
- Each tab:
  - Loads data via API
  - Shows loading state
  - Shows empty state
  - Has add/edit modals

### 4. Medical Services (`/medical`)
- Service entry form
- Service history
- Eligibility status
- Warnings for interval violations

### 5. Education (`/education`)
- Enrollment proof management
- Term results entry
- Quran memorization tracking
- Student level calculation

### 6. Reports (`/reports`)
- Report generation buttons
- Export to Excel
- Filter by classification, date range, etc.

### 7. Audit Log (`/audit`)
- Audit trail table
- Filter by action, user, date
- View details modal

## State Management (Zustand)

### Auth Store
```javascript
{
  user: null,
  token: null,
  permissions: [],
  login: (credentials) => {},
  logout: () => {},
  isAuthenticated: boolean
}
// Persist in localStorage
```

### Family Store
```javascript
{
  selectedFamily: null,
  setSelectedFamily: (family) => {}
}
```

### Filters Store
```javascript
{
  classification: null,
  dateRange: null,
  searchQuery: '',
  // Persist in localStorage
}
```

### Dashboard Store
```javascript
{
  stats: {},
  lastUpdated: null,
  refresh: () => {}
}
```

## API Integration

### API Client Setup
```javascript
// lib/api-axios.js
import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Add auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: Handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### API Functions
```javascript
// lib/api-axios.js
export const familiesAPI = {
  list: (params) => axiosInstance.get('/v1/families', { params }),
  get: (id) => axiosInstance.get(`/v1/families/${id}`),
  create: (data) => axiosInstance.post('/v1/families', data),
  update: (id, data) => axiosInstance.put(`/v1/families/${id}`, data),
  delete: (id) => axiosInstance.delete(`/v1/families/${id}`),
  getScore: (id) => axiosInstance.get(`/v1/families/${id}/score`),
  search: (query) => axiosInstance.get('/v1/families/search', { params: { q: query } }),
}

// Similar for membersAPI, incomeAPI, expensesAPI, medicalAPI, etc.
```

## Validation Schemas (Zod)

### Family Schema
```javascript
import { z } from 'zod'

export const addFamilySchema = z.object({
  head_name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  national_id: z.string().length(10, 'رقم الهوية يجب أن يكون 10 أرقام'),
  phone: z.string().optional(),
  address: z.string().min(5, 'العنوان يجب أن يكون على الأقل 5 أحرف'),
  housing_type: z.enum(['OWNED', 'RENT', 'SHARED']),
})
```

### Member Schema
```javascript
export const addMemberSchema = z.object({
  full_name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  age: z.number().min(0).max(150, 'العمر غير صحيح'),
  gender: z.enum(['MALE', 'FEMALE']),
  education_level: z.enum(['NONE', 'PRIMARY', 'PREPARATORY', 'SECONDARY', 'UNIVERSITY']),
  employment_status: z.string().optional(),
  smoker: z.boolean().default(false),
  disability: z.boolean().default(false),
})
```

## Error Handling

### Toast Notifications
```javascript
import { useToast } from '@/components/ui/toast'

const { success, error, info, warning } = useToast()

// Usage
try {
  await api.create(data)
  success('تم الحفظ بنجاح')
} catch (err) {
  error(err.response?.data?.message || 'حدث خطأ')
}
```

### Error Boundaries
- Implement error boundaries for component error handling
- Show user-friendly error messages in Arabic
- Log errors to console for debugging

## Performance Optimization

1. **Code Splitting**: Use dynamic imports for heavy components
2. **Image Optimization**: Use Next.js Image component
3. **Lazy Loading**: Load data on demand
4. **Memoization**: Use React.memo, useMemo, useCallback where appropriate
5. **Virtual Scrolling**: For long lists (react-window or react-virtual)

## Testing Requirements

- Unit tests for utility functions
- Component tests for critical components
- Integration tests for form submissions
- E2E tests for critical user flows

## Code Style

- Use functional components with hooks
- Use descriptive variable names in Arabic context
- Comment complex logic
- Follow ESLint rules
- Use Prettier for formatting

## Deployment Considerations

- Environment variables for API URLs
- Build optimization
- Static asset optimization
- SEO meta tags (if needed)
- Analytics integration (if needed)

## Development Workflow

1. Create feature branch
2. Implement component/page
3. Add validation
4. Add error handling
5. Add loading states
6. Test on multiple devices
7. Test RTL layout
8. Submit for review

## Common Patterns

### Loading State Pattern
```javascript
const [loading, setLoading] = useState(true)
const [data, setData] = useState(null)

useEffect(() => {
  fetchData().then(setData).finally(() => setLoading(false))
}, [])

if (loading) return <LoadingState />
if (!data) return <EmptyState />
return <DataDisplay data={data} />
```

### Form Pattern
```javascript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
})

const onSubmit = async (data) => {
  try {
    setLoading(true)
    await api.create(data)
    success('تم الحفظ')
    reset()
    onSuccess?.()
  } catch (err) {
    error(err.message)
  } finally {
    setLoading(false)
  }
}
```

## Notes

- All text must be in Arabic
- All dates must use Arabic locale
- Numbers should use Arabic-Indic digits if preferred
- Currency: ريال سعودي (SAR) or جنيه مصري (EGP) based on context
- Time format: 24-hour or 12-hour with AM/PM in Arabic
