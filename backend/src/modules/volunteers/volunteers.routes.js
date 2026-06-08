const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requireRoles } = require('../../shared/permissions');
const volunteersController = require('./volunteers.controller');

const router = express.Router();

// Allow only admins and supervisors to manage volunteers
router.use(requireAuth);
router.use(requireRoles('ADMIN', 'SUPERVISOR'));

router.get('/', volunteersController.list);
router.post('/', volunteersController.create);
router.get('/:id', volunteersController.getOne);
router.put('/:id', volunteersController.update);
router.delete('/:id', volunteersController.remove);

router.post('/:id/tasks', volunteersController.assignTask);
router.patch('/tasks/:taskId/status', volunteersController.updateTaskStatus);

module.exports = router;
