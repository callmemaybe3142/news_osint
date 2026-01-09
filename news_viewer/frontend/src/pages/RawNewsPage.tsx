/**
 * Raw News Page - Display raw messages with Telegram-like UI
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { API_ENDPOINTS } from '../config/api';
import type { NewsResponse, Channel } from '../types/news';
import { MessageCard, Pagination, FilterModal, type NewsFilters } from '../components/news';
import { ScrollToTopButton } from '../components/common/ScrollToTopButton';

export const RawNewsPage = () => {
    const { token } = useAuth();
    const { showToast } = useToast();

    const [newsData, setNewsData] = useState<NewsResponse | null>(null);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const [filters, setFilters] = useState<NewsFilters>({
        channel_id: null,
        category: null,
        date_from: null,
        date_to: null,
        search_text: null,
        search_operator: 'AND'
    });

    // Fetch channels
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.CHANNELS, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setChannels(data);
                }
            } catch {
                showToast('Failed to load channels', 'error');
            }
        };

        fetchChannels();
    }, [token, showToast]);

    // Fetch news
    useEffect(() => {
        const fetchNews = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    page_size: '30',
                });

                if (filters.channel_id) params.append('channel_id', filters.channel_id.toString());
                if (filters.category) params.append('category', filters.category);
                if (filters.date_from) params.append('date_from', filters.date_from);
                if (filters.date_to) params.append('date_to', filters.date_to);
                if (filters.search_text) {
                    params.append('search_text', filters.search_text);
                    params.append('search_operator', filters.search_operator);
                }

                const response = await fetch(`${API_ENDPOINTS.RAW_NEWS}?${params}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data: NewsResponse = await response.json();
                    setNewsData(data);
                } else {
                    showToast('Failed to load news', 'error');
                }
            } catch {
                showToast('An error occurred while loading news', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNews();
    }, [token, currentPage, filters, showToast]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleApplyFilters = (newFilters: NewsFilters) => {
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Count active filters (exclude search_operator as it's always set)
    const activeFilterCount = Object.entries(filters)
        .filter(([key, value]) => key !== 'search_operator' && value !== null)
        .length;

    return (
        <div className="min-h-screen overflow-x-hidden">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Raw News</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {newsData ? `${newsData.pagination.total} messages` : 'Loading...'}
                                {activeFilterCount > 0 && ` • ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
                            </p>
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setIsFilterModalOpen(true)}
                            className="relative flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-smooth"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span>Filter</span>
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
                        </div>
                    </div>
                ) : newsData && newsData.messages.length > 0 ? (
                    <>
                        {/* Messages List */}
                        <div className="space-y-4 animate-fade-in">
                            {newsData.messages.map((message) => (
                                <MessageCard
                                    key={message.id}
                                    message={message}
                                    searchTerms={filters.search_text}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            pagination={newsData.pagination}
                            onPageChange={handlePageChange}
                        />
                    </>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No Messages Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {activeFilterCount > 0
                                ? 'No messages match your current filters'
                                : 'No messages available'}
                        </p>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={() => handleApplyFilters({
                                    channel_id: null,
                                    category: null,
                                    date_from: null,
                                    date_to: null,
                                    search_text: null,
                                    search_operator: 'OR'
                                })}
                                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-smooth"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
            </main>

            {/* Filter Modal */}
            <FilterModal
                key={isFilterModalOpen ? 'open' : 'closed'} // Force remount when modal opens to reset state
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={handleApplyFilters}
                channels={channels}
                currentFilters={filters}
            />

            {/* Scroll to Top Button */}
            <ScrollToTopButton />
        </div>
    );
};
