/**
 * Ministry and Department Filter Component
 * Typeahead dropdowns for filtering by ministry and department
 */

import { useState, useEffect, useMemo } from 'react';
import type { Ministry, Department } from '../../types/person';

interface MinistryDepartmentFilterProps {
    ministries: Ministry[];
    selectedMinistry: string;
    selectedDepartment: number | null;
    onMinistryChange: (ministry: string) => void;
    onDepartmentChange: (departmentId: number | null) => void;
    onSearch: () => void;
}

export const MinistryDepartmentFilter = ({
    ministries,
    selectedMinistry,
    selectedDepartment,
    onMinistryChange,
    onDepartmentChange,
    onSearch
}: MinistryDepartmentFilterProps) => {
    const [ministrySearch, setMinistrySearch] = useState('');
    const [departmentSearch, setDepartmentSearch] = useState('');
    const [showMinistryDropdown, setShowMinistryDropdown] = useState(false);
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

    // Get departments for selected ministry
    const availableDepartments = useMemo(() => {
        if (!selectedMinistry) return [];
        const ministry = ministries.find(m => m.ministry_name === selectedMinistry);
        return ministry?.departments || [];
    }, [selectedMinistry, ministries]);

    // Filter ministries based on search
    const filteredMinistries = useMemo(() => {
        if (!ministrySearch.trim()) return ministries;
        return ministries.filter(m =>
            m.ministry_name.toLowerCase().includes(ministrySearch.toLowerCase())
        );
    }, [ministries, ministrySearch]);

    // Filter departments based on search
    const filteredDepartments = useMemo(() => {
        if (!departmentSearch.trim()) return availableDepartments;
        return availableDepartments.filter(d =>
            d.department_name.toLowerCase().includes(departmentSearch.toLowerCase())
        );
    }, [availableDepartments, departmentSearch]);

    // Reset department when ministry changes
    useEffect(() => {
        if (selectedMinistry) {
            onDepartmentChange(null);
            setDepartmentSearch('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMinistry]); // onDepartmentChange is intentionally omitted as it's a stable callback

    const handleMinistrySelect = (ministry: string) => {
        onMinistryChange(ministry);
        setMinistrySearch(ministry);
        setShowMinistryDropdown(false);
    };

    const handleDepartmentSelect = (dept: Department) => {
        onDepartmentChange(dept.department_id);
        setDepartmentSearch(dept.department_name);
        setShowDepartmentDropdown(false);
    };

    const handleClearMinistry = () => {
        onMinistryChange('');
        setMinistrySearch('');
        onDepartmentChange(null);
        setDepartmentSearch('');
    };

    const handleClearDepartment = () => {
        onDepartmentChange(null);
        setDepartmentSearch('');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Filter by Ministry & Department
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Ministry Typeahead */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ministry
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search ministry..."
                            value={ministrySearch}
                            onChange={(e) => {
                                setMinistrySearch(e.target.value);
                                setShowMinistryDropdown(true);
                            }}
                            onFocus={() => setShowMinistryDropdown(true)}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                        />
                        {selectedMinistry && (
                            <button
                                onClick={handleClearMinistry}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Ministry Dropdown */}
                    {showMinistryDropdown && filteredMinistries.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredMinistries.map((ministry) => (
                                <button
                                    key={ministry.ministry_name}
                                    onClick={() => handleMinistrySelect(ministry.ministry_name)}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-smooth"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-900 dark:text-white">
                                            {ministry.ministry_name}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {ministry.departments.length} depts
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Department Typeahead */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department {!selectedMinistry && <span className="text-gray-400">(Select ministry first)</span>}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={selectedMinistry ? "Search department..." : "Select ministry first"}
                            value={departmentSearch}
                            onChange={(e) => {
                                setDepartmentSearch(e.target.value);
                                setShowDepartmentDropdown(true);
                            }}
                            onFocus={() => setShowDepartmentDropdown(true)}
                            disabled={!selectedMinistry}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        {selectedDepartment && (
                            <button
                                onClick={handleClearDepartment}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Department Dropdown */}
                    {showDepartmentDropdown && selectedMinistry && filteredDepartments.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredDepartments.map((dept) => (
                                <button
                                    key={dept.department_id}
                                    onClick={() => handleDepartmentSelect(dept)}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-smooth"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-900 dark:text-white">
                                            {dept.department_name}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {dept.person_count} people
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Search Button */}
            <button
                onClick={onSearch}
                disabled={!selectedMinistry}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
            >
                <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search People</span>
                </div>
            </button>

            {/* Click outside to close dropdowns */}
            {(showMinistryDropdown || showDepartmentDropdown) && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => {
                        setShowMinistryDropdown(false);
                        setShowDepartmentDropdown(false);
                    }}
                />
            )}
        </div>
    );
};
