/**
 * Filter Modal Component for Raw News
 */
import { useState } from 'react';
import type { Channel } from '../../types/news';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: NewsFilters) => void;
    channels: Channel[];
    currentFilters: NewsFilters;
}

export interface NewsFilters {
    channel_id: number | null;
    category: string | null;
    date_from: string | null;
    date_to: string | null;
    search_text: string | null;
}

export const FilterModal = ({ isOpen, onClose, onApply, channels, currentFilters }: FilterModalProps) => {
    // Initialize local state from currentFilters
    // The parent component will reset this by using a key prop when needed
    const [filters, setFilters] = useState<NewsFilters>(currentFilters);

    // Get unique categories from channels (with safety check)
    const categories = Array.from(new Set((channels || []).map(c => c.category).filter(Boolean))) as string[];

    const handleQuickDateFilter = (period: 'today' | 'yesterday' | 'week' | 'month') => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let dateFrom: Date;

        switch (period) {
            case 'today':
                dateFrom = today;
                break;
            case 'yesterday':
                dateFrom = new Date(today);
                dateFrom.setDate(dateFrom.getDate() - 1);
                break;
            case 'week':
                dateFrom = new Date(today);
                dateFrom.setDate(dateFrom.getDate() - 7);
                break;
            case 'month':
                dateFrom = new Date(today);
                dateFrom.setMonth(dateFrom.getMonth() - 1);
                break;
        }

        setFilters({
            ...filters,
            date_from: dateFrom.toISOString().split('T')[0],
            date_to: today.toISOString().split('T')[0]
        });
    };

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters: NewsFilters = {
            channel_id: null,
            category: null,
            date_from: null,
            date_to: null,
            search_text: null
        };
        setFilters(resetFilters);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Filter News</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-smooth"
                    >
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Channel Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Channel
                        </label>
                        <select
                            value={filters.channel_id || ''}
                            onChange={(e) => setFilters({ ...filters, channel_id: e.target.value ? Number(e.target.value) : null })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                        >
                            <option value="">All Channels</option>
                            {(channels || []).map((channel) => (
                                <option key={channel.id} value={channel.id}>
                                    {channel.display_name || channel.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category
                        </label>
                        <select
                            value={filters.category || ''}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value || null })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Quick Date Filters */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Quick Date Filter
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { label: 'Today', value: 'today' as const },
                                { label: 'Yesterday', value: 'yesterday' as const },
                                { label: 'This Week', value: 'week' as const },
                                { label: 'This Month', value: 'month' as const }
                            ].map((period) => (
                                <button
                                    key={period.value}
                                    onClick={() => handleQuickDateFilter(period.value)}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-smooth text-sm font-medium"
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Date Range */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                From Date
                            </label>
                            <input
                                type="date"
                                value={filters.date_from || ''}
                                onChange={(e) => setFilters({ ...filters, date_from: e.target.value || null })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                To Date
                            </label>
                            <input
                                type="date"
                                value={filters.date_to || ''}
                                onChange={(e) => setFilters({ ...filters, date_to: e.target.value || null })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                            />
                        </div>
                    </div>

                    {/* Search Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Search in Messages
                        </label>
                        <input
                            type="text"
                            value={filters.search_text || ''}
                            onChange={(e) => setFilters({ ...filters, search_text: e.target.value || null })}
                            placeholder="Search for text in messages..."
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Supports partial text matching (e.g., searching for "တရုတ်" will find all messages containing that text)
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleReset}
                        className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-smooth font-medium"
                    >
                        Reset
                    </button>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-smooth font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-smooth font-medium"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
