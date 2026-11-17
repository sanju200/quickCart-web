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

export const normalizeAddresses = (addr: any): Address[] => {
    if (Array.isArray(addr)) {
        if (addr.length === 0) return [];
        const hasSelected = addr.some(a => a && a.isSelected);
        return addr.map((a, idx) => ({
            type: a?.type || 'Home',
            streetAddress: a?.streetAddress || a?.street || a?.address || '',
            city: a?.city || '',
            state: a?.state || '',
            postalCode: a?.postalCode || a?.zipCode || a?.zip || '',
            country: a?.country || 'India',
            isSelected: hasSelected ? !!a?.isSelected : idx === 0,
        }));
    }
    if (typeof addr === 'string' && addr.trim()) {
        return [{
            type: 'Home',
            streetAddress: addr,
            city: '',
            state: '',
            postalCode: '',
            country: 'India',
            isSelected: true
        }];
    }
    return [];
};

export const formatUserName = (user: any, fallbackEmail: string = ''): string => {
    if (user?.name && typeof user.name === 'string' && user.name.trim()) {
        return user.name.trim();
    }
    if (user?.firstName || user?.lastName) {
        return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    const emailToUse = user?.email || fallbackEmail;
    if (emailToUse && emailToUse.includes('@')) {
        const prefix = emailToUse.split('@')[0];
        return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return 'User';
};

export const loginUser = async (email: string, password: string): Promise<UserData> => {
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

        const token = data.access_token || data.token || data.jwt;
        if (token) {
            await AsyncStorage.setItem('authToken', token);
        }

        const rawUser = data.user || data.data || data;

        let userData: UserData = {
            id: rawUser.id || rawUser._id || data.id || '',
            name: formatUserName(rawUser, email),
            email: rawUser.email || email,
            phone: rawUser.phone || '',
            role: rawUser.role || 'USER',
            addresses: normalizeAddresses(rawUser.addresses || rawUser.address || data.addresses),
        };

        // Attempt to fetch fresh profile from backend if available
        try {
            const serverProfile = await getMe();
            if (serverProfile) {
                userData = {
                    ...userData,
                    ...serverProfile,
                    addresses: serverProfile.addresses?.length ? serverProfile.addresses : userData.addresses,
                };
            }
        } catch {
            // Ignore if getMe is not available on backend
        }

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
        if (!data) return null;
        const user = JSON.parse(data);
        if (!user) return null;
        
        user.name = formatUserName(user, user.email || '');
        user.addresses = normalizeAddresses(user.addresses || user.address);
        return user;
    } catch (error) {
        return null;
    }
};

export const updateProfile = async (userData: UserData): Promise<UserData> => {
    try {
        const { id, ...rest } = userData;
        const updateData: any = {};
        if (rest.name) updateData.name = rest.name;
        if (rest.phone) updateData.phone = rest.phone;
        if (rest.addresses) updateData.addresses = rest.addresses;

        let serverData: any = null;
        try {
            const response = await apiFetch(`${BASE_URL}/users/${id || 'me'}`, {
                method: 'PUT',
                body: JSON.stringify(updateData),
            });
            if (response.ok) {
                serverData = await response.json();
            }
        } catch (apiErr) {
            console.warn('API update failed, persisting locally:', apiErr);
        }

        const rawUser = serverData?.user || serverData?.data || serverData || userData;

        const updatedUser: UserData = {
            id: rawUser.id || rawUser._id || userData.id,
            name: formatUserName(rawUser, userData.email),
            email: rawUser.email || userData.email,
            phone: rawUser.phone !== undefined ? rawUser.phone : userData.phone,
            role: rawUser.role || userData.role,
            addresses: normalizeAddresses(rawUser.addresses || rawUser.address || userData.addresses),
        };

        await saveUserData(updatedUser);
        return updatedUser;
    } catch (error: any) {
        if (error.message === 'Unauthorized') throw error;
        // Resilient fallback: save locally so user doesn't lose edits
        await saveUserData(userData);
        return userData;
    }
};

export const getMe = async (): Promise<UserData | null> => {
    try {
        let response = await apiFetch(`${BASE_URL}/users/me`, {
            method: 'GET',
        });

        // Fallback to /auth/me if /users/me is not found
        if (!response.ok && response.status === 404) {
            response = await apiFetch(`${API_URL}/me`, {
                method: 'GET',
            });
        }

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const rawUser = data.user || data.data || data;
        
        const userData: UserData = {
            id: rawUser.id || rawUser._id || '',
            name: formatUserName(rawUser, rawUser.email || ''),
            email: rawUser.email || '',
            phone: rawUser.phone || '',
            role: rawUser.role || 'USER',
            addresses: normalizeAddresses(rawUser.addresses || rawUser.address),
        };
        
        await saveUserData(userData);
        return userData;
    } catch (error: any) {
        if (error.message === 'Unauthorized') return null;
        console.error('Error fetching user profile:', error);
        return null;
    }
};
