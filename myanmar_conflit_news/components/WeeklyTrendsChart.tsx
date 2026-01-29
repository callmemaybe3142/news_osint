"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { WeeklyTrend } from "@/lib/types";
import { formatWeek } from "@/lib/utils";

interface WeeklyTrendsChartProps {
    data: WeeklyTrend[];
}

export function WeeklyTrendsChart({ data }: WeeklyTrendsChartProps) {
    const chartData = data.map((item) => ({
        week: formatWeek(item.week),
        Events: item.events,
        Fatalities: item.fatalities,
    }));

    return (
        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                Weekly Trends (Last 12 Weeks)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                        dataKey="week"
                        tick={{ fontSize: 12, fontWeight: "bold" }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            border: "none",
                            borderRadius: "8px",
                            color: "white",
                        }}
                    />
                    <Legend />
                    <Bar dataKey="Events" fill="#6c58ffff" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Fatalities" fill="#f44040ff" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
