/**
 * Pagination Component
 */
import type { NewsPagination } from '../../types/news';

interface PaginationProps {
    pagination: NewsPagination;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ pagination, onPageChange }: PaginationProps) => {
    const { page, total_pages } = pagination;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        // Reduce visible pages on mobile
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
        const maxVisible = isMobile ? 3 : 7;

        if (total_pages <= maxVisible) {
            for (let i = 1; i <= total_pages; i++) {
                pages.push(i);
            }
        } else {
            if (isMobile) {
                // Mobile: Show only current page and neighbors
                if (page > 1) pages.push(1);
                if (page > 2) pages.push('...');
                if (page > 1 && page < total_pages) pages.push(page);
                if (page < total_pages - 1) pages.push('...');
                if (page < total_pages) pages.push(total_pages);
            } else {
                // Desktop: Show more pages
                if (page <= 4) {
                    for (let i = 1; i <= 5; i++) pages.push(i);
                    pages.push('...');
                    pages.push(total_pages);
                } else if (page >= total_pages - 3) {
                    pages.push(1);
                    pages.push('...');
                    for (let i = total_pages - 4; i <= total_pages; i++) pages.push(i);
                } else {
                    pages.push(1);
                    pages.push('...');
                    for (let i = page - 1; i <= page + 1; i++) pages.push(i);
                    pages.push('...');
                    pages.push(total_pages);
                }
            }
        }

        return pages;
    };

    if (total_pages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap px-4">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth font-medium"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
                {getPageNumbers().map((pageNum, index) => (
                    <button
                        key={index}
                        onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
                        disabled={pageNum === '...'}
                        className={`min-w-[2.5rem] px-3 py-2 rounded-lg transition-smooth text-sm sm:text-base ${pageNum === page
                                ? 'bg-blue-500 text-white font-semibold shadow-md'
                                : pageNum === '...'
                                    ? 'cursor-default text-gray-500 bg-transparent border-0'
                                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        {pageNum}
                    </button>
                ))}
            </div>

            {/* Next Button */}
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === total_pages}
                className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth font-medium"
            >
                <span className="hidden sm:inline">Next</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};
