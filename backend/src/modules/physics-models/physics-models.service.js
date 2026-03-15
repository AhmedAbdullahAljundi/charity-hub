/**
 * Physics Models Service
 *
 * Business logic for physics model CRUD operations
 */

const prisma = require('../../config/prisma')
const { NotFoundError } = require('../../utils/errors')

/**
 * List all active physics models
 */
async function listModels({ category, includeInactive = false } = {}) {
  const where = {}
  if (!includeInactive) where.active = true
  if (category) where.category = category

  return prisma.physicsModel.findMany({
    where,
    orderBy: { name: 'asc' },
  })
}

/**
 * Get a single physics model by ID
 */
async function getModelById(id) {
  const model = await prisma.physicsModel.findUnique({ where: { id } })
  if (!model) throw new NotFoundError('Physics model')
  return model
}

/**
 * Create a new physics model
 */
async function createModel(data) {
  return prisma.physicsModel.create({ data })
}

/**
 * Update an existing physics model
 */
async function updateModel(id, data) {
  const existing = await prisma.physicsModel.findUnique({ where: { id } })
  if (!existing) throw new NotFoundError('Physics model')

  return prisma.physicsModel.update({ where: { id }, data })
}

/**
 * Soft-delete a physics model (set active=false)
 */
async function deleteModel(id) {
  const existing = await prisma.physicsModel.findUnique({ where: { id } })
  if (!existing) throw new NotFoundError('Physics model')

  return prisma.physicsModel.update({
    where: { id },
    data: { active: false },
  })
}

module.exports = { listModels, getModelById, createModel, updateModel, deleteModel }
