import { RegionStats } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface TopRegionsListProps {
    regions: RegionStats[];
}

export function TopRegionsList({ regions }: TopRegionsListProps) {
    const maxEvents = Math.max(...regions.map((r) => r.events));

    return (
        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                Most Affected Regions
            </h3>
            <div className="space-y-4">
                {regions.map((region, index) => {
                    const percentage = (region.events / maxEvents) * 100;
                    return (
                        <div key={region.admin1} className="group">
                            {/* Region header */}
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600 dark:bg-red-900 dark:text-red-300">
                                        {index + 1}
                                    </span>
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {region.admin1}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {formatNumber(region.events)} events
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500 group-hover:from-red-600 group-hover:to-orange-600"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>

                            {/* Additional stats */}
                            <div className="mt-2 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>Fatalities: {formatNumber(region.fatalities)}</span>
                                <span>
                                    Population Exposed:{" "}
                                    {formatNumber(region.population_exposure)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
