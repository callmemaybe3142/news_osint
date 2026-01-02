/**
 * Saved News Page - Display user's favorite messages
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { API_ENDPOINTS } from '../config/api';
import type { NewsResponse } from '../types/news';
import { MessageCard, Pagination } from '../components/news';

export const SavedNewsPage = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const { showToast } = useToast();

    const [newsData, setNewsData] = useState<NewsResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch saved news
    useEffect(() => {
        const fetchNews = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    page_size: '20',
                });

                const response = await fetch(`${API_ENDPOINTS.FAVORITE_NEWS}?${params}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data: NewsResponse = await response.json();
                    setNewsData(data);
                } else {
                    showToast('Failed to load saved news', 'error');
                }
            } catch {
                showToast('An error occurred while loading news', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNews();
    }, [token, currentPage, showToast]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-smooth"
                            >
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Saved News</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {newsData ? `${newsData.pagination.total} saved messages` : 'Loading...'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-600 dark:text-gray-400">Loading saved messages...</p>
                        </div>
                    </div>
                ) : newsData && newsData.messages.length > 0 ? (
                    <>
                        {/* Messages List */}
                        <div className="space-y-4 animate-fade-in">
                            {newsData.messages.map((message) => (
                                <MessageCard key={message.id} message={message} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            pagination={newsData.pagination}
                            onPageChange={handlePageChange}
                        />
                    </>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                            <svg className="w-10 h-10 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No Saved Messages
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Mark messages as favorites to quickly access them here
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};
