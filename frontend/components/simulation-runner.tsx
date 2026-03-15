"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Play, Sparkles } from "lucide-react";

/**
 * Model parameter schemas — defines the expected inputs for each model category.
 * Falls back to a generic key-value input if the model isn't recognized.
 */
const PARAM_SCHEMAS = {
    newtonian_gravity: [
        { key: "mass1", label: "Mass 1 (kg)", type: "number", default: 5.972e24 },
        { key: "mass2", label: "Mass 2 (kg)", type: "number", default: 7.342e22 },
        { key: "distance", label: "Distance (m)", type: "number", default: 3.844e8 },
    ],
    relativistic_energy: [
        { key: "mass", label: "Mass (kg)", type: "number", default: 1.0 },
        { key: "velocity", label: "Velocity (m/s)", type: "number", default: 1e8 },
    ],
    quantum_oscillator: [
        { key: "angular_frequency", label: "Angular Frequency ω (rad/s)", type: "number", default: 1e13 },
        { key: "quantum_number", label: "Quantum Number n", type: "number", default: 3 },
        { key: "mass", label: "Particle Mass (kg)", type: "number", default: 9.109e-31 },
    ],
    anti_gravity_field: [
        { key: "mass", label: "Object Mass (kg)", type: "number", default: 100 },
        { key: "field_strength", label: "Field Strength", type: "number", default: 9.8 },
        { key: "distance", label: "Initial Distance (m)", type: "number", default: 10 },
        { key: "coupling_constant", label: "Coupling Constant", type: "number", default: 1.0 },
    ],
    electromagnetic: [
        { key: "charge", label: "Charge (C)", type: "number", default: 1.6e-19 },
        { key: "electric_field", label: "Electric Field (V/m)", type: "number", default: 1000 },
        { key: "magnetic_field", label: "Magnetic Field (T)", type: "number", default: 0.5 },
        { key: "velocity", label: "Velocity (m/s)", type: "number", default: 1e6 },
    ],
};

function getSchemaKey(model) {
    if (!model) return null;
    const key = (model.category || model.name || "").toLowerCase().replace(/[\s-]+/g, "_");
    return PARAM_SCHEMAS[key] ? key : null;
}

export default function SimulationRunner({ models = [], onCreate, creating }) {
    const [selectedModelId, setSelectedModelId] = useState("");
    const [name, setName] = useState("");
    const [params, setParams] = useState({});
    const [result, setResult] = useState(null);

    const selectedModel = models.find((m) => m.id === selectedModelId);
    const schemaKey = getSchemaKey(selectedModel);
    const schema = schemaKey ? PARAM_SCHEMAS[schemaKey] : null;

    const handleModelChange = (id) => {
        setSelectedModelId(id);
        setResult(null);
        const model = models.find((m) => m.id === id);
        const key = getSchemaKey(model);
        if (key && PARAM_SCHEMAS[key]) {
            const defaults = {};
            PARAM_SCHEMAS[key].forEach((p) => (defaults[p.key] = p.default));
            setParams(defaults);
        } else {
            setParams({});
        }
    };

    const handleRun = async () => {
        if (!selectedModelId || !name) return;
        try {
            const sim = await onCreate({
                physicsModelId: selectedModelId,
                name,
                parameters: params,
            });
            setResult(sim);
        } catch (err) {
            // Error handled by hook
        }
    };

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-500" /> Simulation Runner
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Select a physics model, configure parameters, and run a simulation.
                </p>
            </div>

            <div className="p-4 space-y-4">
                {/* Row 1: model + name */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Physics Model</Label>
                        <Select value={selectedModelId} onValueChange={handleModelChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a model..." />
                            </SelectTrigger>
                            <SelectContent>
                                {models.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>
                                        {m.name} {m.category ? `(${m.category})` : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Simulation Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Earth-Moon gravity test"
                        />
                    </div>
                </div>

                {/* Dynamic parameters */}
                {selectedModel && schema && (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Parameters</Label>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {schema.map((p) => (
                                <div key={p.key} className="space-y-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-400">{p.label}</label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={params[p.key] ?? ""}
                                        onChange={(e) =>
                                            setParams((prev) => ({ ...prev, [p.key]: parseFloat(e.target.value) || 0 }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Selected model without known schema — show generic JSON input */}
                {selectedModel && !schema && (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Parameters (JSON)</Label>
                        <textarea
                            className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 font-mono text-xs"
                            rows={4}
                            value={JSON.stringify(params, null, 2)}
                            onChange={(e) => {
                                try { setParams(JSON.parse(e.target.value)); } catch { }
                            }}
                        />
                    </div>
                )}

                {/* Run button */}
                <Button
                    onClick={handleRun}
                    disabled={!selectedModelId || !name || creating}
                    className="w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20"
                >
                    {creating ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Running Simulation...
                        </>
                    ) : (
                        <>
                            <Play className="h-4 w-4" /> Run Simulation
                        </>
                    )}
                </Button>

                {/* Inline result display */}
                {result?.result && (
                    <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                ✓ Simulation Complete
                            </h4>
                            {result.result.computation_time && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                    {result.result.computation_time}ms
                                </span>
                            )}
                        </div>
                        <pre className="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 rounded p-3 overflow-x-auto max-h-64 scrollbar-thin">
                            {JSON.stringify(result.result.output_data, null, 2)}
                        </pre>
                        {result.result.metrics && (
                            <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                                {result.result.metrics.convergence != null && (
                                    <span>Convergence: {result.result.metrics.convergence}</span>
                                )}
                                {result.result.metrics.iterations != null && (
                                    <span>Iterations: {result.result.metrics.iterations}</span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
