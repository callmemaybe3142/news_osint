/**
 * Ministry Structure Storage Utility
 * Manages sessionStorage for ministry structure data
 */

import { type MinistryStructureData } from '../types/person';

const STORAGE_KEY = 'ministry_structure_data';
const STORAGE_TIMESTAMP_KEY = 'ministry_structure_timestamp';
const CACHE_DURATION = 3000 * 60 * 1000; // 30 minutes

export const ministryStorage = {
    /**
     * Save ministry structure data to sessionStorage
     */
    save: (data: MinistryStructureData): void => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            sessionStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
        } catch (error) {
            console.error('Failed to save ministry structure to sessionStorage:', error);
        }
    },

    /**
     * Get ministry structure data from sessionStorage
     * Returns null if data is expired or doesn't exist
     */
    get: (): MinistryStructureData | null => {
        try {
            const data = sessionStorage.getItem(STORAGE_KEY);
            const timestamp = sessionStorage.getItem(STORAGE_TIMESTAMP_KEY);

            if (!data || !timestamp) {
                return null;
            }

            // Check if data is expired
            const age = Date.now() - parseInt(timestamp);
            if (age > CACHE_DURATION) {
                ministryStorage.clear();
                return null;
            }

            return JSON.parse(data) as MinistryStructureData;
        } catch (error) {
            console.error('Failed to get ministry structure from sessionStorage:', error);
            return null;
        }
    },

    /**
     * Clear ministry structure data from sessionStorage
     */
    clear: (): void => {
        try {
            sessionStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem(STORAGE_TIMESTAMP_KEY);
        } catch (error) {
            console.error('Failed to clear ministry structure from sessionStorage:', error);
        }
    },

    /**
     * Check if cached data exists and is valid
     */
    isValid: (): boolean => {
        const timestamp = sessionStorage.getItem(STORAGE_TIMESTAMP_KEY);
        if (!timestamp) return false;

        const age = Date.now() - parseInt(timestamp);
        return age <= CACHE_DURATION;
    }
};
