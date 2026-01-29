import { Suspense } from "react";
import Link from "next/link";
import { Home, TrendingUp } from "lucide-react";
import { FilterPanel } from "@/components/aggregated/FilterPanel";
import { AggregatedTrendChart } from "@/components/aggregated/AggregatedTrendChart";
import { getAggregatedTrends } from "@/lib/aggregated-service";

export const revalidate = 3600;

export default async function AggregateDataPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;

    const filters = {
        admin1: resolvedSearchParams.admin1,
        eventType: resolvedSearchParams.eventType,
        subEventType: resolvedSearchParams.subEventType,
        startDate: resolvedSearchParams.startDate,
        endDate: resolvedSearchParams.endDate,
    };

    const chartData = await getAggregatedTrends(filters);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">


            {/* About Section */}
            <div className="border-b border-gray-200 mt-16 bg-gradient-to-br from-red-50 to-orange-50 dark:border-gray-800 dark:from-red-950/20 dark:to-orange-950/20">
                <div className="container mx-auto px-4 py-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                                <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    About This Analysis
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                    This page provides comprehensive analysis of ACLED conflict data aggregated by month.
                                    Use the filters below to explore trends by region, event type, and time period.
                                    The data covers events from 2010 onwards, with weekly aggregations providing
                                    detailed insights into conflict patterns, fatalities, and population exposure across Myanmar.
                                    By default, data from 2021 to present is displayed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Filters */}
                <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />}>
                    <FilterPanel />
                </Suspense>

                {/* Charts Section */}
                <div className="mt-8">

                    {/* Full-width container for mobile */}
                    <div className="-mx-4 sm:mx-0">
                        <Suspense fallback={<div className="h-[400px] animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />}>
                            <AggregatedTrendChart data={chartData} filters={filters} />
                        </Suspense>
                    </div>

                    {/* Placeholder for future charts */}
                    <div className="mt-8 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            More charts and visualizations coming soon...
                        </p>
                    </div>

                    {/* Back to Home Button */}
                    <div className="mx-auto mt-12 max-w-4xl">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700"
                        >
                            <Home className="h-5 w-5" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
