/**
 * Message Card Component - Telegram-like message display
 */
import { IMAGE_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { useState, useMemo } from 'react';
import type { NewsMessage } from '../../types/news';
import { ImageGallery } from './ImageGallery';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface MessageCardProps {
    message: NewsMessage;
    searchTerms?: string | null;
}

export const MessageCard = ({ message, searchTerms }: MessageCardProps) => {
    const { token } = useAuth();
    const { showToast } = useToast();
    const [showFullImage, setShowFullImage] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isFavorited, setIsFavorited] = useState(message.is_favorited);
    const [isToggling, setIsToggling] = useState(false);
    const [showFullText, setShowFullText] = useState(false);

    const MAX_TEXT_LENGTH = 300; // Characters to show before truncating

    const handleToggleFavorite = async () => {
        if (isToggling) return;
        setIsToggling(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.NEWS_BASE}/${message.id}/favorite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setIsFavorited(data.is_favorited);
                showToast(
                    data.is_favorited ? 'Added to favorites' : 'Removed from favorites',
                    'success'
                );
            } else {
                showToast('Failed to update favorite status', 'error');
            }
        } catch {
            showToast('An error occurred', 'error');
        } finally {
            setIsToggling(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleImageClick = (index: number) => {
        setSelectedImageIndex(index);
        setShowFullImage(true);
    };

    // Parse search terms and create highlighted content
    const processedContent = useMemo(() => {
        if (!message.message_text) return null;

        let textToDisplay = message.message_text;

        // Truncate if needed
        if (textToDisplay.length > MAX_TEXT_LENGTH && !showFullText) {
            textToDisplay = textToDisplay.substring(0, MAX_TEXT_LENGTH) + '...';
        }

        // If no search terms, return plain text for markdown
        if (!searchTerms || searchTerms.trim() === '') {
            return { text: textToDisplay, hasHighlights: false };
        }

        // Parse comma-separated search terms
        const terms = searchTerms
            .split(',')
            .map(term => term.trim())
            .filter(term => term.length > 0);

        if (terms.length === 0) {
            return { text: textToDisplay, hasHighlights: false };
        }

        // Create regex pattern for all terms (case-insensitive)
        const pattern = terms
            .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special chars
            .join('|');

        const regex = new RegExp(`(${pattern})`, 'gi');

        return { text: textToDisplay, hasHighlights: true, regex, terms };
    }, [message.message_text, searchTerms, showFullText]);

    // Custom component to highlight text
    const HighlightedText = ({ children }: { children: React.ReactNode }) => {
        if (!processedContent?.hasHighlights || !processedContent.regex) {
            return <>{children}</>;
        }

        // If children is a string, apply highlighting
        if (typeof children === 'string') {
            const parts = children.split(processedContent.regex);

            return (
                <>
                    {parts.map((part, index) => {
                        // Check if this part matches any search term (case-insensitive)
                        const isMatch = processedContent.terms?.some(term =>
                            part.toLowerCase() === term.toLowerCase()
                        );

                        if (isMatch) {
                            return (
                                <mark
                                    key={index}
                                    className="bg-yellow-300 dark:bg-yellow-600 px-0.5 rounded"
                                >
                                    {part}
                                </mark>
                            );
                        }
                        return <span key={index}>{part}</span>;
                    })}
                </>
            );
        }

        // If children is an array or other React node, recursively process
        return <>{children}</>;
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-smooth p-4 mb-4 border border-gray-200 dark:border-gray-700">
                {/* Channel Header */}
                <div className="flex items-start space-x-3 mb-3">
                    {/* Avatar - spans full height */}
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                            {message.channel_display_name?.charAt(0) || message.channel_name?.charAt(0) || '?'}
                        </span>
                    </div>

                    {/* Channel Info - name, datetime, category */}
                    <div className="flex-1 min-w-0">
                        {/* Channel Name */}
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {message.channel_display_name || message.channel_name}
                        </h3>

                        {/* DateTime */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {formatDate(message.message_datetime)} • {formatTime(message.message_datetime)}
                        </p>

                        {/* Category Chip */}
                        {message.channel_category && (
                            <div className="mt-1.5">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${message.channel_category.toUpperCase().includes('SAC')
                                    ? 'bg-red-600 text-white'
                                    : 'bg-blue-600 text-white'
                                    }`}>
                                    {message.channel_category}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1 flex-shrink-0">
                        {/* Archive/Favorite Button */}
                        <button
                            onClick={handleToggleFavorite}
                            disabled={isToggling}
                            className={`p-2 rounded-full transition-smooth ${isFavorited
                                ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                        >
                            <svg className="w-5 h-5" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </button>

                        {/* Open in Telegram Button */}
                        <a
                            href={`https://t.me/${message.channel_name}/${message.message_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full transition-smooth text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Open in Telegram"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </div>



                {/* Message Text with Search Highlighting */}
                {message.message_text && processedContent && (
                    <div className="mb-3">
                        <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                            <HighlightedText>{processedContent.text}</HighlightedText>
                        </div>
                        {message.message_text.length > MAX_TEXT_LENGTH && (
                            <button
                                onClick={() => setShowFullText(!showFullText)}
                                className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                {showFullText ? 'See Less' : 'See More'}
                            </button>
                        )}
                    </div>
                )}


                {/* Images Grid */}
                {message.images && Array.isArray(message.images) && message.images.length > 0 && (
                    <div className={`grid gap-2 ${message.images.length === 1 ? 'grid-cols-1' :
                        message.images.length === 2 ? 'grid-cols-2' :
                            message.images.length === 3 ? 'grid-cols-3' :
                                'grid-cols-2'
                        }`}>
                        {message.images.slice(0, 4).map((image, index) => (
                            <div
                                key={image.id}
                                className="relative group cursor-pointer overflow-hidden rounded-lg"
                                onClick={() => handleImageClick(index)}
                            >
                                <img
                                    src={`${IMAGE_BASE_URL}/${image.file_path}`}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-smooth"
                                    loading="lazy"
                                />
                                {index === 3 && message.images.length > 4 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-white text-2xl font-bold">
                                            +{message.images.length - 4}
                                        </span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-smooth" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Info */}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>@{message.channel_name}</span>
                    {message.grouped_id && (
                        <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                                <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            Album
                        </span>
                    )}
                </div>
            </div>

            {/* Full Image Modal */}
            {showFullImage && (
                <ImageGallery
                    images={message.images}
                    initialIndex={selectedImageIndex}
                    onClose={() => setShowFullImage(false)}
                />
            )}
        </>
    );
};
