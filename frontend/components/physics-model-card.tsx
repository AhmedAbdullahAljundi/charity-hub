"use client";

import { Atom, Code, Tag } from "lucide-react";

export default function PhysicsModelCard({ model }) {
    return (
        <div className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 transition-all hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-700 hover:-translate-y-0.5">
            {/* Icon + Category */}
            <div className="flex items-start justify-between mb-3">
                <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-2">
                    <Atom className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                {model.category && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-300">
                        <Tag className="h-3 w-3" />
                        {model.category}
                    </span>
                )}
            </div>

            {/* Name */}
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{model.name}</h4>

            {/* Description */}
            {model.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {model.description}
                </p>
            )}

            {/* Equation */}
            {model.equation && (
                <div className="flex items-center gap-1.5 rounded-md bg-gray-50 dark:bg-gray-800/80 px-3 py-2 mb-3">
                    <Code className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <code className="text-xs text-gray-600 dark:text-gray-300 font-mono truncate">
                        {model.equation}
                    </code>
                </div>
            )}

            {/* Parameters */}
            {model.parameters && typeof model.parameters === "object" && (
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Parameters</p>
                    <div className="flex flex-wrap gap-1">
                        {(Array.isArray(model.parameters)
                            ? model.parameters.map((p) => (typeof p === "string" ? p : p.key || p.name))
                            : Object.keys(model.parameters)
                        ).map((key) => (
                            <span
                                key={key}
                                className="inline-block rounded bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300"
                            >
                                {key}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Version */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                v{model.version}
            </div>
        </div>
    );
}
