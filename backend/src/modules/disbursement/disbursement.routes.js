/**
 * Disbursement Routes
 * Routes + inline controllers for the monthly disbursement module.
 *
 * Permissions:
 *   GET endpoints:                 SCORE_READ
 *   calculate, approve, adjust:    SCORE_DECIDE
 *   reopen, config PUT:            RULES_WRITE
 *   simulate:                      SCORE_SIMULATE
 */

'use strict';

const express = require('express');
const { requireAuth }       = require('../../middleware/auth');
const { requirePermission, requireRoles, PERMISSIONS } = require('../../shared/permissions');
const { UserRole }          = require('../../shared/constants/enums');
const service               = require('./disbursement.service');

const router = express.Router();

// All disbursement routes require authentication
router.use(requireAuth);

// ─── Helper ───────────────────────────────────────────────────────────────────

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// ══════════════════════════════════════════════════════════════════════════════
// STATIC routes first (must come before /:monthId to avoid conflicts)
// ══════════════════════════════════════════════════════════════════════════════

// POST /api/disbursement/simulate
router.post(
  '/simulate',
  requirePermission(PERMISSIONS.SCORE_SIMULATE),
  asyncHandler(async (req, res) => {
    const result = await service.simulateMonth(req.body);
    res.json({ success: true, data: result });
  }),
);

// POST /api/disbursement/contributions
router.post(
  '/contributions',
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  asyncHandler(async (req, res) => {
    const contribution = await service.addExternalContribution(req.user, req.body);
    res.status(201).json({ success: true, data: contribution });
  }),
);

// GET /api/disbursement/config/categories
router.get(
  '/config/categories',
  requirePermission(PERMISSIONS.SCORE_READ),
  asyncHandler(async (_req, res) => {
    const configs = await service.getCategoryConfigs();
    res.json({ success: true, data: configs });
  }),
);

// PUT /api/disbursement/config/categories/:code
router.put(
  '/config/categories/:code',
  requireRoles(UserRole.ADMIN),
  requirePermission(PERMISSIONS.RULES_WRITE),
  asyncHandler(async (req, res) => {
    const updated = await service.updateCategoryConfig(
      req.user,
      req.params.code,
      req.body,
    );
    res.json({ success: true, data: updated });
  }),
);

// GET /api/disbursement/config/grants
router.get(
  '/config/grants',
  requirePermission(PERMISSIONS.SCORE_READ),
  asyncHandler(async (_req, res) => {
    const grants = await service.getGrantConfigs();
    res.json({ success: true, data: grants });
  }),
);

// PUT /api/disbursement/config/grants/:code
router.put(
  '/config/grants/:code',
  requireRoles(UserRole.ADMIN),
  requirePermission(PERMISSIONS.RULES_WRITE),
  asyncHandler(async (req, res) => {
    const updated = await service.updateGrantConfig(
      req.user,
      req.params.code,
      req.body,
    );
    res.json({ success: true, data: updated });
  }),
);

// ══════════════════════════════════════════════════════════════════════════════
// Collection routes
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/disbursement
router.get(
  '/',
  requirePermission(PERMISSIONS.SCORE_READ),
  asyncHandler(async (req, res) => {
    const skip   = parseInt(req.query.skip)  || 0;
    const take   = parseInt(req.query.take)  || 20;
    const status = req.query.status          || undefined;
    const result = await service.listMonths({ skip, take, status });
    res.json({ success: true, data: result });
  }),
);

// POST /api/disbursement
router.post(
  '/',
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  asyncHandler(async (req, res) => {
    const month = await service.openMonth(req.user, req.body);
    res.status(201).json({ success: true, data: month });
  }),
);

// ══════════════════════════════════════════════════════════════════════════════
// Month-level routes  /:monthId
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/disbursement/:monthId
router.get(
  '/:monthId',
  requirePermission(PERMISSIONS.SCORE_READ),
  asyncHandler(async (req, res) => {
    const month = await service.getMonth(req.params.monthId);
    res.json({ success: true, data: month });
  }),
);

// POST /api/disbursement/:monthId/calculate
router.post(
  '/:monthId/calculate',
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  asyncHandler(async (req, res) => {
    const result = await service.calculateMonth(req.user, req.params.monthId);
    res.json({ success: true, data: result });
  }),
);

// PATCH /api/disbursement/:monthId/approve
router.patch(
  '/:monthId/approve',
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  asyncHandler(async (req, res) => {
    const result = await service.approveMonth(req.user, req.params.monthId, req.body);
    res.json({ success: true, data: result });
  }),
);

// PATCH /api/disbursement/:monthId/reopen   (ADMIN only)
router.patch(
  '/:monthId/reopen',
  requireRoles(UserRole.ADMIN),
  requirePermission(PERMISSIONS.RULES_WRITE),
  asyncHandler(async (req, res) => {
    const result = await service.reopenMonth(req.user, req.params.monthId, req.body);
    res.json({ success: true, data: result });
  }),
);

// GET /api/disbursement/:monthId/export/meeza
router.get(
  '/:monthId/export/meeza',
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  asyncHandler(async (req, res) => {
    const csv = await service.exportMeezaFile(req.params.monthId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="meeza-${req.params.monthId}.csv"`,
    );
    res.send('\uFEFF' + csv); // BOM for Excel Arabic compatibility
  }),
);

// ══════════════════════════════════════════════════════════════════════════════
// Payment-level routes  /:monthId/payments/:id
// ══════════════════════════════════════════════════════════════════════════════

// PATCH /api/disbursement/:monthId/payments/:id/adjust
router.patch(
  '/:monthId/payments/:id/adjust',
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  asyncHandler(async (req, res) => {
    const payment = await service.adjustPayment(req.user, req.params.id, req.body);
    res.json({ success: true, data: payment });
  }),
);

// PATCH /api/disbursement/:monthId/payments/:id/status
router.patch(
  '/:monthId/payments/:id/status',
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  asyncHandler(async (req, res) => {
    const payment = await service.updatePaymentStatus(req.user, req.params.id, req.body);
    res.json({ success: true, data: payment });
  }),
);

// POST /api/disbursement/:monthId/payments
router.post(
  '/:monthId/payments',
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  asyncHandler(async (req, res) => {
    const payment = await service.addPayment(req.user, req.params.monthId, req.body.householdId);
    res.status(201).json({ success: true, data: payment });
  }),
);

// DELETE /api/disbursement/:monthId/payments/:id
router.delete(
  '/:monthId/payments/:id',
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  asyncHandler(async (req, res) => {
    await service.removePayment(req.user, req.params.monthId, req.params.id);
    res.json({ success: true });
  }),
);

module.exports = router;
