/**
 * Dashboard Page Component
 */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const DashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navigationCards = [
        {
            title: 'Raw News',
            description: 'View all collected news from Telegram channels',
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
            ),
            gradient: 'from-blue-500 to-indigo-600',
            bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
            borderColor: 'border-blue-100 dark:border-blue-800',
            route: '/raw-news'
        },
        {
            title: 'Cleaned News',
            description: 'View filtered and processed news articles',
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            gradient: 'from-green-500 to-emerald-600',
            bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            borderColor: 'border-green-100 dark:border-green-800',
            route: '/cleaned-news'
        },
        {
            title: 'Saved News',
            description: 'Access your bookmarked and saved articles',
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            ),
            gradient: 'from-purple-500 to-pink-600',
            bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
            borderColor: 'border-purple-100 dark:border-purple-800',
            route: '/saved-news'
        },
        {
            title: 'Settings',
            description: 'Configure your preferences and account',
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            gradient: 'from-orange-500 to-red-600',
            bgGradient: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
            borderColor: 'border-orange-100 dark:border-orange-800',
            route: '/settings'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">News Viewer</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Welcome, {user?.username}</p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-smooth"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-fade-in">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h2>
                        <p className="text-gray-600 dark:text-gray-400">Select a section to get started</p>
                    </div>

                    {/* Navigation Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {navigationCards.map((card, index) => (
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
                </div>
            </main>
        </div>
    );
};
