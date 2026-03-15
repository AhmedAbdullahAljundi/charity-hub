"use client";

import { useState, useEffect, useCallback } from "react";
import { simulationsApi } from "@/lib/antigravity-api";

/**
 * Hook to manage simulations (list, create, delete)
 */
export function useSimulations(initialParams = {}) {
    const [simulations, setSimulations] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);

    const fetchSimulations = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const res = await simulationsApi.list({ ...initialParams, ...params });
            const d = res.data;
            setSimulations(d.data || []);
            setPagination({ total: d.total, page: d.page, totalPages: d.totalPages });
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSimulations();
    }, [fetchSimulations]);

    const createSimulation = useCallback(async (data) => {
        try {
            setCreating(true);
            setError(null);
            const res = await simulationsApi.create(data);
            const newSim = res.data?.data;
            setSimulations((prev) => [newSim, ...prev]);
            return newSim;
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            throw err;
        } finally {
            setCreating(false);
        }
    }, []);

    const deleteSimulation = useCallback(async (id) => {
        try {
            await simulationsApi.delete(id);
            setSimulations((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        }
    }, []);

    return {
        simulations,
        pagination,
        loading,
        creating,
        error,
        fetchSimulations,
        createSimulation,
        deleteSimulation,
    };
}
