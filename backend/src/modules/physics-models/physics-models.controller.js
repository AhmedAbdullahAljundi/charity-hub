/**
 * Physics Models Controller
 *
 * HTTP request handlers for physics model endpoints
 */

const service = require('./physics-models.service')

const physicsModelsController = {
    /**
     * GET /api/v1/physics-models
     */
    list: async (req, res, next) => {
        try {
            const { category } = req.query
            const models = await service.listModels({ category })
            res.json({ success: true, data: models })
        } catch (error) {
            next(error)
        }
    },

    /**
     * GET /api/v1/physics-models/:id
     */
    getById: async (req, res, next) => {
        try {
            const model = await service.getModelById(req.params.id)
            res.json({ success: true, data: model })
        } catch (error) {
            next(error)
        }
    },

    /**
     * POST /api/v1/physics-models
     */
    create: async (req, res, next) => {
        try {
            const model = await service.createModel(req.body)
            res.status(201).json({ success: true, data: model })
        } catch (error) {
            next(error)
        }
    },

    /**
     * PUT /api/v1/physics-models/:id
     */
    update: async (req, res, next) => {
        try {
            const model = await service.updateModel(req.params.id, req.body)
            res.json({ success: true, data: model })
        } catch (error) {
            next(error)
        }
    },

    /**
     * DELETE /api/v1/physics-models/:id
     */
    delete: async (req, res, next) => {
        try {
            await service.deleteModel(req.params.id)
            res.json({ success: true, message: 'Physics model deactivated' })
        } catch (error) {
            next(error)
        }
    },
}

module.exports = physicsModelsController
