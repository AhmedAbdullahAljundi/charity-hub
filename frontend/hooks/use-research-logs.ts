"use client";

import { useState, useEffect, useCallback } from "react";
import { researchLogsApi } from "@/lib/antigravity-api";

/**
 * Hook to manage research logs CRUD
 */
export function useResearchLogs(initialParams = {}) {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLogs = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const res = await researchLogsApi.list({ ...initialParams, ...params });
            const d = res.data;
            setLogs(d.data || []);
            setPagination({ total: d.total, page: d.page, totalPages: d.totalPages });
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const createLog = useCallback(async (data) => {
        try {
            const res = await researchLogsApi.create(data);
            const newLog = res.data?.data;
            setLogs((prev) => [newLog, ...prev]);
            return newLog;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        }
    }, []);

    const updateLog = useCallback(async (id, data) => {
        try {
            const res = await researchLogsApi.update(id, data);
            const updated = res.data?.data;
            setLogs((prev) => prev.map((l) => (l.id === id ? updated : l)));
            return updated;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        }
    }, []);

    const deleteLog = useCallback(async (id) => {
        try {
            await researchLogsApi.delete(id);
            setLogs((prev) => prev.filter((l) => l.id !== id));
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        }
    }, []);

    return { logs, pagination, loading, error, fetchLogs, createLog, updateLog, deleteLog };
}
