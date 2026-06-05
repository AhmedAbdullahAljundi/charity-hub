# Backend Integration Checklist

Complete this checklist to fully integrate the CharityHub frontend with your backend API.

## 🔐 Authentication Integration

- [ ] Update `/app/api/auth/login/route.ts` to call your backend
  - [ ] Replace mock user validation with backend API call
  - [ ] Handle JWT token from backend
  - [ ] Handle error responses properly

- [ ] Configure environment variables
  - [ ] Set `NEXT_PUBLIC_API_URL` in `.env.local`
  - [ ] Verify backend URL is correct
  - [ ] Test in development mode

- [ ] Test login flow
  - [ ] Login with backend credentials works
  - [ ] Token is stored correctly
  - [ ] Redirect to dashboard on success
  - [ ] Error handling shows proper messages

## 📊 API Integration

### Households API

- [ ] Implement `/api/households` calls
  - [ ] GET list with pagination
  - [ ] GET single household
  - [ ] POST create household
  - [ ] PUT update household
  - [ ] DELETE remove household
  - [ ] POST publish household

- [ ] Update `app/dashboard/households/page.tsx`
  - [ ] Replace mock data with API calls
  - [ ] Add loading states
  - [ ] Add error handling
  - [ ] Implement search/filter
  - [ ] Handle pagination

- [ ] Add permissions checks
  - [ ] Hide edit/delete for non-authorized users
  - [ ] Check `HOUSEHOLD_WRITE` before showing form
  - [ ] Check `HOUSEHOLD_DELETE` before showing delete button

### Persons API

- [ ] Implement person CRUD operations
- [ ] Handle person validation
- [ ] Add relationship to households

### Income API

- [ ] Implement income entry
- [ ] Add income verification flow
- [ ] Show verification status
- [ ] Handle income deletion

### Scoring API

- [ ] Implement score calculation
- [ ] Show score results
- [ ] Implement score simulation
- [ ] Add committee decision interface

### Users API (ADMIN only)

- [ ] Update `app/dashboard/users/page.tsx`
  - [ ] Replace mock data with API calls
  - [ ] GET /api/users list
  - [ ] POST /api/users create
  - [ ] PUT /api/users/:id update
  - [ ] DELETE /api/users/:id delete
  - [ ] PATCH /api/users/:id/role change role
  - [ ] POST /api/users/:id/reset-password

- [ ] Add permission checks
  - [ ] Only ADMIN can access users page
  - [ ] Show role change confirmation
  - [ ] Handle role update with validation

## 🛡️ Security & Authentication

- [ ] Verify CORS is configured on backend
  - [ ] Frontend URL is allowed
  - [ ] Credentials are handled correctly

- [ ] Implement token refresh
  - [ ] Detect expired tokens
  - [ ] Auto-refresh with refresh tokens
  - [ ] Redirect to login on 401

- [ ] Add API request interceptors
  - [ ] Add Authorization header with Bearer token
  - [ ] Handle authentication errors
  - [ ] Retry on transient failures

- [ ] Verify PII masking for VIEWER role
  - [ ] Backend returns masked data
  - [ ] Frontend displays masked values

## 🎨 UI Components & Features

### Dashboard

- [ ] Implement dashboard KPIs
  - [ ] Get total households count
  - [ ] Get pending count
  - [ ] Get completed count
  - [ ] Show charts if available

- [ ] Add quick actions
  - [ ] Add household button links to form
  - [ ] Show recent activities
  - [ ] Display user welcome message

### Forms & Validation

- [ ] Implement household form
  - [ ] Add validation with Zod
  - [ ] Show validation errors
  - [ ] Handle submit with API call
  - [ ] Show success message

- [ ] Implement user creation form (ADMIN)
  - [ ] Validate email uniqueness
  - [ ] Password strength validation
  - [ ] Role selection dropdown
  - [ ] Handle creation response

### Error Handling

- [ ] Display API errors properly
  - [ ] Show user-friendly messages
  - [ ] Log technical errors for debugging
  - [ ] Retry failed requests option

- [ ] Handle edge cases
  - [ ] No data returned
  - [ ] Slow API responses
  - [ ] Network timeout
  - [ ] Server errors (5xx)

## 📱 Mobile & Responsive

- [ ] Test on mobile devices
  - [ ] Login page responsive
  - [ ] Dashboard sidebar collapses
  - [ ] Tables are scrollable
  - [ ] Forms are touch-friendly

