import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/products/v1`;

export interface Product {
    _id?: string; // MongoDB ID to match ProductCard interface
    id?: string; // Keep for backward compatibility
    name: string;
    type: string; // Make required
    sku: string;
    image_url?: string; // Frontend uses this
    imageUrl?: string; // API returns this
    description: string; // Make required
    quantity: number;
    price: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductData {
    name: string;
    type: string;
    sku: string;
    image_url: string;
    description: string; // Required
    quantity: number;
    price: number;
}

export interface UpdateProductData {
    name?: string;
    type?: string;
    sku?: string;
    image_url?: string; // Match the API field name
    description?: string;
    quantity?: number;
    price?: number;
}

// Add interceptor to handle token expiration
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('userData');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const useCreateProduct = async (productData: CreateProductData, token: string): Promise<Product> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/`, productData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const useUpdateProduct = async (id: string, productData: UpdateProductData, token: string): Promise<Product> => {
    try {
        const response = await axios.put(`${API_BASE_URL}/${id}`, productData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const useGetProducts = async (page: number = 1, limit: number = 10): Promise<Product[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/`, {
            params: { page, limit },
        });

        // Map API response to frontend format
        const products = response.data.data.map((product: any) => ({
            ...product,
            _id: product.id, // Map id to _id
            image_url: product.imageUrl, // Map imageUrl to image_url
        }));

        return products;
    } catch (error: any) {
        console.error('Get products API error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch products';
        throw new Error(errorMessage);
    }
};

export const useCheckout = async (productId: string, quantity: number, token: string): Promise<Product> => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/checkout`,
            { productId, quantity },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.data.data;
    } catch (error: any) {
        console.error('Checkout API error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Checkout failed';
        throw new Error(errorMessage);
    }
};

export const useDeleteProduct = async (id: string, token: string): Promise<Product> => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data; // Return the deleted product data
    } catch (error: any) {
        console.error('Delete product API error:', error);
        let errorMessage = 'Failed to delete product';

        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};
