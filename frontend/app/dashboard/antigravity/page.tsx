"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SimulationRunner from "@/components/simulation-runner";
import PhysicsModelCard from "@/components/physics-model-card";
import ResearchLogEntry from "@/components/research-log-entry";
import { usePhysicsModels } from "@/hooks/use-physics-models";
import { useSimulations } from "@/hooks/use-simulations";
import { useResearchLogs } from "@/hooks/use-research-logs";
import {
    Atom,
    FlaskConical,
    ScrollText,
    Loader2,
    AlertCircle,
    Plus,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function StatusBadge({ status }) {
    const colors = {
        COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
        RUNNING: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
        PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        FAILED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}>
            {status}
        </span>
    );
}

function ErrorAlert({ message }) {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{message}</span>
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
    );
}

// ─── Simulations Tab ──────────────────────────────────────────────────────────

function SimulationsTab() {
    const { simulations, loading, creating, error, createSimulation, deleteSimulation } = useSimulations();
    const { models } = usePhysicsModels();

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <div className="space-y-6">
            {/* Simulation Runner */}
            <SimulationRunner models={models} onCreate={createSimulation} creating={creating} />

            {/* Past Simulations */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Simulation History
                </h3>
                {simulations.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">
                        <FlaskConical className="mx-auto h-10 w-10 mb-3 opacity-40" />
                        <p>No simulations yet. Run your first simulation above!</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {simulations.map((sim) => (
                            <div
                                key={sim.id}
                                className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-shadow hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{sim.name}</h4>
                                            <StatusBadge status={sim.status} />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Model: {sim.physicsModel?.name || "Unknown"} · {new Date(sim.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                                        onClick={() => deleteSimulation(sim.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                                {sim.result && (
                                    <div className="mt-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Results</p>
                                        <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto max-h-40 scrollbar-thin">
                                            {JSON.stringify(sim.result.output_data, null, 2)}
                                        </pre>
                                        {sim.result.computation_time && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Computed in {sim.result.computation_time}ms
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Physics Models Tab ───────────────────────────────────────────────────────

function PhysicsModelsTab() {
    const { models, loading, error } = usePhysicsModels();
    const [search, setSearch] = useState("");

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    const filtered = models.filter(
        (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search models..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>
            {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">
                    <Atom className="mx-auto h-10 w-10 mb-3 opacity-40" />
                    <p>No physics models found. Add models via the API or seed the database.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((model) => (
                        <PhysicsModelCard key={model.id} model={model} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Research Logs Tab ────────────────────────────────────────────────────────

function ResearchLogsTab() {
    const { logs, loading, error, createLog, deleteLog } = useResearchLogs();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ title: "", content: "", tags: "" });

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    const handleCreate = async () => {
        await createLog({
            title: form.title,
            content: form.content,
            tags: form.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
        });
        setForm({ title: "", content: "", tags: "" });
        setOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Research Logs
                </h3>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700">
                            <Plus className="h-4 w-4" /> New Entry
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Research Log</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    placeholder="Observation title..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Content</Label>
                                <Textarea
                                    value={form.content}
                                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                                    placeholder="Describe your findings..."
                                    rows={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tags (comma-separated)</Label>
                                <Input
                                    value={form.tags}
                                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                                    placeholder="gravity, quantum, experiment"
                                />
                            </div>
                            <Button
                                className="w-full bg-violet-600 hover:bg-violet-700"
                                onClick={handleCreate}
                                disabled={!form.title || !form.content}
                            >
                                Save Log Entry
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {logs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">
                    <ScrollText className="mx-auto h-10 w-10 mb-3 opacity-40" />
                    <p>No research logs yet. Create your first entry!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {logs.map((log) => (
                        <ResearchLogEntry key={log.id} log={log} onDelete={() => deleteLog(log.id)} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AntigravityPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 p-2 shadow-lg shadow-violet-500/25">
                        <Atom className="h-5 w-5 text-white" />
                    </span>
                    Antigravity Research Platform
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Run physics simulations, explore models, and document your research findings.
                </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="simulations" className="space-y-4">
                <TabsList className="bg-gray-100 dark:bg-gray-800">
                    <TabsTrigger value="simulations" className="gap-1.5">
                        <FlaskConical className="h-4 w-4" /> Simulations
                    </TabsTrigger>
                    <TabsTrigger value="models" className="gap-1.5">
                        <Atom className="h-4 w-4" /> Physics Models
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="gap-1.5">
                        <ScrollText className="h-4 w-4" /> Research Logs
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="simulations">
                    <SimulationsTab />
                </TabsContent>

                <TabsContent value="models">
                    <PhysicsModelsTab />
                </TabsContent>

                <TabsContent value="logs">
                    <ResearchLogsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
