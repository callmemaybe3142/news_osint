/**
 * Search by Ministry Page
 * Search for people by ministry and department with pagination
 */

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import { ministryStorage } from '../utils/ministryStorage';
import type { MinistryStructureData, Person, SearchResponse } from '../types/person';
import { MinistryDepartmentFilter } from '../components/person/MinistryDepartmentFilter';
import { PersonSummaryCard } from '../components/person/PersonSummaryCard';
import { PersonDetailsModal } from '../components/person/PersonDetailsModal';
import { PersonSummarySkeletonGrid } from '../components/person/PersonSummaryCardSkeleton';
import { ScrollToTopButton } from '../components/common/ScrollToTopButton';

export const SearchMinistryPage = () => {
    const navigate = useNavigate();
    const [ministryData, setMinistryData] = useState<MinistryStructureData | null>(null);
    const [loadingMinistryData, setLoadingMinistryData] = useState(true);
    const [selectedMinistry, setSelectedMinistry] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
    const [searchResults, setSearchResults] = useState<Person[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalResults, setTotalResults] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const LIMIT = 30;

    // Load ministry structure from sessionStorage or fetch
    useEffect(() => {
        const loadMinistryData = async () => {
            // Try sessionStorage first
            const cached = ministryStorage.get();
            if (cached) {
                setMinistryData(cached);
                setLoadingMinistryData(false);
                return;
            }

            // Fetch from API if not cached
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/person/ministry-structure`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch ministry structure');
                }

                const data = await response.json();
                setMinistryData(data);
                ministryStorage.save(data);
            } catch (err) {
                console.error('Failed to load ministry data:', err);
                setError('Failed to load ministry data');
            } finally {
                setLoadingMinistryData(false);
            }
        };

        loadMinistryData();
    }, []);

    // Search for people
    const handleSearch = async (loadMore = false) => {
        if (!selectedMinistry) return;

        // Set appropriate loading state
        if (loadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }
        setError(null);

        const currentOffset = loadMore ? offset : 0;

        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                ministry_name: selectedMinistry,
                offset: currentOffset.toString(),
                limit: LIMIT.toString()
            });

            if (selectedDepartment) {
                params.append('department_id', selectedDepartment.toString());
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/leaked-people')}
                            className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-smooth"
                        >
                            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Search by Ministry</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {totalResults > 0 ? `Found ${totalResults} people` : 'Find people by ministry affiliation'}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Filter Component */}
                    {loadingMinistryData ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading ministries...</span>
                            </div>
                        </div>
                    ) : ministryData ? (
                        <MinistryDepartmentFilter
                            ministries={ministryData.ministries}
                            selectedMinistry={selectedMinistry}
                            selectedDepartment={selectedDepartment}
                            onMinistryChange={setSelectedMinistry}
                            onDepartmentChange={setSelectedDepartment}
                            onSearch={() => handleSearch(false)}
                        />
                    ) : null}

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
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
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

                    {/* Empty State */}
                    {!loading && searchResults.length === 0 && selectedMinistry && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No people found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Try selecting a different ministry or department
                            </p>
                        </div>
                    )}

                    {/* Initial State */}
                    {!loading && searchResults.length === 0 && !selectedMinistry && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                            <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Start Your Search
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Select a ministry and optionally a department to find people
                            </p>
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
