/**
 * Antigravity Research Platform – API Service Layer
 *
 * Wraps all physics-models, simulations, and research-logs API calls
 * using the existing Axios instance from lib/api.js
 */

import api from "./api";

// ─── Physics Models ───────────────────────────────────────────────────────────

export const physicsModelsApi = {
    list: (params = {}) => api.get("/v1/physics-models", { params }),
    getById: (id) => api.get(`/v1/physics-models/${id}`),
    create: (data) => api.post("/v1/physics-models", data),
    update: (id, data) => api.put(`/v1/physics-models/${id}`, data),
    delete: (id) => api.delete(`/v1/physics-models/${id}`),
};

// ─── Simulations ──────────────────────────────────────────────────────────────

export const simulationsApi = {
    list: (params = {}) => api.get("/v1/simulations", { params }),
    getById: (id) => api.get(`/v1/simulations/${id}`),
    create: (data) => api.post("/v1/simulations", data),
    delete: (id) => api.delete(`/v1/simulations/${id}`),
};

// ─── Research Logs ────────────────────────────────────────────────────────────

export const researchLogsApi = {
    list: (params = {}) => api.get("/v1/research-logs", { params }),
    getById: (id) => api.get(`/v1/research-logs/${id}`),
    create: (data) => api.post("/v1/research-logs", data),
    update: (id, data) => api.put(`/v1/research-logs/${id}`, data),
    delete: (id) => api.delete(`/v1/research-logs/${id}`),
};
