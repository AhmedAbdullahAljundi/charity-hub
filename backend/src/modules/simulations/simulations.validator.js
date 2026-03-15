/**
 * Simulations Validator
 *
 * Input validation for simulation creation
 */

const Joi = require('joi')

const createSimulationSchema = Joi.object({
    physicsModelId: Joi.string().uuid().required().messages({
        'string.guid': 'Physics model ID must be a valid UUID',
        'any.required': 'Physics model ID is required',
    }),
    name: Joi.string().min(1).max(200).required().messages({
        'string.empty': 'Simulation name is required',
        'string.max': 'Simulation name must be 200 characters or less',
    }),
    description: Joi.string().max(1000).optional().allow(''),
    parameters: Joi.object().required().messages({
        'any.required': 'Simulation parameters are required',
    }),
})

function validateCreateSimulation(data) {
    const { error, value } = createSimulationSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
    })

    if (error) {
        return {
            isValid: false,
            errors: error.details.map((d) => d.message),
        }
    }

    return { isValid: true, value }
}

module.exports = { validateCreateSimulation }
