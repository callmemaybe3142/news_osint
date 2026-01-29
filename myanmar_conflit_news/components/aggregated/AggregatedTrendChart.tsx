"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { AggregatedChartData } from "@/lib/types";

interface AggregatedTrendChartProps {
    data: AggregatedChartData[];
    filters?: {
        admin1?: string;
        eventType?: string;
        subEventType?: string;
        startDate?: string;
        endDate?: string;
    };
}

export function AggregatedTrendChart({ data, filters }: AggregatedTrendChartProps) {
    // Generate dynamic title based on filters
    const generateTitle = () => {
        const parts: string[] = [];

        // Add event type if filtered
        if (filters?.eventType) {
            parts.push(filters.eventType);
            if (filters.subEventType) {
                parts.push(`(${filters.subEventType})`);
            }
        }

        // Add region if filtered
        if (filters?.admin1) {
            parts.push(`in ${filters.admin1}`);
        }

        // Format date range
        const formatDate = (dateStr: string) => {
            if (!dateStr) return "";
            const [year, month] = dateStr.split("-");
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
        };

        const currentYear = new Date().getFullYear();
        const defaultStart = "2021-01-01";
        const defaultEnd = `${currentYear}-12-31`;

        const startDate = filters?.startDate || defaultStart;
        const endDate = filters?.endDate || defaultEnd;

        // Only show date range if it's not the default
        if (startDate !== defaultStart || endDate !== defaultEnd) {
            parts.push(`(${formatDate(startDate)} - ${formatDate(endDate)})`);
        }

        // Build the final title
        if (parts.length === 0) {
            return "Trend Analysis - All Events (2021 to Present)";
        }

        return `Trend Analysis - ${parts.join(" ")}`;
    };

    if (data.length === 0) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center bg-white p-6 shadow-sm sm:rounded-2xl dark:bg-gray-800">
                <p className="text-gray-500 dark:text-gray-400">No data available for the selected filters.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6 dark:bg-gray-800">
            <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                {generateTitle()}
            </h3>
            <div className="h-[400px] w-full overflow-x-auto">
                <div className="min-w-[600px]">
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                            data={data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    border: "none",
                                }}
                                labelStyle={{ color: "#374151", fontWeight: "bold" }}
                            />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="events"
                                name="Events"
                                stroke="#2563eb"
                                strokeWidth={2}
                                activeDot={{ r: 8 }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="fatalities"
                                name="Fatalities"
                                stroke="#dc2626"
                                strokeWidth={2}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
