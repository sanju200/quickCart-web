import { getUserData } from './authentication.service';
import { Product } from './product.service';
import { apiFetch } from './api.utility';

const BASE_URL = '';
const API_URL = `${BASE_URL}/cart`;

// Cache promises to prevent duplicate calls
let cartPromise: { [key: string]: Promise<CartItem[]> } = {};

export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    product?: Product;
}

export interface Cart {
    items: CartItem[];
    totalAmount: number;
}

export async function handleCartQuantityChange(productId: string, newQuantity: number) {
    if (newQuantity <= 0) {
        return await removeFromCart(productId);
    } else {
        return await updateCartQuantity(productId, newQuantity);
    }
}

export const updateCartQuantity = async (productId: string, quantity: number) => {
    try {
        if (!productId) throw new Error('Cannot update item: productId is missing');
        const user = await getUserData();
        if (!user || !user.id) throw new Error('User not logged in');

        const url = `${API_URL}/${user.id}/update/${productId}`;
        console.log(`[CartService] Updating item: ${url} with quantity: ${quantity}`);

        const response = await apiFetch(url, {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to update item quantity (Status: ${response.status})`);
        }
        return await response.json();
    } catch (error: any) {
        if (error.message === 'Unauthorized') throw error;
        console.error('Error updating cart quantity:', error);
        throw error;
    }
};

export const getCart = async (): Promise<CartItem[]> => {
    const user = await getUserData();
    if (!user || !user.id) return [];

    const cacheKey = user.id;
    if (cartPromise[cacheKey]) return cartPromise[cacheKey];

    cartPromise[cacheKey] = (async () => {
        try {
            const response = await apiFetch(`${API_URL}/${user.id}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch cart (Status: ${response.status})`);
            }
            const data = await response.json();
            const items = Array.isArray(data) ? data : data.items || [];

            return items.map((item: any) => ({
                ...item,
                productId: item.productId || item.product?.id || item.product?._id || item.id || item._id
            }));
        } catch (error: any) {
            if (error.message === 'Unauthorized') return [];
            console.error('Error fetching cart:', error);
            delete cartPromise[cacheKey];
            throw error;
        } finally {
            // Keep the promise in cache for a short period to handle rapid sequential calls
            setTimeout(() => {
                delete cartPromise[cacheKey];
            }, 1000);
        }
    })();

    return cartPromise[cacheKey];
};

export const addToCart = async (productId: string, quantity: number = 1) => {
    try {
        const user = await getUserData();
        if (!user || !user.id) throw new Error('User not logged in');

        const response = await apiFetch(`${API_URL}/${user.id}/add`, {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to add item to cart');
        }
        return await response.json();
    } catch (error: any) {
        if (error.message === 'Unauthorized') throw error;
        console.error('Error adding to cart:', error);
        throw error;
    }
};

export const removeFromCart = async (productId: string) => {
    try {
        if (!productId) throw new Error('Cannot remove item: productId is missing');
        const user = await getUserData();
        if (!user || !user.id) throw new Error('User not logged in');

        const url = `${API_URL}/${user.id}/remove/${productId}`;
        console.log(`[CartService] Removing item: ${url}`);

        const response = await apiFetch(url, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to remove item from cart (Status: ${response.status})`);
        }
        return await response.json();
    } catch (error: any) {
        if (error.message === 'Unauthorized') throw error;
        console.error('Error removing from cart:', error);
        throw error;
    }
};

export const clearCart = async () => {
    try {
        const user = await getUserData();
        if (!user || !user.id) throw new Error('User not logged in');

        const url = `${API_URL}/${user.id}/clear`;

        const response = await apiFetch(url, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to clear cart (Status: ${response.status})`);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : {};
    } catch (error: any) {
        if (error.message === 'Unauthorized') throw error;
        console.error('Error clearing cart:', error);
        throw error;
    }
};
