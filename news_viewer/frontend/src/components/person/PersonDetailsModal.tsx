/**
 * Person Details Modal Component
 * Modern, minimalist modal with grouped data and single copy-to-clipboard
 */

import { useEffect, useState, useCallback } from 'react';
import type { PersonDetails } from '../../types/person';
import API_BASE_URL from '../../config/api';

interface PersonDetailsModalProps {
    personId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const PersonDetailsModal = ({ personId, isOpen, onClose }: PersonDetailsModalProps) => {
    const [person, setPerson] = useState<PersonDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fetchPersonDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/person/${personId}/details`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch person details');
            }

            const data = await response.json();
            setPerson(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [personId]);

    useEffect(() => {
        if (isOpen && personId) {
            fetchPersonDetails();
        }
    }, [isOpen, personId, fetchPersonDetails]);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const copyAllToClipboard = async () => {
        if (!person) return;

        const data = [
            `=== ${person.name} ===`,
            '',
            '📋 BASIC INFORMATION',
            `Name: ${person.name || 'N/A'}`,
            `NRC: ${person.nrc_no || 'N/A'}`,
            `Blood Group: ${person.blood_group || 'N/A'}`,
            `Religion: ${person.religion || 'N/A'}`,
            `Race: ${person.race || 'N/A'}`,
            `SAC Member: ${person.sac ? 'Yes' : 'No'}`,
            '',
            '👨‍👩‍👧‍👦 FAMILY',
            `Spouse: ${person.spouse_name || 'N/A'}`,
            `Father: ${person.father_name || 'N/A'}`,
            `Mother: ${person.mother_name || 'N/A'}`,
            '',
            '📅 IMPORTANT DATES',
            `Birth Date: ${formatDate(person.birthdate) || 'N/A'}`,
            `Appointment Date: ${formatDate(person.appointment_date) || 'N/A'}`,
            `Entry Date: ${formatDate(person.entry_date) || 'N/A'}`,
            `Retire Date: ${formatDate(person.retire_date) || 'N/A'}`,
            person.depletion_type ? `Depletion Type: ${person.depletion_type}` : '',
            '',
            '🏛️ MINISTRY & DEPARTMENT',
            `Ministry: ${person.ministry || 'N/A'}`,
            `Department: ${person.department || 'N/A'}`,
            '',
            '💼 POSITIONS',
            ...(person.positions && person.positions.length > 0
                ? person.positions.map(p => `• ${p.name}`)
                : ['None']),
            '',
            '⚠️ PUNISHMENTS',
            ...(person.punishments && person.punishments.length > 0
                ? person.punishments.map(p => `• ${p}`)
                : ['None']),
            '',
            '🏠 ADDRESSES',
            ...(person.addresses && person.addresses.length > 0
                ? person.addresses.map(a => `• ${a.address}${a.permanent ? ' (Permanent)' : ''}`)
                : ['None']),
            '',
            '🎓 EDUCATION',
            ...(person.educations && person.educations.length > 0
                ? person.educations.map(e => `• ${e}`)
                : ['None']),
            '',
            '🌍 COUNTRIES',
            ...(person.countries && person.countries.length > 0
                ? person.countries.map(c => `• ${c}`)
                : ['None']),
            '',
            '📚 TRAININGS',
            ...(person.trainings && person.trainings.length > 0
                ? person.trainings.map(t =>
                    `• ${t.course || 'Unknown'} (${formatDate(t.start_date)} - ${formatDate(t.end_date)})${t.location ? ` - ${t.location}` : ''}${t.is_international ? ' [International]' : ''}`
                )
                : ['None'])
        ].filter(line => line !== '').join('\n');

        try {
            await navigator.clipboard.writeText(data);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between z-10">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white">Person Details</h2>
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* Copy All Button */}
                            {person && (
                                <button
                                    onClick={copyAllToClipboard}
                                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center space-x-2 transition-colors"
                                    title="Copy all data to clipboard"
                                >
                                    {copied ? (
                                        <>
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm font-medium text-white">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm font-medium text-white">Copy All</span>
                                        </>
                                    )}
                                </button>
                            )}
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                            >
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <p className="text-red-800 dark:text-red-200">{error}</p>
                            </div>
                        ) : person ? (
                            <div className="space-y-6">
                                {/* Name Header */}
                                <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {person.name}
                                    </h3>
                                    {person.positions && person.positions.length > 0 && (
                                        <p className="text-blue-600 dark:text-blue-400 font-medium">
                                            {person.positions[0].name}
                                        </p>
                                    )}
                                </div>

                                {/* Two Column Layout */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        {/* Basic Information */}
                                        <Section title="Basic Information" icon={
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        }>
                                            <InfoRow label="NRC" value={person.nrc_no} />
                                            <InfoRow label="Blood Group" value={person.blood_group} />
                                            <InfoRow label="Religion" value={person.religion} />
                                            <InfoRow label="Race" value={person.race} />
                                            <InfoRow label="SAC Member" value={person.sac ? 'Yes' : 'No'} />
                                        </Section>

                                        {/* Family Information */}
                                        {(person.spouse_name || person.father_name || person.mother_name) && (
                                            <Section title="Family" icon={
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            }>
                                                {person.spouse_name && <InfoRow label="Spouse" value={person.spouse_name} />}
                                                {person.father_name && <InfoRow label="Father" value={person.father_name} />}
                                                {person.mother_name && <InfoRow label="Mother" value={person.mother_name} />}
                                            </Section>
                                        )}

                                        {/* Important Dates */}
                                        <Section title="Important Dates" icon={
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        }>
                                            <InfoRow label="Birth Date" value={formatDate(person.birthdate)} />
                                            <InfoRow label="Appointment" value={formatDate(person.appointment_date)} />
                                            <InfoRow label="Entry Date" value={formatDate(person.entry_date)} />
                                            <InfoRow label="Retire Date" value={formatDate(person.retire_date)} />
                                            {person.depletion_type && <InfoRow label="Depletion Type" value={person.depletion_type} />}
                                        </Section>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        {/* Ministry & Department */}
                                        <Section title="Ministry & Department" icon={
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        }>
                                            <InfoRow label="Ministry" value={person.ministry} />
                                            <InfoRow label="Department" value={person.department} />
                                        </Section>

                                        {/* Positions */}
                                        {person.positions && person.positions.length > 0 && (
                                            <Section title="Positions" icon={
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            }>
                                                <div className="space-y-2">
                                                    {person.positions.map((pos, idx) => (
                                                        <div key={idx} className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                            <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                                                            <span className="text-sm text-gray-900 dark:text-white">{pos.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Section>
                                        )}

                                        {/* Punishments */}
                                        {person.punishments && person.punishments.length > 0 && (
                                            <Section title="Punishments" icon={
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            } color="red">
                                                <div className="space-y-2">
                                                    {person.punishments.map((punishment, idx) => (
                                                        <div key={idx} className="flex items-start space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                                            <svg className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="text-sm text-gray-900 dark:text-white">{punishment}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Section>
                                        )}
                                    </div>
                                </div>

                                {/* Full Width Sections */}
                                <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    {/* Addresses */}
                                    {person.addresses && person.addresses.length > 0 && (
                                        <Section title="Addresses" icon={
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        }>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {person.addresses.map((addr, idx) => (
                                                    <div key={idx} className="flex items-start space-x-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                        </svg>
                                                        <div className="flex-1">
                                                            <p className="text-sm text-gray-900 dark:text-white">{addr.address}</p>
                                                            {addr.permanent && (
                                                                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                                                                    Permanent
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Section>
                                    )}

                                    {/* Education */}
                                    {person.educations && person.educations.length > 0 && (
                                        <Section title="Education" icon={
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        }>
                                            <div className="flex flex-wrap gap-2">
                                                {person.educations.map((edu, idx) => (
                                                    <span key={idx} className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm font-medium">
                                                        {edu}
                                                    </span>
                                                ))}
                                            </div>
                                        </Section>
                                    )}

                                    {/* Countries */}
                                    {person.countries && person.countries.length > 0 && (
                                        <Section title="Countries" icon={
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        }>
                                            <div className="flex flex-wrap gap-2">
                                                {person.countries.map((country, idx) => (
                                                    <span key={idx} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-lg text-sm font-medium">
                                                        {country}
                                                    </span>
                                                ))}
                                            </div>
                                        </Section>
                                    )}

                                    {/* Trainings */}
                                    {person.trainings && person.trainings.length > 0 && (
                                        <Section title="Trainings" icon={
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        }>
                                            <div className="space-y-3">
                                                {person.trainings.map((training, idx) => (
                                                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                                {training.course || 'Unknown Course'}
                                                            </h4>
                                                            {training.is_international && (
                                                                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs rounded-full font-medium">
                                                                    International
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <div className="flex items-center space-x-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                <span>{formatDate(training.start_date) || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                                </svg>
                                                                <span>{formatDate(training.end_date) || 'N/A'}</span>
                                                            </div>
                                                            {training.location && (
                                                                <div className="col-span-2 flex items-center space-x-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    </svg>
                                                                    <span>{training.location}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Section>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const Section = ({ title, icon, children, color = 'blue' }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    color?: 'blue' | 'red';
}) => {
    const colorClasses = {
        blue: 'text-blue-600 dark:text-blue-400',
        red: 'text-red-600 dark:text-red-400'
    };

    return (
        <div>
            <div className="flex items-center space-x-2 mb-3">
                <svg className={`w-5 h-5 ${colorClasses[color]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icon}
                </svg>
                <h3 className={`text-sm font-semibold uppercase tracking-wide ${colorClasses[color]}`}>
                    {title}
                </h3>
            </div>
            <div className="ml-7">
                {children}
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => {
    if (!value || value === 'N/A') return null;

    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white text-right">{value}</span>
        </div>
    );
};
