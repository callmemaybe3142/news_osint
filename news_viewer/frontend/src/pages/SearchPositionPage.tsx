/**
 * Search Position Page
 * Search for people by position with pagination
 */

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import { positionStorage, type Position, type PositionData } from '../utils/positionStorage';
import type { Person, SearchResponse } from '../types/person';
import { PersonSummaryCard } from '../components/person/PersonSummaryCard';
import { PersonDetailsModal } from '../components/person/PersonDetailsModal';
import { PersonSummarySkeletonGrid } from '../components/person/PersonSummaryCardSkeleton';
import { ScrollToTopButton } from '../components/common/ScrollToTopButton';

export const SearchPositionPage = () => {
    const navigate = useNavigate();
    const [positions, setPositions] = useState<Position[]>([]);
    const [loadingPositions, setLoadingPositions] = useState(true);
    const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
    const [positionSearch, setPositionSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
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

    // Load positions from sessionStorage or fetch
    useEffect(() => {
        const loadPositions = async () => {
            // Try sessionStorage first
            const cached = positionStorage.get();
            if (cached) {
                setPositions(cached.positions);
                setLoadingPositions(false);
                return;
            }

            // Fetch from API if not cached
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/person/positions`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch positions');
                }

                const data: PositionData = await response.json();
                setPositions(data.positions);
                positionStorage.save(data);
            } catch (err) {
                console.error('Failed to load positions:', err);
                setError('Failed to load positions');
            } finally {
                setLoadingPositions(false);
            }
        };

        loadPositions();
    }, []);

    // Filter positions based on search
    const filteredPositions = positions.filter(pos =>
        pos.position_name.toLowerCase().includes(positionSearch.toLowerCase())
    );

    // Get selected position name
    const selectedPositionName = positions.find(p => p.position_id === selectedPosition)?.position_name || '';

    // Search for people
    const handleSearch = async (loadMore = false) => {
        if (!selectedPosition) return;

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
                position_id: selectedPosition.toString(),
                offset: currentOffset.toString(),
                limit: LIMIT.toString()
            });

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

    const handlePositionSelect = (position: Position) => {
        setSelectedPosition(position.position_id);
        setPositionSearch(position.position_name);
        setShowDropdown(false);
    };

    const handleClearPosition = () => {
        setSelectedPosition(null);
        setPositionSearch('');
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
                                    Search by Position
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    Find people by their position
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Position Selector */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Select Position
                        </h2>

                        {loadingPositions ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading positions...</span>
                            </div>
                        ) : (
                            <>
                                {/* Position Typeahead */}
                                <div className="relative mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Position
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search position..."
                                            value={positionSearch}
                                            onChange={(e) => {
                                                setPositionSearch(e.target.value);
                                                setShowDropdown(true);
                                            }}
                                            onFocus={() => setShowDropdown(true)}
                                            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                                        />
                                        {selectedPosition && (
                                            <button
                                                onClick={handleClearPosition}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* Position Dropdown */}
                                    {showDropdown && filteredPositions.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {filteredPositions.map((position) => (
                                                <button
                                                    key={position.position_id}
                                                    onClick={() => handlePositionSelect(position)}
                                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-smooth"
                                                >
                                                    <span className="text-gray-900 dark:text-white">
                                                        {position.position_name}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Search Button */}
                                <button
                                    onClick={() => handleSearch(false)}
                                    disabled={!selectedPosition}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span>Search People</span>
                                    </div>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Click outside to close dropdown */}
                    {showDropdown && (
                        <div
                            className="fixed inset-0 z-0"
                            onClick={() => setShowDropdown(false)}
                        />
                    )}

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
                    {!hasSearched && !loading && !loadingPositions && (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                                Select a Position
                            </h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                Choose a position from the dropdown to find people
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
                                No People Found
                            </h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                No one has the position "{selectedPositionName}"
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
