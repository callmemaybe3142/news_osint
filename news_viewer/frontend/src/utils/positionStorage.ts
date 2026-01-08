/**
 * Position Storage Utility
 * Manages position data in sessionStorage with expiration
 */

export interface Position {
    position_id: number;
    position_name: string;
    rank: number | null;
}

export interface PositionData {
    positions: Position[];
    total: number;
}

interface StoredPositionData {
    data: PositionData;
    timestamp: number;
}

const STORAGE_KEY = 'position_data';
const CACHE_DURATION = 3000 * 60 * 1000; // 30 minutes in milliseconds

export const positionStorage = {
    /**
     * Save position data to sessionStorage
     */
    save(data: PositionData): void {
        try {
            const stored: StoredPositionData = {
                data,
                timestamp: Date.now()
            };
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        } catch (error) {
            console.error('Failed to save position data to sessionStorage:', error);
        }
    },

    /**
     * Get position data from sessionStorage
     * Returns null if not found or expired
     */
    get(): PositionData | null {
        try {
            const item = sessionStorage.getItem(STORAGE_KEY);
            if (!item) return null;

            const stored: StoredPositionData = JSON.parse(item);
            const now = Date.now();

            // Check if data has expired
            if (now - stored.timestamp > CACHE_DURATION) {
                this.clear();
                return null;
            }

            return stored.data;
        } catch (error) {
            console.error('Failed to get position data from sessionStorage:', error);
            return null;
        }
    },

    /**
     * Clear position data from sessionStorage
     */
    clear(): void {
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear position data from sessionStorage:', error);
        }
    }
};
