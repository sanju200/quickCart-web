import { getAuthToken, handleUnauthorized } from './auth.utility';

/**
 * Standardized fetch wrapper that handles:
 * 1. Automatic inclusion of Auth tokens
 * 2. Standardized error handling
 * 3. Automatic logout/redirect on 401 Unauthorized
 */
export const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = await getAuthToken();
    
    const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Handle unauthorized globally
        await handleUnauthorized();
        // Throw a specific error to allow catch blocks to handle it gracefully if needed
        throw new Error('Unauthorized');
    }

    return response;
};
