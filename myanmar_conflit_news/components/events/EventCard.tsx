"use client";

import { useSearchParams } from "next/navigation";
import { EventData } from "@/lib/event-types";
import { Calendar, MapPin, Users, AlertTriangle, FileText, Globe } from "lucide-react";

interface EventCardProps {
    event: EventData;
}

export function EventCard({ event }: EventCardProps) {
    const searchParams = useSearchParams();
    const searchText = searchParams.get("searchText") || "";

    // Format actors display
    const primaryActors = event.actors.filter((a) => !a.is_associated);
    const associatedActors = event.actors.filter((a) => a.is_associated);

    const actor1 = primaryActors.find((a) => a.actor_role === 1);
    const actor2 = primaryActors.find((a) => a.actor_role === 2);

    const actorsDisplay = actor1 && actor2
        ? `${actor1.actor_name} VS ${actor2.actor_name}`
        : actor1
            ? actor1.actor_name
            : "Unknown";

    // Format date
    const eventDate = new Date(event.event_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    // Format location
    const locationParts = [event.admin3, event.admin2, event.admin1].filter(Boolean);
    const locationDisplay = locationParts.join(", ") || event.location || "Unknown";

    // Highlight search terms in text
    const highlightText = (text: string, search: string) => {
        if (!search.trim()) return text;

        const keywords = search.split(',').map(k => k.trim()).filter(k => k);
        if (keywords.length === 0) return text;

        // Create a regex pattern that matches any of the keywords (case-insensitive)
        const pattern = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        const regex = new RegExp(`(${pattern})`, 'gi');

        const parts = text.split(regex);

        return (
            <>
                {parts.map((part, index) => {
                    const isMatch = keywords.some(k =>
                        part.toLowerCase() === k.toLowerCase()
                    );
                    return isMatch ? (
                        <mark
                            key={index}
                            className="bg-yellow-200 font-semibold text-gray-900 dark:bg-yellow-500 dark:text-gray-900"
                        >
                            {part}
                        </mark>
                    ) : (
                        <span key={index}>{part}</span>
                    );
                })}
            </>
        );
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{eventDate}</span>
                        <span className="text-gray-400">•</span>
                        <span className="font-mono text-xs">{event.event_id_cnty}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            {event.event_type}
                        </span>
                        {event.sub_event_type && (
                            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                {event.sub_event_type}
                            </span>
                        )}
                        {event.civilian_targeting && (
                            <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                <AlertTriangle className="h-3 w-3" />
                                Civilian Targeting
                            </span>
                        )}
                    </div>
                </div>

                {/* Fatalities Badge */}
                {event.fatalities > 0 && (
                    <div className="flex flex-col items-center rounded-lg bg-red-50 px-4 py-2 dark:bg-red-900/20">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {event.fatalities}
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400">
                            {event.fatalities === 1 ? "Fatality" : "Fatalities"}
                        </div>
                    </div>
                )}
            </div>

            {/* Notes - Increased font size and with highlighting */}
            <div className="mb-4">
                <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    {highlightText(event.notes, searchText)}
                </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid gap-3 border-t border-gray-200 pt-4 dark:border-gray-700 sm:grid-cols-2">
                {/* Location */}
                <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                    <div className="flex-1">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Location
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white">
                            {locationDisplay}
                        </div>
                        {event.latitude && event.longitude && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {Number(event.latitude).toFixed(4)}, {Number(event.longitude).toFixed(4)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actors */}
                <div className="flex items-start gap-2">
                    <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                    <div className="flex-1">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Actors
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white">
                            {actorsDisplay}
                        </div>
                        {associatedActors.length > 0 && (
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Associated: {associatedActors.map((a) => a.actor_name).join(", ")}
                            </div>
                        )}
                    </div>
                </div>

                {/* Interaction */}
                <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                    <div className="flex-1">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Interaction
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white">
                            {event.interaction_title || `Code ${event.interaction_code}`}
                        </div>
                    </div>
                </div>

                {/* Population Affected */}
                {event.population_best > 0 && (
                    <div className="flex items-start gap-2">
                        <Globe className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                        <div className="flex-1">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Population Affected
                            </div>
                            <div className="text-sm text-gray-900 dark:text-white">
                                {event.population_best.toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tags */}
            {event.tags && (
                <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Tags
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {event.tags.split(";").filter(Boolean).map((tag, index) => (
                            <span
                                key={index}
                                className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            >
                                {tag.trim()}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Sources */}
            {event.sources.length > 0 && (
                <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Sources ({event.sources.length})
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        {event.sources.map((s) => s.source_name).join("; ")}
                    </div>
                </div>
            )}
        </div>
    );
}
