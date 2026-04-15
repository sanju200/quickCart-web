import { Storage as AsyncStorage } from './storage.service';

/**
 * Core Auth Utilities to avoid circular dependencies
 */

export const getAuthToken = async () => {
    try {
        return await AsyncStorage.getItem('authToken');
    } catch (error) {
        return null;
    }
};

export const logoutUser = async () => {
    try {
        await AsyncStorage.multiRemove(['authToken', 'userData']);
        localStorage.clear(); // Clear all localStorage for a safe side
    } catch (error) {
        console.error('Error during logout:', error);
    }
};

export const handleUnauthorized = async () => {
    await logoutUser();
    // Use window.location to ensure a hard redirect and clean state
    if (window.location.pathname !== '/login') {
        window.location.replace('/login');
    }
};
