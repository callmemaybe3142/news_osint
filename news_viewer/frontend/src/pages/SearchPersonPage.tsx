/**
 * Search Person Page
 * Search for people by name and/or NRC with pagination
 */

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import API_BASE_URL from '../config/api';
import type { Person, SearchResponse } from '../types/person';
import { PersonSummaryCard } from '../components/person/PersonSummaryCard';
import { PersonDetailsModal } from '../components/person/PersonDetailsModal';
import { PersonSummarySkeletonGrid } from '../components/person/PersonSummaryCardSkeleton';
import { ScrollToTopButton } from '../components/common/ScrollToTopButton';

export const SearchPersonPage = () => {
    const navigate = useNavigate();
    const [nameQuery, setNameQuery] = useState('');
    const [nrcQuery, setNrcQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Person[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalResults, setTotalResults] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const LIMIT = 30;

    // Search for people
    const handleSearch = async (loadMore = false) => {
        // Require at least one search criterion
        if (!nameQuery.trim() && !nrcQuery.trim()) {
            setError('Please enter a name or NRC number to search');
            return;
        }

        // Set appropriate loading state
        if (loadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setHasSearched(true);
        }
        setError(null);

        const currentOffset = loadMore ? offset : 0;

        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                offset: currentOffset.toString(),
                limit: LIMIT.toString()
            });

            if (nameQuery.trim()) {
                params.append('name', nameQuery.trim());
            }

            if (nrcQuery.trim()) {
                params.append('nrc', nrcQuery.trim());
            }

            const response = await fetch(`${API_BASE_URL}/person/search?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to search people');
            }

            const data: SearchResponse = await response.json();

            if (loadMore) {
                setSearchResults(prev => [...prev, ...data.people]);
            } else {
                setSearchResults(data.people);
            }

            setTotalResults(data.total);
            setHasMore(data.has_more);
            setOffset(currentOffset + LIMIT);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            if (loadMore) {
                setLoadingMore(false);
            } else {
                setLoading(false);
            }
        }
    };

    const handleLoadMore = () => {
        handleSearch(true);
    };

    const handlePersonClick = (personId: string) => {
        setSelectedPersonId(personId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPersonId(null);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Search Person
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    Search by name or NRC number
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Search Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Search Criteria
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Name (partial match)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter name..."
                                        value={nameQuery}
                                        onChange={(e) => setNameQuery(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                                    />
                                </div>
                            </div>

                            {/* NRC Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    NRC Number (partial match)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter NRC..."
                                        value={nrcQuery}
                                        onChange={(e) => setNrcQuery(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={() => handleSearch(false)}
                            disabled={!nameQuery.trim() && !nrcQuery.trim()}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span>Search People</span>
                            </div>
                        </button>

                        {/* Hint */}
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                            💡 Enter at least one search criterion. Press Enter to search.
                        </p>
                    </div>

                    {/* Loading Skeleton State */}
                    {loading && (
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                            </div>
                            <PersonSummarySkeletonGrid count={6} />
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    )}

                    {/* Empty State - No Search Yet */}
                    {!hasSearched && !loading && (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                                Start Your Search
                            </h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                Enter a name or NRC number to find people
                            </p>
                        </div>
                    )}

                    {/* Empty State - No Results */}
                    {hasSearched && !loading && searchResults.length === 0 && !error && (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                                No Results Found
                            </h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                Try adjusting your search criteria
                            </p>
                        </div>
                    )}

                    {/* Results */}
                    {searchResults.length > 0 && !loading && (
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Search Results
                                </h2>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing {searchResults.length} of {totalResults}
                                </span>
                            </div>

                            {/* Results Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {searchResults.map((person) => (
                                    <PersonSummaryCard
                                        key={person.id}
                                        person={person}
                                        onClick={() => handlePersonClick(person.id)}
                                    />
                                ))}
                            </div>

                            {/* Load More Button */}
                            {hasMore && (
                                <div className="mt-6 flex justify-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                        {loadingMore ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                                <span>Loading...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <span>Load More</span>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Person Details Modal */}
            {selectedPersonId && (
                <PersonDetailsModal
                    personId={selectedPersonId}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}

            {/* Scroll to Top Button */}
            <ScrollToTopButton />
        </div>
    );
};
