/**
 * TypeScript types for news data
 */

export interface NewsImage {
    id: number;
    file_path: string;
    width: number;
    height: number;
}

export interface NewsMessage {
    id: number;
    channel_id: number;
    message_id: number;
    message_text: string | null;
    message_datetime: string;
    has_media: boolean;
    grouped_id: number | null;
    channel_name: string;
    channel_display_name: string;
    images: NewsImage[];
    is_favorited: boolean;
}


export interface NewsPagination {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
}

export interface NewsResponse {
    messages: NewsMessage[];
    pagination: NewsPagination;
}

export interface Channel {
    id: number;
    name: string;
    display_name: string;
    category: string | null;
}
