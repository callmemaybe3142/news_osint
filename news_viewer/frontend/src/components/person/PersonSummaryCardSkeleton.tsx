/**
 * Person Summary Card Skeleton
 * Loading placeholder for PersonSummaryCard
 */

export const PersonSummaryCardSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            {/* Header with Name and Position */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    {/* Name skeleton */}
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    {/* Position badge skeleton */}
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-32"></div>
                </div>
                {/* Arrow icon skeleton */}
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
                <div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
            </div>

            {/* Department and Ministry */}
            <div className="mb-4 space-y-2">
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
                <div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
            </div>
        </div>
    );
};

/**
 * Grid of skeleton cards
 */
interface PersonSummarySkeletonGridProps {
    count?: number;
}

export const PersonSummarySkeletonGrid = ({ count = 6 }: PersonSummarySkeletonGridProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <PersonSummaryCardSkeleton key={index} />
            ))}
        </div>
    );
};
