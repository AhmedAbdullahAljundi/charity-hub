/**
 * Simulations Service
 *
 * Business logic for running physics simulations.
 * Contains the computation engine and CRUD operations.
 */

const prisma = require('../../config/prisma')
const config = require('../../config/env')
const { NotFoundError, AppError } = require('../../utils/errors')

// ─── Built-in Physics Computation Engines ─────────────────────────────────────

const ENGINES = {
    /**
     * Newtonian Gravity: F = G * m1 * m2 / r^2
     */
    newtonian_gravity: (params) => {
        const G = 6.674e-11
        const { mass1, mass2, distance } = params
        const force = (G * mass1 * mass2) / (distance * distance)
        const acceleration1 = force / mass1
        const acceleration2 = force / mass2
        const orbitalVelocity = Math.sqrt((G * mass2) / distance)
        const escapeVelocity = Math.sqrt((2 * G * mass2) / distance)

        return {
            outputData: {
                gravitational_force: force,
                acceleration_body1: acceleration1,
                acceleration_body2: acceleration2,
                orbital_velocity: orbitalVelocity,
                escape_velocity: escapeVelocity,
            },
            metrics: { model: 'newtonian_gravity', convergence: 1.0, iterations: 1 },
        }
    },

    /**
     * Relativistic Energy: E = γmc²
     */
    relativistic_energy: (params) => {
        const c = 299792458 // m/s
        const { mass, velocity } = params
        const beta = velocity / c
        if (beta >= 1) throw new AppError('Velocity must be less than c', 400, 'INVALID_PARAMS')
        const gamma = 1 / Math.sqrt(1 - beta * beta)
        const restEnergy = mass * c * c
        const totalEnergy = gamma * restEnergy
        const kineticEnergy = totalEnergy - restEnergy
        const momentum = gamma * mass * velocity

        return {
            outputData: {
                lorentz_factor: gamma,
                rest_energy_J: restEnergy,
                total_energy_J: totalEnergy,
                kinetic_energy_J: kineticEnergy,
                relativistic_momentum: momentum,
            },
            metrics: { model: 'relativistic_energy', convergence: 1.0, iterations: 1 },
        }
    },

    /**
     * Quantum Harmonic Oscillator: E_n = ℏω(n + ½)
     */
    quantum_oscillator: (params) => {
        const hbar = 1.0545718e-34
        const { angular_frequency, quantum_number = 0, mass } = params
        const n = Math.max(0, Math.floor(quantum_number))
        const energyLevels = []
        for (let i = 0; i <= Math.min(n + 5, 20); i++) {
            energyLevels.push({
                n: i,
                energy: hbar * angular_frequency * (i + 0.5),
            })
        }
        const zeroPointEnergy = hbar * angular_frequency * 0.5
        const classicalAmplitude = Math.sqrt((2 * energyLevels[n].energy) / (mass * angular_frequency * angular_frequency))

        return {
            outputData: {
                energy_levels: energyLevels,
                selected_level_energy: energyLevels[n].energy,
                zero_point_energy: zeroPointEnergy,
                classical_amplitude: classicalAmplitude,
            },
            metrics: { model: 'quantum_oscillator', convergence: 1.0, iterations: n + 6 },
        }
    },

    /**
     * Anti-Gravity Field (theoretical): models hypothetical repulsive gravity
     * F_ag = -G_eff * m * field_strength / r²
     */
    anti_gravity_field: (params) => {
        const G = 6.674e-11
        const { mass, field_strength, distance, coupling_constant = 1.0 } = params
        const effectiveG = G * coupling_constant
        const repulsiveForce = -effectiveG * mass * field_strength / (distance * distance)
        const acceleration = repulsiveForce / mass
        const fieldEnergy = 0.5 * field_strength * distance * distance
        const timeSteps = []
        let pos = distance
        let vel = 0
        const dt = 0.01
        for (let t = 0; t < 100; t++) {
            const a = (-effectiveG * field_strength) / (pos * pos)
            vel += a * dt
            pos += vel * dt
            if (pos <= 0) break
            timeSteps.push({ t: +(t * dt).toFixed(4), position: +pos.toFixed(6), velocity: +vel.toFixed(6) })
        }

        return {
            outputData: {
                repulsive_force: repulsiveForce,
                acceleration,
                field_energy: fieldEnergy,
                trajectory: timeSteps.slice(0, 50),
            },
            metrics: { model: 'anti_gravity_field', convergence: 0.98, iterations: timeSteps.length },
            visualizationData: {
                type: 'line',
                xLabel: 'Time (s)',
                yLabel: 'Position (m)',
                series: [
                    { name: 'Position', data: timeSteps.slice(0, 50).map((s) => ({ x: s.t, y: s.position })) },
                ],
            },
        }
    },

    /**
     * Electromagnetic Field: F = qE + qv×B
     */
    electromagnetic: (params) => {
        const { charge, electric_field, magnetic_field = 0, velocity = 0 } = params
        const electricForce = charge * electric_field
        const magneticForce = charge * velocity * magnetic_field
        const totalForce = Math.sqrt(electricForce ** 2 + magneticForce ** 2)
        const potentialEnergy = -charge * electric_field * 1 // per unit distance

        return {
            outputData: {
                electric_force: electricForce,
                magnetic_force: magneticForce,
                total_force: totalForce,
                potential_energy_per_m: potentialEnergy,
            },
            metrics: { model: 'electromagnetic', convergence: 1.0, iterations: 1 },
        }
    },
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Run a physics computation for the given model category and parameters
 */
function computeSimulation(modelCategory, parameters) {
    const key = modelCategory.toLowerCase().replace(/[\s-]+/g, '_')
    const engine = ENGINES[key]
    if (!engine) {
        // Fallback: generic computation
        return {
            outputData: { message: 'No specialized engine available – parameters stored', parameters },
            metrics: { model: key, convergence: null, iterations: 0 },
        }
    }
    return engine(parameters)
}

/**
 * List simulations for a user (paginated)
 */
async function listSimulations(userId, { page = 1, limit = 20, status } = {}) {
    const where = { user_id: userId }
    if (status) where.status = status

    const [data, total] = await Promise.all([
        prisma.simulation.findMany({
            where,
            include: {
                physicsModel: { select: { id: true, name: true, category: true } },
                result: true,
            },
            orderBy: { created_at: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.simulation.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

/**
 * Get a single simulation with full details
 */
async function getSimulationById(id, userId) {
    const simulation = await prisma.simulation.findFirst({
        where: { id, user_id: userId },
        include: {
            physicsModel: true,
            result: true,
            researchLogs: { orderBy: { created_at: 'desc' }, take: 5 },
        },
    })
    if (!simulation) throw new NotFoundError('Simulation')
    return simulation
}

/**
 * Create & immediately run a simulation
 */
async function createAndRunSimulation(userId, { physicsModelId, name, description, parameters }) {
    // Validate model exists
    const model = await prisma.physicsModel.findUnique({ where: { id: physicsModelId } })
    if (!model) throw new NotFoundError('Physics model')
    if (!model.active) throw new AppError('Physics model is inactive', 400, 'MODEL_INACTIVE')

    // Create simulation record
    const simulation = await prisma.simulation.create({
        data: {
            user_id: userId,
            physics_model_id: physicsModelId,
            name,
            description,
            parameters,
            status: 'RUNNING',
        },
    })

    // Run the computation
    const startTime = Date.now()
    try {
        const result = computeSimulation(model.category || model.name, parameters)
        const computationTime = Date.now() - startTime

        // Store result
        const simResult = await prisma.simulationResult.create({
            data: {
                simulation_id: simulation.id,
                output_data: result.outputData,
                metrics: result.metrics || null,
                visualization_data: result.visualizationData || null,
                computation_time: computationTime,
            },
        })

        // Mark as completed
        const updatedSim = await prisma.simulation.update({
            where: { id: simulation.id },
            data: { status: 'COMPLETED', completed_at: new Date() },
            include: {
                physicsModel: { select: { id: true, name: true, category: true } },
                result: true,
            },
        })

        return updatedSim
    } catch (error) {
        // Mark as failed
        await prisma.simulation.update({
            where: { id: simulation.id },
            data: { status: 'FAILED', error_message: error.message },
        })
        throw error
    }
}

/**
 * Delete a simulation
 */
async function deleteSimulation(id, userId) {
    const simulation = await prisma.simulation.findFirst({
        where: { id, user_id: userId },
    })
    if (!simulation) throw new NotFoundError('Simulation')

    await prisma.simulation.delete({ where: { id } })
}

module.exports = {
    listSimulations,
    getSimulationById,
    createAndRunSimulation,
    deleteSimulation,
    computeSimulation,
}
