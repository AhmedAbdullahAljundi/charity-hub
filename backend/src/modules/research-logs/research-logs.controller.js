/**
 * Research Logs Controller
 *
 * HTTP request handlers for research log endpoints
 */

const service = require('./research-logs.service')

const researchLogsController = {
    /**
     * GET /api/v1/research-logs
     */
    list: async (req, res, next) => {
        try {
            const userId = req.user.userId
            const { page, limit, search, tag } = req.query
            const result = await service.listLogs(userId, {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                search,
                tag,
            })
            res.json({ success: true, ...result })
        } catch (error) {
            next(error)
        }
    },

    /**
     * GET /api/v1/research-logs/:id
     */
    getById: async (req, res, next) => {
        try {
            const userId = req.user.userId
            const log = await service.getLogById(req.params.id, userId)
            res.json({ success: true, data: log })
        } catch (error) {
            next(error)
        }
    },

    /**
     * POST /api/v1/research-logs
     */
    create: async (req, res, next) => {
        try {
            const userId = req.user.userId
            const log = await service.createLog(userId, req.body)
            res.status(201).json({ success: true, data: log })
        } catch (error) {
            next(error)
        }
    },

    /**
     * PUT /api/v1/research-logs/:id
     */
    update: async (req, res, next) => {
        try {
            const userId = req.user.userId
            const log = await service.updateLog(req.params.id, userId, req.body)
            res.json({ success: true, data: log })
        } catch (error) {
            next(error)
        }
    },

    /**
     * DELETE /api/v1/research-logs/:id
     */
    delete: async (req, res, next) => {
        try {
            const userId = req.user.userId
            await service.deleteLog(req.params.id, userId)
            res.json({ success: true, message: 'Research log deleted' })
        } catch (error) {
            next(error)
        }
    },
}

module.exports = researchLogsController
