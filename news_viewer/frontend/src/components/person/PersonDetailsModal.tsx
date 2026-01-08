/**
 * Person Details Modal Component
 * Shows complete person information with copy-to-clipboard functionality
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
    const [copiedField, setCopiedField] = useState<string | null>(null);

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

    const copyToClipboard = async (text: string, fieldName: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Person Details</h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
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
                                {/* Basic Information */}
                                <Section title="Basic Information">
                                    <InfoField label="Name" value={person.name} onCopy={copyToClipboard} copiedField={copiedField} />
                                    <InfoField label="NRC No." value={person.nrc_no} onCopy={copyToClipboard} copiedField={copiedField} />
                                    <InfoField label="Blood Group" value={person.blood_group} onCopy={copyToClipboard} copiedField={copiedField} />
                                    <InfoField label="Religion" value={person.religion} onCopy={copyToClipboard} copiedField={copiedField} />
                                    <InfoField label="Race" value={person.race} onCopy={copyToClipboard} copiedField={copiedField} />
                                    <InfoField label="SAC Member" value={person.sac ? 'Yes' : 'No'} onCopy={copyToClipboard} copiedField={copiedField} />
                                </Section>

                                {/* Family Information */}
                                {(person.spouse_name || person.father_name || person.mother_name) && (
                                    <Section title="Family Information">
                                        {person.spouse_name && <InfoField label="Spouse" value={person.spouse_name} onCopy={copyToClipboard} copiedField={copiedField} />}
                                        {person.father_name && <InfoField label="Father" value={person.father_name} onCopy={copyToClipboard} copiedField={copiedField} />}
                                        {person.mother_name && <InfoField label="Mother" value={person.mother_name} onCopy={copyToClipboard} copiedField={copiedField} />}
                                    </Section>
                                )}

                                {/* Dates */}
                                <Section title="Important Dates">
                                    <InfoField label="Birth Date" value={formatDate(person.birthdate)} onCopy={copyToClipboard} copiedField={copiedField} />
                                    <InfoField label="Appointment Date" value={formatDate(person.appointment_date)} onCopy={copyToClipboard} copiedField={copiedField} />
                                    <InfoField label="Entry Date" value={formatDate(person.entry_date)} onCopy={copyToClipboard} copiedField={copiedField} />
                                    <InfoField label="Retire Date" value={formatDate(person.retire_date)} onCopy={copyToClipboard} copiedField={copiedField} />
                                    {person.depletion_type && <InfoField label="Depletion Type" value={person.depletion_type} onCopy={copyToClipboard} copiedField={copiedField} />}
                                </Section>

                                {/* Ministry & Department */}
                                <Section title="Ministry & Department">
                                    <InfoField label="Ministry" value={person.ministry} onCopy={copyToClipboard} copiedField={copiedField} />
                                    <InfoField label="Department" value={person.department} onCopy={copyToClipboard} copiedField={copiedField} />
                                </Section>

                                {/* Positions */}
                                {person.positions && person.positions.length > 0 && (
                                    <Section title="Positions">
                                        <div className="space-y-2">
                                            {person.positions.map((pos, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                    <div>
                                                        <span className="font-medium text-gray-900 dark:text-white">{pos.name}</span>
                                                        {pos.rank !== null && (
                                                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                                                (Rank: {pos.rank})
                                                            </span>
                                                        )}
                                                    </div>
                                                    <CopyButton
                                                        onClick={() => copyToClipboard(pos.name, `position-${idx}`)}
                                                        isCopied={copiedField === `position-${idx}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Punishments */}
                                {person.punishments && person.punishments.length > 0 && (
                                    <Section title="Punishments" titleColor="text-red-600 dark:text-red-400">
                                        <div className="space-y-2">
                                            {person.punishments.map((punishment, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                                    <span className="text-gray-900 dark:text-white">{punishment}</span>
                                                    <CopyButton
                                                        onClick={() => copyToClipboard(punishment, `punishment-${idx}`)}
                                                        isCopied={copiedField === `punishment-${idx}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Addresses */}
                                {person.addresses && person.addresses.length > 0 && (
                                    <Section title="Addresses">
                                        <div className="space-y-2">
                                            {person.addresses.map((addr, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                    <div className="flex-1">
                                                        <span className="text-gray-900 dark:text-white">{addr.address}</span>
                                                        {addr.permanent && (
                                                            <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                                                                Permanent
                                                            </span>
                                                        )}
                                                    </div>
                                                    <CopyButton
                                                        onClick={() => copyToClipboard(addr.address, `address-${idx}`)}
                                                        isCopied={copiedField === `address-${idx}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Education */}
                                {person.educations && person.educations.length > 0 && (
                                    <Section title="Education">
                                        <div className="flex flex-wrap gap-2">
                                            {person.educations.map((edu, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
                                                    {edu}
                                                </span>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Countries */}
                                {person.countries && person.countries.length > 0 && (
                                    <Section title="Countries">
                                        <div className="flex flex-wrap gap-2">
                                            {person.countries.map((country, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                                                    {country}
                                                </span>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Trainings */}
                                {person.trainings && person.trainings.length > 0 && (
                                    <Section title="Trainings">
                                        <div className="space-y-3">
                                            {person.trainings.map((training, idx) => (
                                                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                                                {training.course || 'Unknown Course'}
                                                            </h4>
                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                <div>
                                                                    <span className="text-gray-500 dark:text-gray-400">Start: </span>
                                                                    <span className="text-gray-700 dark:text-gray-300">{formatDate(training.start_date)}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500 dark:text-gray-400">End: </span>
                                                                    <span className="text-gray-700 dark:text-gray-300">{formatDate(training.end_date)}</span>
                                                                </div>
                                                                {training.location && (
                                                                    <div className="col-span-2">
                                                                        <span className="text-gray-500 dark:text-gray-400">Location: </span>
                                                                        <span className="text-gray-700 dark:text-gray-300">{training.location}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {training.is_international && (
                                                                <span className="inline-block mt-2 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs rounded-full">
                                                                    International
                                                                </span>
                                                            )}
                                                        </div>
                                                        <CopyButton
                                                            onClick={() => copyToClipboard(
                                                                `${training.course} - ${training.location} (${formatDate(training.start_date)} to ${formatDate(training.end_date)})`,
                                                                `training-${idx}`
                                                            )}
                                                            isCopied={copiedField === `training-${idx}`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const Section = ({ title, titleColor = "text-gray-900 dark:text-white", children }: { title: string; titleColor?: string; children: React.ReactNode }) => (
    <div>
        <h3 className={`text-lg font-semibold ${titleColor} mb-3 flex items-center`}>
            {title}
        </h3>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

const InfoField = ({
    label,
    value,
    onCopy,
    copiedField
}: {
    label: string;
    value: string | null;
    onCopy: (text: string, field: string) => void;
    copiedField: string | null;
}) => {
    if (!value || value === 'N/A') return null;

    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{label}: </span>
                <span className="font-medium text-gray-900 dark:text-white">{value}</span>
            </div>
            <CopyButton
                onClick={() => onCopy(value, label)}
                isCopied={copiedField === label}
            />
        </div>
    );
};

const CopyButton = ({ onClick, isCopied }: { onClick: () => void; isCopied: boolean }) => (
    <button
        onClick={onClick}
        className="ml-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        title="Copy to clipboard"
    >
        {isCopied ? (
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        )}
    </button>
);
