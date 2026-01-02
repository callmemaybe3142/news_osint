/**
 * Raw News Page (Placeholder)
 */
import { useNavigate } from 'react-router-dom';

export const RawNewsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-smooth"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back to Dashboard</span>
                </button>

                {/* Page Content */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 animate-fade-in">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Raw News</h1>
                            <p className="text-gray-600 dark:text-gray-400">All collected news from Telegram channels</p>
                        </div>
                    </div>

                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Coming Soon
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                            This page will display all raw news collected from Telegram channels. Features will be implemented step by step.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
