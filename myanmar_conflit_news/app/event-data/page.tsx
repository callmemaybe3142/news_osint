"use client";

import { useState, useEffect, Suspense } from "react";
import { Filter, Loader2 } from "lucide-react";
import { EventFilterPanel } from "@/components/events/EventFilterPanel";
import { EventFilterModal } from "@/components/events/EventFilterModal";
import { EventList } from "@/components/events/EventList";
import { EventFilterOptions } from "@/lib/event-types";

function EventDataContent() {
    const [filterOptions, setFilterOptions] = useState<EventFilterOptions>({
        actors: [],
        interactions: [],
        locations: [],
        eventTypes: [],
    });
    const [loadingFilters, setLoadingFilters] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    useEffect(() => {
        async function fetchFilterOptions() {
            // Check session storage first
            const cached = sessionStorage.getItem("event_filter_options");
            if (cached) {
                console.log("Loading filter options from cache");
                try {
                    const parsedData = JSON.parse(cached);
                    // Validate cached data has the required properties
                    if (parsedData.actors && parsedData.interactions && parsedData.locations && parsedData.eventTypes) {
                        setFilterOptions(parsedData);
                        setLoadingFilters(false);
                        return;
                    } else {
                        sessionStorage.removeItem("event_filter_options");
                    }
                } catch (e) {
                    console.error("Error parsing cached data:", e);
                    sessionStorage.removeItem("event_filter_options");
                }
            }

            try {
                console.log("Fetching filter options from API...");
                const response = await fetch("/api/events/options");
                if (!response.ok) throw new Error("Failed to fetch filter options");

                const data = await response.json();
                sessionStorage.setItem("event_filter_options", JSON.stringify(data));
                setFilterOptions(data);
            } catch (error) {
                console.error("Error fetching filter options:", error);
            } finally {
                setLoadingFilters(false);
            }
        }

        fetchFilterOptions();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pt-16 dark:bg-gray-950">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                                Event Data
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                ACLED detailed events with 1 year lag
                            </p>
                        </div>

                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 lg:hidden"
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Desktop Filter Sidebar */}
                    <aside className="hidden w-96 flex-shrink-0 lg:block">
                        <div className="sticky top-24">
                            <EventFilterPanel options={filterOptions} isLoading={loadingFilters} />
                        </div>
                    </aside>

                    {/* Event List */}
                    <main className="flex-1 min-w-0">
                        <Suspense
                            fallback={
                                <div className="flex h-64 items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                                </div>
                            }
                        >
                            <EventList />
                        </Suspense>


                    </main>
                </div>
            </div>

            {/* Mobile Filter Modal */}
            <EventFilterModal
                options={filterOptions}
                isOpen={showMobileFilters}

                onClose={() => setShowMobileFilters(false)}
            />
        </div>
    );
}

export default function EventDataPage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
            }
        >
            <EventDataContent />
        </Suspense>
    );
}
