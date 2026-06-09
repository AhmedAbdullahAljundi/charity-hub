# Charity Hub - Project Architecture

```text
Charity_Hub
├── backend
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── scripts
│   │   └── startup.sh
│   ├── src
│   │   ├── __tests__
│   │   │   └── integration
│   │   │       ├── admin.test.js
│   │   │       ├── auth.test.js
│   │   │       └── scoring.test.js
│   │   ├── config
│   │   │   ├── env.js
│   │   │   └── prisma.js
│   │   ├── domains
│   │   │   └── scoring
│   │   │       ├── engine
│   │   │       ├── registry
│   │   │       └── repositories
│   │   ├── http
│   │   ├── middleware
│   │   │   ├── auditMiddleware.js
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── notFoundHandler.js
│   │   │   ├── pii.js
│   │   │   ├── rateLimit.js
│   │   │   ├── rbac.example.js
│   │   │   ├── rbac.js
│   │   │   ├── README.md
│   │   │   ├── sanitize.js
│   │   │   ├── traceId.js
│   │   │   └── validate.js
│   │   ├── modules
│   │   │   ├── admin
│   │   │   │   ├── admin.controller.js
│   │   │   │   ├── admin.routes.js
│   │   │   │   └── admin.service.js
│   │   │   ├── analytics
│   │   │   │   ├── analytics.controller.js
│   │   │   │   ├── analytics.routes.js
│   │   │   │   ├── analytics.service.js
│   │   │   │   ├── export.controller.js
│   │   │   │   ├── export.service.js
│   │   │   │   ├── import.controller.js
│   │   │   │   └── import.service.js
│   │   │   ├── audit
│   │   │   │   ├── audit.controller.js
│   │   │   │   ├── audit.routes.js
│   │   │   │   └── audit.service.js
│   │   │   ├── auth
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.service.js
│   │   │   │   ├── auth.validator.js
│   │   │   │   └── README.md
│   │   │   ├── disbursement
│   │   │   │   ├── disbursement.repository.js
│   │   │   │   ├── disbursement.routes.js
│   │   │   │   └── disbursement.service.js
│   │   │   ├── education
│   │   │   │   ├── education.controller.js
│   │   │   │   ├── education.routes.js
│   │   │   │   └── education.service.js
│   │   │   ├── households
│   │   │   │   ├── burdens.controller.js
│   │   │   │   ├── burdens.routes.js
│   │   │   │   ├── burdens.service.js
│   │   │   │   ├── households.controller.js
│   │   │   │   ├── households.repository.js
│   │   │   │   ├── households.routes.js
│   │   │   │   └── households.service.js
│   │   │   ├── income
│   │   │   │   ├── income.controller.js
│   │   │   │   ├── income.repository.js
│   │   │   │   ├── income.routes.js
│   │   │   │   └── income.service.js
│   │   │   ├── medical
│   │   │   │   ├── medical-disbursements.routes.js
│   │   │   │   ├── medical-eligibility.js
│   │   │   │   ├── medical-summary.routes.js
│   │   │   │   ├── medical.controller.js
│   │   │   │   ├── medical.repository.js
│   │   │   │   ├── medical.routes.js
│   │   │   │   └── medical.service.js
│   │   │   ├── notifications
│   │   │   │   ├── notifications.controller.js
│   │   │   │   ├── notifications.routes.js
│   │   │   │   └── notifications.service.js
│   │   │   ├── persons
│   │   │   │   ├── persons.controller.js
│   │   │   │   ├── persons.routes.js
│   │   │   │   └── persons.service.js
│   │   │   ├── public
│   │   │   │   └── public.routes.js
│   │   │   ├── scoring
│   │   │   │   ├── __tests__
│   │   │   │   ├── engine
│   │   │   │   ├── fixtures
│   │   │   │   ├── household-dto.js
│   │   │   │   ├── scoring.controller.js
│   │   │   │   ├── scoring.repository.js
│   │   │   │   ├── scoring.routes.js
│   │   │   │   └── scoring.service.js
│   │   │   ├── simulate
│   │   │   │   ├── simulate.controller.js
│   │   │   │   ├── simulate.routes.js
│   │   │   │   └── simulate.service.js
│   │   │   ├── users
│   │   │   │   ├── users.controller.js
│   │   │   │   ├── users.routes.js
│   │   │   │   └── users.service.js
│   │   │   ├── verification
│   │   │   │   ├── verification.controller.js
│   │   │   │   ├── verification.routes.js
│   │   │   │   └── verification.service.js
│   │   │   └── volunteers
│   │   │       ├── volunteers.controller.js
│   │   │       ├── volunteers.routes.js
│   │   │       └── volunteers.service.js
│   │   ├── routes
│   │   │   └── api.js
│   │   ├── scripts
│   │   │   └── migrate-decisions-to-household.js
│   │   ├── shared
│   │   │   ├── audit
│   │   │   │   └── auditLogger.js
│   │   │   ├── cache
│   │   │   │   └── cache.js
│   │   │   ├── constants
│   │   │   │   ├── enums.js
│   │   │   │   └── weights.js
│   │   │   ├── middleware
│   │   │   │   └── upload.js
│   │   │   ├── types
│   │   │   │   └── scoring-contract.d.ts
│   │   │   ├── utils
│   │   │   │   ├── decimal.js
│   │   │   │   ├── excel-parser.js
│   │   │   │   └── import-validator.js
│   │   │   ├── validators
│   │   │   │   ├── admin.validator.js
│   │   │   │   ├── auth.validator.js
│   │   │   │   ├── simulate.validator.js
│   │   │   │   └── verification.validator.js
│   │   │   ├── errors.js
│   │   │   ├── householdAccess.js
│   │   │   ├── permissions.js
│   │   │   └── serializers.js
│   │   ├── utils
│   │   │   ├── arabicMessages.js
│   │   │   ├── errors.js
│   │   │   ├── logger.js
│   │   │   └── password.js
│   │   ├── validation
│   │   ├── app.js
│   │   └── server.js
│   ├── tests
│   │   └── scoring
│   │       ├── fixtures
│   │       │   └── phase2-inputs.js
│   │       └── phase2-scenarios.test.js
│   ├── .env
│   ├── AUTHENTICATION_SETUP.md
│   ├── create_admin.js
│   ├── debug-disbursement.js
│   ├── fix.js
│   ├── generate_template.js
│   ├── jest.config.js
│   ├── package-lock.json
│   ├── package.json
│   ├── README_SETUP.md
│   ├── smoke_test.js
│   ├── test_scoring.js
│   ├── test-calc.js
│   └── tsconfig.json
├── docs
│   ├── generated
│   │   └── AGGREGATED_DOCS.md
│   ├── PROMPTS
│   │   ├── BACKEND_PROMPT.md
│   │   └── FRONTEND_PROMPT.md
│   ├── API_REFERENCE.md
│   ├── API_TUTORIAL_AR.md
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   ├── DEPLOYMENT.md
│   ├── LEARNING_GUIDE.md
│   ├── LOCALE_ARCHITECTURE.md
│   ├── PROJECT_BOOK_CONTEXT.md
│   ├── PROJECT_UPDATE_CONTEXT.md
│   ├── SCHEMA_DESIGN.md
│   ├── SCORING_ENGINE.md
│   ├── SECURITY_MODEL.md
│   ├── SUMMARY.md
│   └── WORKFLOW_DOCUMENTATION.md
├── frontend
│   ├── app
│   │   ├── [locale]
│   │   │   ├── 403
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard
│   │   │   │   ├── admin
│   │   │   │   ├── analytics
│   │   │   │   ├── audit
│   │   │   │   ├── command
│   │   │   │   ├── disbursement
│   │   │   │   ├── education
│   │   │   │   ├── finance
│   │   │   │   ├── households
│   │   │   │   ├── medical
│   │   │   │   ├── operations
│   │   │   │   ├── reports
│   │   │   │   ├── users
│   │   │   │   ├── verification
│   │   │   │   ├── volunteers
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── login
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── globals.css
│   ├── components
│   │   ├── admin
│   │   ├── charts
│   │   ├── common
│   │   │   └── theme-toggle.tsx
│   │   ├── dashboard
│   │   │   ├── action-center-tables.tsx
│   │   │   ├── action-center.tsx
│   │   │   ├── admin-rules-client.tsx
│   │   │   ├── alerts-feed.tsx
│   │   │   ├── alerts-panel.tsx
│   │   │   ├── analytics-charts.tsx
│   │   │   ├── analytics-client.tsx
│   │   │   ├── analytics-grid.tsx
│   │   │   ├── audit-client.tsx
│   │   │   ├── compact-kpi-card.tsx
│   │   │   ├── dashboard-activity-feed.tsx
│   │   │   ├── dashboard-quick-links.tsx
│   │   │   ├── family-stats-strip.tsx
│   │   │   ├── financial-forecast-strip.tsx
│   │   │   ├── financial-intelligence-row.tsx
│   │   │   ├── households-table.tsx
│   │   │   ├── kpi-card.tsx
│   │   │   ├── main-charts-grid.tsx
│   │   │   ├── mini-sparkline.tsx
│   │   │   ├── operational-strip.tsx
│   │   │   ├── priority-families-table.tsx
│   │   │   ├── recent-families-table.tsx
│   │   │   ├── region-monitoring-table.tsx
│   │   │   ├── region-overview-card.tsx
│   │   │   ├── regional-compact-table.tsx
│   │   │   ├── regional-monitoring.tsx
│   │   │   ├── smart-alerts-panel.tsx
│   │   │   ├── verification-client.tsx
│   │   │   └── workflow-queue-card.tsx
│   │   ├── disbursement
│   │   │   ├── category-badge.tsx
│   │   │   ├── DisbursementPage.tsx
│   │   │   ├── DisbursementSettingsPage.tsx
│   │   │   ├── kpi-cards.tsx
│   │   │   ├── MonthDetailPage.tsx
│   │   │   ├── months-table.tsx
│   │   │   ├── new-month-sheet.tsx
│   │   │   ├── payment-table.tsx
│   │   │   └── status-badge.tsx
│   │   ├── education
│   │   │   ├── constants.ts
│   │   │   ├── EducationTable.tsx
│   │   │   └── StudentRecordModal.tsx
│   │   ├── households
│   │   │   └── HouseholdsTable.tsx
│   │   ├── landing
│   │   │   ├── ContactModal.tsx
│   │   │   ├── LoginModal.tsx
│   │   │   └── ZakatCalculator.tsx
│   │   ├── medical
│   │   │   ├── dashboard
│   │   │   │   ├── dashboard-header.tsx
│   │   │   │   ├── disbursements-review-tab.tsx
│   │   │   │   ├── kpi-cards.tsx
│   │   │   │   ├── records-table.tsx
│   │   │   │   ├── search-filters.tsx
│   │   │   │   └── warning-banner.tsx
│   │   │   ├── modals
│   │   │   │   ├── add-record-modal.tsx
│   │   │   │   ├── step1-household-person.tsx
│   │   │   │   ├── step2-medical-data.tsx
│   │   │   │   └── step3-aid-selection.tsx
│   │   │   ├── shared
│   │   │   │   ├── age-circle.tsx
│   │   │   │   ├── aid-type-grid.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── combobox.tsx
│   │   │   │   └── eligibility-panel.tsx
│   │   │   ├── MedicalPage.tsx
│   │   │   └── MedicalSummaryWidget.tsx
│   │   ├── providers
│   │   │   ├── locale-document-attributes.tsx
│   │   │   └── theme-provider.tsx
│   │   ├── ui
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button-group.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── empty.tsx
│   │   │   ├── field.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input-group.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── input.tsx
│   │   │   ├── item.tsx
│   │   │   ├── kbd.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── spinner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   ├── volunteers
│   │   │   ├── TaskModal.tsx
│   │   │   └── VolunteerModal.tsx
│   │   ├── wizard
│   │   │   ├── steps
│   │   │   │   ├── BasicInfoStep.tsx
│   │   │   │   ├── BurdensStep.tsx
│   │   │   │   ├── EvaluationStep.tsx
│   │   │   │   ├── IncomeStep.tsx
│   │   │   │   └── PersonsStep.tsx
│   │   │   ├── autosave-indicator.tsx
│   │   │   ├── score-delta-badge.tsx
│   │   │   ├── sticky-score-panel.tsx
│   │   │   ├── wizard-shell.tsx
│   │   │   └── wizard-steps.tsx
│   │   ├── AccountSettingsModal.tsx
│   │   ├── animated-counter.tsx
│   │   ├── app-sidebar.tsx
│   │   ├── dashboard-charts.tsx
│   │   ├── ForcePasswordChange.tsx
│   │   ├── global-error-boundary.tsx
│   │   ├── language-switcher.tsx
│   │   └── topbar.tsx
│   ├── e2e
│   │   ├── auth.spec.ts
│   │   └── wizard.spec.ts
│   ├── hooks
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   ├── i18n
│   │   ├── navigation.ts
│   │   ├── request.ts
│   │   └── routing.ts
│   ├── lib
│   │   ├── api
│   │   │   ├── admin-api.ts
│   │   │   ├── analytics-api.ts
│   │   │   ├── audit-api.ts
│   │   │   ├── auth-api.ts
│   │   │   ├── client.ts
│   │   │   ├── disbursement-api.ts
│   │   │   ├── education-api.ts
│   │   │   ├── households-api.ts
│   │   │   ├── medical-api.ts
│   │   │   ├── scoring-api.ts
│   │   │   ├── users-api.ts
│   │   │   └── verification-api.ts
│   │   ├── constants
│   │   │   └── permissions.ts
│   │   ├── data
│   │   │   └── quranJuz.ts
│   │   ├── disbursement
│   │   │   ├── mock-data.ts
│   │   │   ├── store.ts
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   ├── format
│   │   │   └── locale-format.ts
│   │   ├── helpers
│   │   │   └── personCardCalculations.ts
│   │   ├── hooks
│   │   │   └── usePermission.ts
│   │   ├── i18n
│   │   │   ├── ar
│   │   │   ├── en
│   │   │   ├── locales
│   │   │   │   ├── ar
│   │   │   │   └── en
│   │   │   ├── bilingual.ts
│   │   │   ├── config.ts
│   │   │   ├── constants.ts
│   │   │   ├── dict-label.ts
│   │   │   ├── locales.ts
│   │   │   └── resolve-label.ts
│   │   ├── medical
│   │   │   ├── store.ts
│   │   │   └── utils.ts
│   │   ├── stores
│   │   │   ├── adminStore.ts
│   │   │   ├── authStore.ts
│   │   │   ├── constants.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── educationStore.ts
│   │   │   ├── householdStore.ts
│   │   │   ├── medicalModalStore.ts
│   │   │   ├── medicalStore.ts
│   │   │   ├── notificationStore.ts
│   │   │   ├── scoringStore.ts
│   │   │   └── wizardStore.ts
│   │   ├── theme
│   │   │   ├── index.ts
│   │   │   └── storage.ts
│   │   ├── types
│   │   │   └── api.ts
│   │   ├── utils
│   │   │   ├── passwordStrength.ts
│   │   │   └── zakatCalculator.ts
│   │   ├── dashboard-classification-badge.ts
│   │   ├── eligibility.ts
│   │   └── utils.ts
│   ├── messages
│   │   ├── ar
│   │   │   ├── analytics.json
│   │   │   ├── common.json
│   │   │   ├── dashboard.json
│   │   │   ├── disbursement.json
│   │   │   ├── domain.json
│   │   │   ├── education.json
│   │   │   ├── families.json
│   │   │   ├── forms.json
│   │   │   ├── households.json
│   │   │   ├── ruleEditor.json
│   │   │   ├── rules.json
│   │   │   ├── scoring.json
│   │   │   ├── surface.json
│   │   │   ├── users.json
│   │   │   ├── verification.json
│   │   │   └── volunteers.json
│   │   └── en
│   │       ├── analytics.json
│   │       ├── common.json
│   │       ├── dashboard.json
│   │       ├── disbursement.json
│   │       ├── domain.json
│   │       ├── education.json
│   │       ├── families.json
│   │       ├── forms.json
│   │       ├── households.json
│   │       ├── ruleEditor.json
│   │       ├── rules.json
│   │       ├── scoring.json
│   │       ├── surface.json
│   │       ├── users.json
│   │       ├── verification.json
│   │       └── volunteers.json
│   ├── public
│   │   ├── images
│   │   │   ├── features-analytics.png
│   │   │   ├── features-households.png
│   │   │   ├── features-targeting.png
│   │   │   └── hero-dashboard.png
│   │   ├── apple-icon-dark.png
│   │   ├── apple-icon-light.png
│   │   ├── CharityHub_Import_Template_v2.xlsx
│   │   ├── CharityHub_Import_Template.xlsx
│   │   ├── hero-dashboard.png
│   │   ├── icon-dark-16x16.png
│   │   ├── icon-dark-32x32.png
│   │   ├── icon-light-16x16.png
│   │   ├── icon-light-32x32.png
│   │   └── preview.png
│   ├── styles
│   │   └── themes.css
│   ├── types
│   │   └── medical.ts
│   ├── components.json
│   ├── eslint.config.mjs
│   ├── lint_output.txt
│   ├── lint.json
│   ├── next-env.d.ts
│   ├── next.config.mjs
│   ├── package-lock.json
│   ├── package.json
│   ├── playwright.config.ts
│   ├── pnpm-lock.yaml
│   ├── postcss.config.mjs
│   ├── proxy.ts
│   ├── tsconfig.json
│   └── tsconfig.tsbuildinfo
├── nginx
│   └── nginx.conf
├── .dockerignore
├── .gitignore
├── backend_audit_report.md.resolved
├── DATABASE_SETUP.md
├── debug_test.log
├── docker-compose.override.yml
├── FIX_ALL_ISSUES.md
├── FIX_AND_RUN.md
├── generate_tree.js
├── New Microsoft Word Document.docx
├── PersonsStep.diff
├── PRISMA_EXPLANATION.md
├── PROJECT_BOOK_CONTEXT.md
├── PROJECT_DETAILED_REPORT_AR.md
├── PROJECT_STATUS.md
├── QUICK_DATABASE_SETUP.ps1
├── QUICK_START.ps1
├── README.md
├── RUN_ME.md
├── RUNNING_NOW.md
├── SETUP_COMPLETE.md
├── SOLUTION_SUMMARY.md
├── START_HERE.md
├── START_SERVERS.md
└── START_SYSTEM.md

```
