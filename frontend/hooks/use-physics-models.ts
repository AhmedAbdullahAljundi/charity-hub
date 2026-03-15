"use client";

import { useState, useEffect, useCallback } from "react";
import { physicsModelsApi } from "@/lib/antigravity-api";

/**
 * Hook to fetch and manage physics models
 */
export function usePhysicsModels(options = {}) {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchModels = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await physicsModelsApi.list(options);
            setModels(res.data?.data || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchModels();
    }, [fetchModels]);

    return { models, loading, error, refetch: fetchModels };
}
