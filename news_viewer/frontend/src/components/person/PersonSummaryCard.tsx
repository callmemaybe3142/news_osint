/**
 * Person Summary Card Component
 * Displays a summary of person information
 */

import type { Person } from '../../types/person';

interface PersonSummaryCardProps {
    person: Person;
    onClick: () => void;
}

export const PersonSummaryCard = ({ person, onClick }: PersonSummaryCardProps) => {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group"
        >
            {/* Header with Name and Position */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {person.name || 'Unknown'}
                    </h3>
                    {person.position_name && (
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                {person.position_name}
                            </span>
                            {person.position_rank !== null && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Rank: {person.position_rank}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {person.nrc_no && (
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">NRC No.</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{person.nrc_no}</p>
                    </div>
                )}
                {person.blood_group && (
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Blood Group</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{person.blood_group}</p>
                    </div>
                )}
                {person.religion && (
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Religion</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{person.religion}</p>
                    </div>
                )}
                {person.race && (
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Race</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{person.race}</p>
                    </div>
                )}
            </div>

            {/* Department and Ministry */}
            <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                        {person.department || 'Unknown Department'}
                    </span>
                </div>
                {person.ministry && (
                    <div className="flex items-center space-x-2 text-sm mt-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400">
                            {person.ministry}
                        </span>
                    </div>
                )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                {person.birthdate && (
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Birth Date</p>
                        <p className="text-gray-700 dark:text-gray-300">{formatDate(person.birthdate)}</p>
                    </div>
                )}
                {person.appointment_date && (
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Appointment</p>
                        <p className="text-gray-700 dark:text-gray-300">{formatDate(person.appointment_date)}</p>
                    </div>
                )}
            </div>

            {/* Punishments Badge */}
            {person.punishments && person.punishments.length > 0 && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            {person.punishments.length} Punishment{person.punishments.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            )}

            {/* SAC Badge */}
            {person.sac && (
                <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                        SAC Member
                    </span>
                </div>
            )}
        </div>
    );
};
