/**
 * Research Logs Service
 *
 * Business logic for research log CRUD operations
 */

const prisma = require('../../config/prisma')
const { NotFoundError } = require('../../utils/errors')

/**
 * List research logs for a user (paginated, filterable)
 */
async function listLogs(userId, { page = 1, limit = 20, search, tag } = {}) {
    const where = { user_id: userId }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
        ]
    }

    // Tag filtering via JSON contains
    if (tag) {
        where.tags = { array_contains: [tag] }
    }

    const [data, total] = await Promise.all([
        prisma.researchLog.findMany({
            where,
            include: {
                simulation: { select: { id: true, name: true, status: true } },
            },
            orderBy: { created_at: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.researchLog.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

/**
 * Get a single research log
 */
async function getLogById(id, userId) {
    const log = await prisma.researchLog.findFirst({
        where: { id, user_id: userId },
        include: {
            simulation: {
                include: {
                    physicsModel: { select: { id: true, name: true } },
                    result: true,
                },
            },
        },
    })
    if (!log) throw new NotFoundError('Research log')
    return log
}

/**
 * Create a research log entry
 */
async function createLog(userId, data) {
    return prisma.researchLog.create({
        data: {
            user_id: userId,
            title: data.title,
            content: data.content,
            tags: data.tags || [],
            simulation_id: data.simulationId || null,
        },
        include: {
            simulation: { select: { id: true, name: true, status: true } },
        },
    })
}

/**
 * Update a research log
 */
async function updateLog(id, userId, data) {
    const existing = await prisma.researchLog.findFirst({
        where: { id, user_id: userId },
    })
    if (!existing) throw new NotFoundError('Research log')

    return prisma.researchLog.update({
        where: { id },
        data: {
            title: data.title,
            content: data.content,
            tags: data.tags,
            simulation_id: data.simulationId,
        },
        include: {
            simulation: { select: { id: true, name: true, status: true } },
        },
    })
}

/**
 * Delete a research log
 */
async function deleteLog(id, userId) {
    const existing = await prisma.researchLog.findFirst({
        where: { id, user_id: userId },
    })
    if (!existing) throw new NotFoundError('Research log')

    await prisma.researchLog.delete({ where: { id } })
}

module.exports = { listLogs, getLogById, createLog, updateLog, deleteLog }
