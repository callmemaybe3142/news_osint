import { LucideIcon } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    iconColor?: string;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
    iconColor = "text-red-500",
}: StatCardProps) {
    const displayValue = typeof value === "number" ? formatNumber(value) : value;

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl dark:from-gray-800 dark:to-gray-900",
                className
            )}
        >
            {/* Background decoration */}
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-red-100 to-orange-100 opacity-20 blur-2xl dark:from-red-900 dark:to-orange-900" />

            <div className="relative">
                {/* Icon */}
                <div className="mb-4 inline-flex rounded-xl bg-white p-3 shadow-md dark:bg-gray-800">
                    <Icon className={cn("h-6 w-6", iconColor)} />
                </div>

                {/* Title */}
                <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {title}
                </h3>

                {/* Value */}
                <div className="mb-2 flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {displayValue}
                    </p>
                    {trend && (
                        <span
                            className={cn(
                                "text-sm font-medium",
                                trend.isPositive
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                            )}
                        >
                            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value).toFixed(1)}%
                        </span>
                    )}
                </div>

                {/* Description */}
                {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