- [ ] Test on tablets
  - [ ] Layout breaks at correct breakpoints
  - [ ] Content is readable
  - [ ] Buttons are clickable

## 🌐 Internationalization

- [ ] Test Arabic interface
  - [ ] RTL layout works
  - [ ] All text is Arabic
  - [ ] Icons rotate correctly
  - [ ] Forms work in RTL

- [ ] Test English interface
  - [ ] LTR layout works
  - [ ] All text is English
  - [ ] Forms work correctly

- [ ] Implement language switching
  - [ ] Add language toggle in UI
  - [ ] Save preference to localStorage
  - [ ] Persist across page reloads

## 🎭 Role & Permission Testing

- [ ] Test as ADMIN
  - [ ] Can access all pages
  - [ ] Can see users page
  - [ ] Can see admin menu
  - [ ] Can perform all actions

- [ ] Test as SUPERVISOR
  - [ ] Cannot access users page (403)
  - [ ] Cannot access admin settings
  - [ ] Can verify income
  - [ ] Can make decisions

- [ ] Test as WORKER
  - [ ] Can create households
  - [ ] Can edit households
  - [ ] Cannot delete households
  - [ ] Cannot access admin features

- [ ] Test as VIEWER
  - [ ] Can view households
  - [ ] Cannot edit households
  - [ ] Cannot create households
  - [ ] PII is masked

## 📊 Analytics & Monitoring

- [ ] Setup error tracking
  - [ ] Configure Sentry or similar
  - [ ] Test error reporting
  - [ ] Set up alerts

- [ ] Setup analytics
  - [ ] Track page views
  - [ ] Track user actions
  - [ ] Monitor API calls
  - [ ] Track errors

- [ ] Monitor performance
  - [ ] Check API response times
  - [ ] Monitor bundle size
  - [ ] Check Core Web Vitals
  - [ ] Monitor error rates

## 🚀 Deployment & Production

- [ ] Prepare for deployment
  - [ ] Review all environment variables
  - [ ] Test in staging environment
  - [ ] Verify backend is production-ready
  - [ ] Check database is backed up

- [ ] Deploy to staging
  - [ ] Deploy frontend to staging
  - [ ] Test all features in staging
  - [ ] Verify API integration works
  - [ ] Check performance

- [ ] Deploy to production
  - [ ] Create deployment checklist
  - [ ] Do final testing
  - [ ] Monitor first hour
  - [ ] Have rollback plan ready

## 📚 Documentation

- [ ] Update API documentation
  - [ ] List all endpoints used
  - [ ] Document expected responses
  - [ ] List required headers
  - [ ] Document error codes

- [ ] Update integration guide
  - [ ] Remove mock implementation notes
  - [ ] Add production setup steps
  - [ ] Add troubleshooting guide
  - [ ] Add support contacts

- [ ] Create user manual
  - [ ] Document each user role
  - [ ] Create step-by-step workflows
  - [ ] Add screenshots
  - [ ] Add FAQ section

## 🧪 Testing

- [ ] Functional testing
  - [ ] All CRUD operations work
  - [ ] All permission checks work
  - [ ] All error cases handled
  - [ ] All edge cases covered

- [ ] User acceptance testing
  - [ ] Each role can do their job
  - [ ] Workflows are intuitive
  - [ ] Performance is acceptable
  - [ ] No bugs or issues

- [ ] Load testing
  - [ ] Can handle expected load
  - [ ] API scaling works
  - [ ] Database performs well
  - [ ] Frontend responds quickly

## 🎉 Go Live

- [ ] Final verification
  - [ ] All checklist items complete
  - [ ] All tests passing
  - [ ] Performance optimized
  - [ ] Security verified

- [ ] Launch
  - [ ] Deploy to production
  - [ ] Monitor closely
  - [ ] Be ready to rollback
  - [ ] Celebrate! 🎊

## 📞 Post-Launch

- [ ] Monitor for issues
  - [ ] Check error logs
  - [ ] Monitor performance
  - [ ] Get user feedback
  - [ ] Fix bugs quickly

- [ ] Plan updates
  - [ ] New features
  - [ ] Performance improvements
  - [ ] Security updates
  - [ ] User-requested changes

---

## 📝 Notes

**Backend Integration Contact:** ________________

**API Documentation Location:** ________________

**Staging URL:** ________________

**Production URL:** ________________

**Deployment Date:** ________________

**Launch Approval:** ________________

---

Use this checklist to track progress and ensure nothing is missed during the backend integration process.
