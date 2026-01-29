"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterOptions } from "@/lib/types";
import { Filter, Loader2 } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";

export function FilterPanel() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [options, setOptions] = useState<FilterOptions | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    // Filter states
    const [admin1, setAdmin1] = useState(searchParams.get("admin1") || "");
    const [eventType, setEventType] = useState(searchParams.get("eventType") || "");
    const [subEventType, setSubEventType] = useState(searchParams.get("subEventType") || "");
    const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
    const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");

    useEffect(() => {
        async function fetchOptions() {
            // Check session storage
            const cached = sessionStorage.getItem("aggregated_filters");
            if (cached) {
                setOptions(JSON.parse(cached));
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("/api/aggregated/options");
                if (!res.ok) throw new Error("Failed to fetch options");
                const data = await res.json();
                sessionStorage.setItem("aggregated_filters", JSON.stringify(data));
                setOptions(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchOptions();
    }, []);

    // Update URL when filters change
    const applyFilters = () => {
        const params = new URLSearchParams();
        if (admin1) params.set("admin1", admin1);
        if (eventType) params.set("eventType", eventType);
        if (subEventType) params.set("subEventType", subEventType);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        startTransition(() => {
            router.push(`/aggregate-data?${params.toString()}`, { scroll: false });
        });
    };

    // Reset sub-event type when event type changes
    const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEventType(e.target.value);
        setSubEventType("");
    };

    if (loading) return <div className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />;

    const subTypeOptions = options?.eventTypes.find(e => e.type === eventType)?.subTypes || [];

    return (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <Filter className="h-5 w-5" />
                Filter Data
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Admin1 Select */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Region / State
                    </label>
                    <select
                        value={admin1}
                        onChange={(e) => setAdmin1(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">All Regions</option>
                        {options?.admin1.map((region) => (
                            <option key={region} value={region}>
                                {region}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Event Type Select */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Event Type
                    </label>
                    <select
                        value={eventType}
                        onChange={handleEventTypeChange}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">All Event Types</option>
                        {options?.eventTypes.map((et) => (
                            <option key={et.type} value={et.type}>
                                {et.type}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sub Event Type Select */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sub Event Type
                    </label>
                    <select
                        value={subEventType}
                        onChange={(e) => setSubEventType(e.target.value)}
                        disabled={!eventType}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">All Sub Types</option>
                        {subTypeOptions.map((st) => (
                            <option key={st} value={st}>
                                {st}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Range Picker */}
                <div className="md:col-span-2 lg:col-span-3">
                    <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                    />
                </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
                <button
                    onClick={() => {
                        setAdmin1("");
                        setEventType("");
                        setSubEventType("");
                        setStartDate("");
                        setEndDate("");
                        startTransition(() => {
                            router.push("/aggregate-data", { scroll: false });
                        });
                    }}
                    disabled={isPending}
                    className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
                >
                    Reset
                </button>
                <button
                    onClick={applyFilters}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-800"
                >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Apply Filters
                </button>
            </div>
        </div>
    );
}
