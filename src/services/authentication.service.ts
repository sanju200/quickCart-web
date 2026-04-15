import { Storage as AsyncStorage } from './storage.service';
import { apiFetch } from './api.utility';
import { getAuthToken, logoutUser, handleUnauthorized } from './auth.utility';

export { getAuthToken, logoutUser, handleUnauthorized };

const BASE_URL = '';
const API_URL = `${BASE_URL}/auth`;

export interface Address {
    type: 'Home' | 'Work' | 'Other';
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isSelected: boolean;
}

export interface UserData {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: 'USER' | 'ADMIN' | 'INVENTORY_MANAGER' | 'LOGISTICS_PARTNER' | 'DELIVERY_PARTNER';
    addresses?: Address[];
}


export const loginUser = async (email: string, password: string) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        await AsyncStorage.setItem('authToken', data.access_token || data.token);

        const normalizeAddresses = (addr: any): Address[] => {
            if (Array.isArray(addr)) return addr;
            if (typeof addr === 'string' && addr.trim()) {
                return [{
                    type: 'Home',
                    streetAddress: addr,
                    city: '',
                    state: '',
                    postalCode: '',
                    country: '',
                    isSelected: true
                }];
            }
            return [];
        };

        const userData: UserData = {
            id: data.id || data.user?.id || '',
            name: data.name || data.user?.name || 
                  (data.firstName || data.user?.firstName ? `${data.firstName || data.user?.firstName} ${data.lastName || data.user?.lastName || ''}`.trim() : email.split('@')[0]),
            email: data.email || data.user?.email || email,
            phone: data.phone || data.user?.phone || '',
            role: data.role || data.user?.role || 'USER',
            addresses: normalizeAddresses(data.addresses || data.user?.addresses || data.address || data.user?.address),
        };

        await saveUserData(userData);
        return userData;
    } catch (error: any) {
        throw new Error(error.message || 'An error occurred during login');
    }
};

export const signupUser = async (name: string, email: string, password: string) => {
    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }
        return data;
    } catch (error: any) {
        throw new Error(error.message || 'An error occurred during signup');
    }
};

export const saveUserData = async (userData: UserData) => {
    try {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
        console.error('Error saving user data:', error);
    }
};

export const getUserData = async (): Promise<UserData | null> => {
    try {
        const data = await AsyncStorage.getItem('userData');
        const user = data ? JSON.parse(data) : null;
        
        // Normalize name field from firstName/lastName if missing in stored data
        if (user && !user.name) {
            if (user.firstName || user.lastName) {
                user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            } else if (user.email) {
                user.name = user.email.split('@')[0];
            } else {
                user.name = 'User';
            }
        }

        if (user && typeof user.addresses === 'string') {
            user.addresses = [{
                type: 'Home',
                streetAddress: user.addresses,
                city: '',
                state: '',
                postalCode: '',
                country: '',
                isSelected: true
            }];
        }
        return user;
    } catch (error) {
        return null;
    }
};

export const updateProfile = async (userData: UserData) => {
    try {
        const { id, ...rest } = userData;
        // Clean the payload to strictly follow backend expectations
        const updateData: any = {};
        if (rest.addresses) updateData.addresses = rest.addresses;
        if (rest.phone) updateData.phone = rest.phone;

        console.log('[DEBUG] Updating profile with payload:', updateData);

        // Using centralized apiFetch instead of raw fetch
        const response = await apiFetch(`${BASE_URL}/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Update failed');
        }

        const normalizeAddresses = (addr: any): Address[] => {
            if (Array.isArray(addr)) return addr;
            if (typeof addr === 'string' && addr.trim()) {
                return [{
                    type: 'Home',
                    streetAddress: addr,
                    city: '',
                    state: '',
                    postalCode: '',
                    country: '',
                    isSelected: true
                }];
            }
            return userData.addresses || [];
        };

        const updatedUser: UserData = {
            id: data.id || userData.id,
            name: data.name || (data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : userData.name),
            email: data.email || userData.email,
            phone: data.phone || userData.phone,
            role: data.role || userData.role,
            addresses: normalizeAddresses(data.addresses || data.address),
        };

        await saveUserData(updatedUser);
        return updatedUser;
    } catch (error: any) {
        if (error.message === 'Unauthorized') throw error;
        throw new Error(error.message || 'An error occurred during update');
    }
};

export const getMe = async (): Promise<UserData | null> => {
    try {
        // Using centralized apiFetch instead of raw fetch
        const response = await apiFetch(`${BASE_URL}/users/me`, {
            method: 'GET',
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        
        // Normalize name field from firstName/lastName if missing
        if (!data.name && (data.firstName || data.lastName)) {
            data.name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        } else if (!data.name) {
            data.name = data.email ? data.email.split('@')[0] : 'User';
        }
        
        return data;
    } catch (error: any) {
        if (error.message === 'Unauthorized') return null;
        console.error('Error fetching user profile:', error);
        return null;
    }
};
