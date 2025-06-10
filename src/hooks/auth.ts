import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/auth/v1`;

// Helper to set the Authorization header
const setAuthToken = (token: string | null) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

export const useSignup = async (signupData: Record<string, any>) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/signup`, signupData);
        const { token, user } = response.data.data;
        if (token) {
            localStorage.setItem('jwtToken', token);
            localStorage.setItem('userData', JSON.stringify(user));
            setAuthToken(token);
        }
        return { user, token };
    } catch (error: any) {
        console.error('Signup API error:', error);
        let errorMessage = 'Signup failed';

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

export const useSignin = async (signinData: Record<string, any>) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/signin`, signinData);
        const { token, user } = response.data.data;
        if (token) {
            localStorage.setItem('jwtToken', token);
            localStorage.setItem('userData', JSON.stringify(user));
            setAuthToken(token);
        }
        return { user, token };
    } catch (error: any) {
        console.error('Signin API error:', error);
        let errorMessage = 'Login failed';

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

export const useLogout = async () => {
    try {
        // Try to call logout endpoint
        const response = await axios.post(`${API_BASE_URL}/logout`);
        return response.data;
    } catch (error: any) {
        console.error('Logout API error:', error);
        // Don't throw error for logout - we still want to clear local data
    } finally {
        // Always clear local authentication data
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userData');
        setAuthToken(null);
        // Clear any other auth-related localStorage items if they exist
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
    }
};

// Automatically set token from localStorage on app load
const token = localStorage.getItem('jwtToken');
if (token) {
    setAuthToken(token);
}
