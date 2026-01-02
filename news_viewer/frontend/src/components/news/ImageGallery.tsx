/**
 * Image Gallery Component - Full-screen image viewer
 */
import { IMAGE_BASE_URL } from '../../config/api';
import { useState, useEffect, useCallback } from 'react';
import type { NewsImage } from '../../types/news';

interface ImageGalleryProps {
    images: NewsImage[];
    initialIndex: number;
    onClose: () => void;
}

export const ImageGallery = ({ images, initialIndex, onClose }: ImageGalleryProps) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handlePrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }, [images.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }, [images.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, handlePrevious, handleNext]);

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-smooth"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Image Counter */}
            {images.length > 1 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 bg-white/10 rounded-full">
                    <span className="text-white text-sm font-medium">
                        {currentIndex + 1} / {images.length}
                    </span>
                </div>
            )}

            {/* Previous Button */}
            {images.length > 1 && (
                <button
                    onClick={handlePrevious}
                    className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-smooth"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {/* Image */}
            <div className="max-w-7xl max-h-screen p-4 flex items-center justify-center">
                <img
                    src={`${IMAGE_BASE_URL}/${images[currentIndex].file_path}`}
                    alt={`Image ${currentIndex + 1}`}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                />
            </div>

            {/* Next Button */}
            {images.length > 1 && (
                <button
                    onClick={handleNext}
                    className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-smooth"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2 bg-white/10 p-2 rounded-lg max-w-screen-lg overflow-x-auto">
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => setCurrentIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden transition-smooth ${index === currentIndex
                                ? 'ring-2 ring-white scale-110'
                                : 'opacity-60 hover:opacity-100'
                                }`}
                        >
                            <img
                                src={`${IMAGE_BASE_URL}/${image.file_path}`}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
