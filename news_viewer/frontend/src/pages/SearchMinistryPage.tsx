/**
 * Search by Ministry Page
 * Placeholder for ministry search functionality
 */
import { useNavigate } from 'react-router-dom';

export const SearchMinistryPage = () => {
    const navigate = useNavigate();

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
                            <p className="text-sm text-gray-500 dark:text-gray-400">Find people by ministry affiliation</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Search by Ministry
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        This page will contain search functionality for finding people by ministry
                    </p>
                </div>
            </main>
        </div>
    );
};
