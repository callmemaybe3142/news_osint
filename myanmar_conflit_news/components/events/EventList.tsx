"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { EventCard } from "./EventCard";
import { PaginatedEvents } from "@/lib/event-types";
import { ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";

export function EventList() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<PaginatedEvents | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    // Handle scroll to top button visibility
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        async function fetchEvents() {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams(searchParams.toString());
                if (!params.has("page")) {
                    params.set("page", "1");
                }

                const response = await fetch(`/api/events?${params.toString()}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch events");
                }

                const result = await response.json();
                setData(result);
            } catch (err) {
                console.error("Error fetching events:", err);
                setError("Failed to load events. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
    }, [searchParams]);

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        window.history.pushState({}, "", `/event-data?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {/* Loading Skeletons */}
                {[...Array(3)].map((_, index) => (
                    <div
                        key={index}
                        className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6"
                    >
                        {/* Header Skeleton */}
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 sm:w-24"></div>
                                    <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700 sm:w-20"></div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700 sm:w-32"></div>
                                    <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700 sm:w-40"></div>
                                </div>
                            </div>
                            <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                        </div>

                        {/* Content Skeleton */}
                        <div className="mb-4 space-y-2">
                            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                        </div>

                        {/* Metadata Skeleton */}
                        <div className="grid gap-3 border-t border-gray-200 pt-4 dark:border-gray-700 sm:grid-cols-2">
                            <div className="h-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="h-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="h-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="h-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/20">
                <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
        );
    }

    if (!data || data.events.length === 0) {
        return (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                <p className="text-gray-600 dark:text-gray-400">
                    No events found matching your filters.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Results Summary */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-semibold">{(currentPage - 1) * data.limit + 1}</span> to{" "}
                    <span className="font-semibold">
                        {Math.min(currentPage * data.limit, data.total)}
                    </span>{" "}
                    of <span className="font-semibold">{data.total.toLocaleString()}</span> events
                </p>
            </div>

            {/* Event Cards */}
            <div className="space-y-4">
                {data.events.map((event) => (
                    <EventCard key={event.event_id} event={event} />
                ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    {/* Previous Button */}
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                        {/* First Page */}
                        {currentPage > 3 && (
                            <>
                                <button
                                    onClick={() => goToPage(1)}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    1
                                </button>
                                {currentPage > 4 && (
                                    <span className="px-2 text-gray-500">...</span>
                                )}
                            </>
                        )}

                        {/* Current Page and Neighbors */}
                        {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                            .filter((page) => {
                                return (
                                    page === currentPage ||
                                    page === currentPage - 1 ||
                                    page === currentPage + 1 ||
                                    page === currentPage - 2 ||
                                    page === currentPage + 2
                                );
                            })
                            .map((page) => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${page === currentPage
                                        ? "border-red-600 bg-red-600 text-white"
                                        : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                        {/* Last Page */}
                        {currentPage < data.totalPages - 2 && (
                            <>
                                {currentPage < data.totalPages - 3 && (
                                    <span className="px-2 text-gray-500">...</span>
                                )}
                                <button
                                    onClick={() => goToPage(data.totalPages)}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    {data.totalPages}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === data.totalPages}
                        className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all hover:bg-red-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="h-6 w-6" />
                </button>
            )}
        </div>
    );
}
