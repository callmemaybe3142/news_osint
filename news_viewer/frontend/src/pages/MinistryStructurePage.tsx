/**
 * Ministry Structure Page
 * Displays hierarchical ministry-department structure with search
 */
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import API_BASE_URL from '../config/api';
import { ministryStorage } from '../utils/ministryStorage';
import type { MinistryStructureData, Ministry, Department } from '../types/person';
import { ScrollToTopButton } from '../components/common/ScrollToTopButton';

export const MinistryStructurePage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<MinistryStructureData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedMinistries, setExpandedMinistries] = useState<Set<string>>(new Set());

    // Fetch ministry structure data (with sessionStorage caching)
    useEffect(() => {
        const fetchData = async () => {
            // Try to get from sessionStorage first
            const cachedData = ministryStorage.get();
            if (cachedData) {
                setData(cachedData);
                setLoading(false);
                return;
            }

            // If not in cache, fetch from API
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

                const result = await response.json();
                setData(result);
                // Save to sessionStorage for future use
                ministryStorage.save(result);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter ministries and departments based on search query
    const filteredData = useMemo(() => {
        if (!data || !searchQuery.trim()) {
            return data;
        }

        const query = searchQuery.toLowerCase();
        const filtered = data.ministries
            .map(ministry => {
                // Check if ministry name matches
                const ministryMatches = ministry.ministry_name.toLowerCase().includes(query);

                // Filter departments that match
                const matchingDepartments = ministry.departments.filter((dept: Department) =>
                    dept.department_name.toLowerCase().includes(query)
                );

                // Include ministry if it matches or has matching departments
                if (ministryMatches || matchingDepartments.length > 0) {
                    return {
                        ...ministry,
                        departments: ministryMatches ? ministry.departments : matchingDepartments
                    };
                }
                return null;
            })
            .filter((m): m is Ministry => m !== null);

        return {
            ...data,
            ministries: filtered,
            total_ministries: filtered.length,
            total_departments: filtered.reduce((sum, m) => sum + m.departments.length, 0)
        };
    }, [data, searchQuery]);

    // Toggle ministry expansion
    const toggleMinistry = (ministryName: string) => {
        const newExpanded = new Set(expandedMinistries);
        if (newExpanded.has(ministryName)) {
            newExpanded.delete(ministryName);
        } else {
            newExpanded.add(ministryName);
        }
        setExpandedMinistries(newExpanded);
    };

    // Expand all ministries
    const expandAll = () => {
        if (filteredData) {
            setExpandedMinistries(new Set(filteredData.ministries.map(m => m.ministry_name)));
        }
    };

    // Collapse all ministries
    const collapseAll = () => {
        setExpandedMinistries(new Set());
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
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ministry Structure</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {filteredData && `${filteredData.total_ministries} Ministries • ${filteredData.total_departments} Departments`}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Search and Controls */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Search Box */}
                                <div className="flex-1">
                                    <div className="relative">
                                        <svg
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Search ministries or departments..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Expand/Collapse Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={expandAll}
                                        className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-smooth text-sm font-medium"
                                    >
                                        Expand All
                                    </button>
                                    <button
                                        onClick={collapseAll}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-smooth text-sm font-medium"
                                    >
                                        Collapse All
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Ministry Tree */}
                        <div className="space-y-3">
                            {filteredData?.ministries.map((ministry) => (
                                <div
                                    key={ministry.ministry_name}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                                >
                                    {/* Ministry Header */}
                                    <button
                                        onClick={() => toggleMinistry(ministry.ministry_name)}
                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-smooth"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {ministry.ministry_name}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {ministry.departments.length} Departments • {ministry.total_people} People
                                                </p>
                                            </div>
                                        </div>
                                        <svg
                                            className={`w-6 h-6 text-gray-400 transition-transform ${expandedMinistries.has(ministry.ministry_name) ? 'transform rotate-180' : ''
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Departments List */}
                                    {expandedMinistries.has(ministry.ministry_name) && (
                                        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                            {ministry.departments.length > 0 ? (
                                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {ministry.departments.map((dept: Department) => (
                                                        <div
                                                            key={dept.department_id}
                                                            className="px-6 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-smooth"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                                    {dept.department_name}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                                                                {dept.person_count} {dept.person_count === 1 ? 'person' : 'people'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                    No departments found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {filteredData?.ministries.length === 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No results found
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Try adjusting your search query
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Scroll to Top Button */}
            <ScrollToTopButton />
        </div>
    );
};
