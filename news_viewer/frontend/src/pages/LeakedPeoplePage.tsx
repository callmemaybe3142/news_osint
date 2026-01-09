/**
 * Leaked People Main Page
 * Navigation hub for person-related searches
 * Requires role 2 or higher (Admin access)
 */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AccessDenied } from '../components/common/AccessDenied';

export const LeakedPeoplePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Check if user has sufficient role (2 or higher for Admin access)
    const hasAccess = user && user.role >= 2;

    const searchCards = [
        {
            title: 'Search by Name/NRC',
            description: 'Search for individuals by name or NRC number',
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
            gradient: 'from-blue-500 to-cyan-600',
            bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
            borderColor: 'border-blue-100 dark:border-blue-800',
            route: '/leaked-people/search-person'
        },
        {
            title: 'Search by Ministry',
            description: 'Find people by their ministry affiliation',
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            gradient: 'from-green-500 to-emerald-600',
            bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            borderColor: 'border-green-100 dark:border-green-800',
            route: '/leaked-people/search-ministry'
        },
        {
            title: 'Search by Position',
            description: 'Search for people by their job position or rank',
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            gradient: 'from-purple-500 to-pink-600',
            bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
            borderColor: 'border-purple-100 dark:border-purple-800',
            route: '/leaked-people/search-position'
        },
        {
            title: 'Ministry Structure',
            description: 'View organizational structure of ministries and departments',
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            gradient: 'from-orange-500 to-red-600',
            bgGradient: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
            borderColor: 'border-orange-100 dark:border-orange-800',
            route: '/leaked-people/ministry-structure'
        }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto animate-fade-in">
                {/* Access Denied Warning */}
                {!hasAccess && (
                    <AccessDenied
                        requiredRole={1}
                        resourceName="The Person Database"
                    />
                )}

                {/* Welcome Section - Only show if user has access */}
                {hasAccess && (
                    <>
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leaked People</h2>
                            <p className="text-gray-600 dark:text-gray-400">Choose a search method to find personnel information</p>
                        </div>

                        {/* Search Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {searchCards.map((card, index) => (
                                <button
                                    key={index}
                                    onClick={() => navigate(card.route)}
                                    className={`bg-gradient-to-br ${card.bgGradient} rounded-2xl p-6 border ${card.borderColor} shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-smooth text-left group`}
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-smooth`}>
                                            {card.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-smooth">
                                                {card.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                {card.description}
                                            </p>
                                        </div>
                                        <svg
                                            className="w-6 h-6 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-smooth"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
