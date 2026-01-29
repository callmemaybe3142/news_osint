"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Search } from "lucide-react";
import { TypeaheadSelect } from "./TypeaheadSelect";
import { LocationFilter } from "./LocationFilter";
import { EventFilterOptions } from "@/lib/event-types";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

interface EventFilterPanelProps {
    options: EventFilterOptions;
    isLoading?: boolean;
}

export function EventFilterPanel({ options, isLoading = false }: EventFilterPanelProps) {
    const router = useRouter();
    const searchParams = useSearchParams();



    // Filter states
    const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
    const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
    const [actorId, setActorId] = useState(searchParams.get("actorId") || "");
    const [interactionCode, setInteractionCode] = useState(searchParams.get("interactionCode") || "");
    const [admin1, setAdmin1] = useState(searchParams.get("admin1") || "");
    const [admin2, setAdmin2] = useState(searchParams.get("admin2") || "");
    const [admin3, setAdmin3] = useState(searchParams.get("admin3") || "");
    const [eventType, setEventType] = useState(searchParams.get("eventType") || "");
    const [subEventType, setSubEventType] = useState(searchParams.get("subEventType") || "");
    const [searchText, setSearchText] = useState(searchParams.get("searchText") || "");
    const [searchOperator, setSearchOperator] = useState<'and' | 'or'>(
        (searchParams.get("searchOperator") as 'and' | 'or') || 'and'
    );

    // Date picker states
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Apply filters
    const applyFilters = () => {
        const params = new URLSearchParams();
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        if (actorId) params.set("actorId", actorId);
        if (interactionCode) params.set("interactionCode", interactionCode);
        if (admin1) params.set("admin1", admin1);
        if (admin2) params.set("admin2", admin2);
        if (admin3) params.set("admin3", admin3);
        if (eventType) params.set("eventType", eventType);
        if (subEventType) params.set("subEventType", subEventType);
        if (searchText) params.set("searchText", searchText);
        if (searchText) params.set("searchOperator", searchOperator);

        router.push(`/event-data?${params.toString()}`, { scroll: false });
    };

    // Reset filters
    const resetFilters = () => {
        setStartDate("");
        setEndDate("");
        setActorId("");
        setInteractionCode("");
        setAdmin1("");
        setAdmin2("");
        setAdmin3("");
        setEventType("");
        setSubEventType("");
        setSearchText("");
        setSearchOperator("and");
        router.push("/event-data", { scroll: false });
    };

    // Actor options
    const actorOptions = (options.actors || []).map((actor) => ({
        value: actor.actor_id,
        label: actor.actor_name,
    }));

    // Interaction options
    const interactionOptions = (options.interactions || []).map((interaction) => ({
        value: interaction.code.toString(),
        label: `${interaction.code} - ${interaction.title}`,
        sublabel: interaction.title,
    }));

    // Event type options
    const eventTypeOptions = Array.from(
        new Set((options.eventTypes || []).map((et) => et.event_type))
    )
        .sort()
        .map((value) => ({ value, label: value }));

    // Sub-event type options (filtered by event type)
    const subEventTypeOptions = (options.eventTypes || [])
        .filter((et) => !eventType || et.event_type === eventType)
        .map((et) => et.sub_event_type)
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort()
        .map((value) => ({ value, label: value }));

    // Handle event type change
    const handleEventTypeChange = (value: string | number | null) => {
        setEventType(value as string || "");
        // Clear sub-event type if it's not valid for the new event type
        if (value && subEventType) {
            const isValid = options.eventTypes.some(
                (et) => et.event_type === value && et.sub_event_type === subEventType
            );
            if (!isValid) {
                setSubEventType("");
            }
        } else if (!value) {
            setSubEventType("");
        }
    };

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-12rem)] animate-pulse overflow-y-auto rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                <div className="mb-6 h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                            <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-12rem)] overflow-y-auto rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <Filter className="h-5 w-5" />
                Filter Events
            </div>

            <div className="space-y-6">
                {/* Date Range */}
                <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date Range
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Start Date</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={startDate}
                                onClick={() => setShowStartDatePicker(!showStartDatePicker)}
                                readOnly
                                placeholder="Select start date..."
                                className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            {showStartDatePicker && (
                                <div className="absolute z-10 mt-1 rounded-lg border border-gray-300 bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-gray-700">
                                    <DayPicker
                                        mode="single"
                                        selected={startDate ? new Date(startDate) : undefined}
                                        onSelect={(date) => {
                                            setStartDate(date ? format(date, "yyyy-MM-dd") : "");
                                            setShowStartDatePicker(false);
                                        }}
                                    />
                                </div>
                            )}

                        </div>
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">End Date</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={endDate}
                                onClick={() => setShowEndDatePicker(!showEndDatePicker)}
                                readOnly
                                placeholder="Select end date..."
                                className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            {showEndDatePicker && (
                                <div className="absolute z-10 mt-1 rounded-lg border border-gray-300 bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-gray-700">
                                    <DayPicker
                                        mode="single"
                                        selected={endDate ? new Date(endDate) : undefined}
                                        onSelect={(date) => {
                                            setEndDate(date ? format(date, "yyyy-MM-dd") : "");
                                            setShowEndDatePicker(false);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actor Filter */}
                <TypeaheadSelect
                    label="Actor"
                    options={actorOptions}
                    value={actorId ? parseInt(actorId) : null}
                    onChange={(value) => setActorId(value?.toString() || "")}
                    placeholder="Search actor..."
                />

                {/* Interaction Filter */}
                <TypeaheadSelect
                    label="Interaction Type"
                    options={interactionOptions}
                    value={interactionCode}
                    onChange={(value) => setInteractionCode(value?.toString() || "")}
                    placeholder="Search interaction..."
                />

                {/* Location Filter */}
                <div>
                    <div className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Location
                    </div>
                    <LocationFilter
                        locations={options.locations}
                        admin1={admin1}
                        admin2={admin2}
                        admin3={admin3}
                        onAdmin1Change={setAdmin1}
                        onAdmin2Change={setAdmin2}
                        onAdmin3Change={setAdmin3}
                    />
                </div>

                {/* Event Type Filter */}
                <TypeaheadSelect
                    label="Event Type"
                    options={eventTypeOptions}
                    value={eventType}
                    onChange={handleEventTypeChange}
                    placeholder="Select event type..."
                />

                {/* Sub-Event Type Filter */}
                <TypeaheadSelect
                    label="Sub-Event Type"
                    options={subEventTypeOptions}
                    value={subEventType}
                    onChange={(value) => setSubEventType(value as string || "")}
                    placeholder="Select sub-event type..."
                    disabled={!eventType || subEventTypeOptions.length === 0}
                />

                {/* Text Search */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Search Notes
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search keywords (comma-separated)..."
                            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <input
                                type="radio"
                                checked={searchOperator === 'and'}
                                onChange={() => setSearchOperator('and')}
                                className="text-red-600 focus:ring-red-500"
                            />
                            AND
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <input
                                type="radio"
                                checked={searchOperator === 'or'}
                                onChange={() => setSearchOperator('or')}
                                className="text-red-600 focus:ring-red-500"
                            />
                            OR
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <button
                        onClick={resetFilters}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Reset
                    </button>
                    <button
                        onClick={applyFilters}
                        className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}
