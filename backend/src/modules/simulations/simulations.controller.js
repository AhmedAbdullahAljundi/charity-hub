/**
 * Simulations Controller
 *
 * HTTP request handlers for simulation endpoints
 */

const service = require('./simulations.service')
const { validateCreateSimulation } = require('./simulations.validator')

const simulationsController = {
    /**
     * GET /api/v1/simulations
     */
    list: async (req, res, next) => {
        try {
            const userId = req.user.userId
            const { page, limit, status } = req.query
            const result = await service.listSimulations(userId, {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                status,
            })
            res.json({ success: true, ...result })
        } catch (error) {
            next(error)
        }
    },

    /**
     * GET /api/v1/simulations/:id
     */
    getById: async (req, res, next) => {
        try {
            const userId = req.user.userId
            const simulation = await service.getSimulationById(req.params.id, userId)
            res.json({ success: true, data: simulation })
        } catch (error) {
            next(error)
        }
    },

    /**
     * POST /api/v1/simulations
     */
    create: async (req, res, next) => {
        try {
            const userId = req.user.userId
            const validation = validateCreateSimulation(req.body)
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors,
                })
            }
            const simulation = await service.createAndRunSimulation(userId, validation.value)
            res.status(201).json({ success: true, data: simulation })
        } catch (error) {
            next(error)
        }
    },

    /**
     * DELETE /api/v1/simulations/:id
     */
    delete: async (req, res, next) => {
        try {
            const userId = req.user.userId
            await service.deleteSimulation(req.params.id, userId)
            res.json({ success: true, message: 'Simulation deleted' })
        } catch (error) {
            next(error)
        }
    },
}

module.exports = simulationsController
