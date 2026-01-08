/**
 * Person Summary Card Component
 * Modern, minimalist card displaying person summary with icons
 */

import type { Person } from '../../types/person';

interface PersonSummaryCardProps {
    person: Person;
    onClick: () => void;
}

export const PersonSummaryCard = ({ person, onClick }: PersonSummaryCardProps) => {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div
            onClick={onClick}
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer overflow-hidden"
        >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-700 dark:to-blue-750 px-5 py-4 border-b border-gray-500 dark:border-gray-700">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        {/* Name */}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-1">
                            {person.name || 'Unknown'}
                        </h3>
                        {/* Position */}
                        {person.position_name && (
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">
                                    {person.position_name}
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Arrow icon */}
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className="px-5 py-4 space-y-3">
                {/* NRC and Blood Group */}
                <div className="grid grid-cols-2 gap-3">
                    {person.nrc_no && (
                        <div className="flex items-start space-x-2">
                            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">NRC</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{person.nrc_no}</p>
                            </div>
                        </div>
                    )}
                    {person.blood_group && (
                        <div className="flex items-start space-x-2">
                            <svg className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Blood</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{person.blood_group}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Religion and Race */}
                <div className="grid grid-cols-2 gap-3">
                    {person.religion && (
                        <div className="flex items-start space-x-2">
                            <svg className="w-4 h-4 text-purple-500 dark:text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Religion</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{person.religion}</p>
                            </div>
                        </div>
                    )}
                    {person.race && (
                        <div className="flex items-start space-x-2">
                            <svg className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Race</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{person.race}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Ministry and Department */}
                <div className="space-y-2">
                    {person.ministry && (
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p className="text-xs text-gray-700 dark:text-gray-300 truncate">{person.ministry}</p>
                        </div>
                    )}
                    {person.department && (
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <p className="text-xs text-gray-700 dark:text-gray-300 truncate">{person.department}</p>
                        </div>
                    )}
                </div>

                {/* Footer with dates and badges */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-wrap gap-2">
                        {/* SAC Badge */}
                        {person.sac && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                SAC
                            </span>
                        )}
                        {/* Punishment Badge */}
                        {person.punishments && person.punishments.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {person.punishments.length}
                            </span>
                        )}
                    </div>
                    {/* Appointment Date */}
                    {formatDate(person.appointment_date) && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(person.appointment_date)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
