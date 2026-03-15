"use client";

import { Trash2, FlaskConical, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResearchLogEntry({ log, onDelete }) {
    const tags = Array.isArray(log.tags) ? log.tags : [];
    const date = new Date(log.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <div className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{log.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{log.content}</p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={onDelete}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <div className="mt-3 flex items-center gap-3 flex-wrap">
                {/* Tags */}
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="inline-block rounded-full bg-violet-50 dark:bg-violet-900/30 px-2.5 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-300"
                    >
                        #{tag}
                    </span>
                ))}

                {/* Linked simulation */}
                {log.simulation && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-300">
                        <FlaskConical className="h-3 w-3" />
                        {log.simulation.name}
                    </span>
                )}

                {/* Timestamp */}
                <span className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {date}
                </span>
            </div>
        </div>
    );
}
