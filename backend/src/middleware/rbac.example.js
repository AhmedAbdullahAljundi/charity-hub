/**
 * Example usage of RBAC middleware
 * 
 * This file demonstrates how to secure routes using the RBAC system
 */

const express = require('express');
const router = express.Router();

// Import middleware
const { requireAuth } = require('./auth');
const {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  requireAnyRole,
  requireAdmin,
} = require('./rbac');

// Example controllers (not implemented)
const familiesController = {
  list: (req, res) => res.json({ message: 'List families' }),
  create: (req, res) => res.json({ message: 'Create family' }),
  update: (req, res) => res.json({ message: 'Update family' }),
  delete: (req, res) => res.json({ message: 'Delete family' }),
};

const scoringController = {
  getScore: (req, res) => res.json({ message: 'Get score' }),
  listScores: (req, res) => res.json({ message: 'List scores' }),
};

const medicalController = {
  approve: (req, res) => res.json({ message: 'Approve medical' }),
};

const auditController = {
  list: (req, res) => res.json({ message: 'List audit logs' }),
};

// ============================================
// Family Routes
// ============================================

// List families - any authenticated user
router.get(
  '/families',
  requireAuth,
  familiesController.list
);

// Create family - requires CREATE_FAMILY permission
router.post(
  '/families',
  requireAuth,
  requirePermission('CREATE_FAMILY'),
  familiesController.create
);

// Update family - requires UPDATE_FAMILY permission
router.put(
  '/families/:id',
  requireAuth,
  requirePermission('UPDATE_FAMILY'),
  familiesController.update
);

// Delete family - Admin only
router.delete(
  '/families/:id',
  requireAuth,
  requireRole('Admin'),
  familiesController.delete
);

// ============================================
// Scoring Routes
// ============================================

// View scoring - requires VIEW_SCORING permission
router.get(
  '/scoring/:familyId',
  requireAuth,
  requirePermission('VIEW_SCORING'),
  scoringController.getScore
);

// List all scores - Admin or MedicalOfficer or Auditor
router.get(
  '/scoring',
  requireAuth,
  requireAnyRole(['Admin', 'MedicalOfficer', 'Auditor']),
  scoringController.listScores
);

// ============================================
// Medical Routes
// ============================================

// Approve medical service - requires APPROVE_MEDICAL permission
router.post(
  '/medical/approve',
  requireAuth,
  requirePermission('APPROVE_MEDICAL'),
  medicalController.approve
);

// ============================================
// Audit Routes
// ============================================

// View audit logs - requires VIEW_AUDIT_LOG permission
router.get(
  '/audit-logs',
  requireAuth,
  requirePermission('VIEW_AUDIT_LOG'),
  auditController.list
);

// ============================================
// Admin Routes
// ============================================

// Admin-only route using convenience function
router.get(
  '/admin/dashboard',
  requireAuth,
  requireAdmin(),
  (req, res) => res.json({ message: 'Admin dashboard' })
);

// ============================================
// Complex Examples
// ============================================

// Multiple permissions (user must have ALL)
router.post(
  '/families/:id/medical',
  requireAuth,
  requireAllPermissions(['UPDATE_FAMILY', 'APPROVE_MEDICAL']),
  (req, res) => res.json({ message: 'Update family medical' })
);

// Multiple permissions (user must have ANY)
router.get(
  '/reports',
  requireAuth,
  requireAnyPermission(['VIEW_SCORING', 'VIEW_AUDIT_LOG']),
  (req, res) => res.json({ message: 'View reports' })
);

// Combined role and permission check
router.post(
  '/families/:id/approve',
  requireAuth,
  requireAnyRole(['Admin', 'MedicalOfficer']), // Must be one of these roles
  requirePermission('APPROVE_MEDICAL'), // And must have this permission
  (req, res) => res.json({ message: 'Approve family' })
);

module.exports = router;
