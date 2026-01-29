"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { EventTypeStats } from "@/lib/types";

interface EventTypeDistributionProps {
    data: EventTypeStats[];
}

const COLORS = [
    "#dc2626", // red-600
    "#ea580c", // orange-600
    "#65a30d", // lime-600
    "#16a34a", // green-600
    "#0d9488", // teal-600
    "#0891b2", // cyan-600
    "#0284c7", // sky-600
];

export function EventTypeDistribution({ data }: EventTypeDistributionProps) {
    const chartData = data.map((item) => ({
        name: item.event_type,
        value: item.events,
    }));

    return (
        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                Event Type Distribution
            </h3>
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent = 0 }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(229, 209, 209, 0.8)",
                            border: "none",
                            borderRadius: "8px",
                            color: "white",

                        }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
