import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import BACKEND_URL from '../../Config';
import { toast } from 'react-toastify';

const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp < Math.floor(Date.now() / 1000);
    } catch {
        return true;
    }
};

export const useAuthStore = create(
    persist(
        (set, get) => ({
            token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
            user: null,
            isLoggedIn: false,
            loadingAuth: true,
            authChecked: false,

            getAuthHeaders: () => {
                const token = get().token;
                return {
                    headers: { Authorization: `Bearer ${token}` },
                };
            },

            setToken: (newToken) => {
                if (newToken) {
                    localStorage.setItem('token', newToken);
                    set({ token: newToken });
                } else {
                    localStorage.removeItem('token');
                    set({ token: null });
                }
            },

            checkAuth: async () => {
                const token = get().token;

                // 1. Initial check: Trust local token if valid
                if (token && !isTokenExpired(token)) {
                    // Optimistically set logged in to remove "Checking session..." delay
                    set({ loadingAuth: false, authChecked: true, isLoggedIn: true });
                } else {
                    // Invalid/No token: clear everything
                    localStorage.removeItem('token');
                    set({ token: null, user: null, isLoggedIn: false, loadingAuth: false, authChecked: true });
                    return false;
                }

                // 2. Background Verification
                try {
                    const res = await axios.get(`${BACKEND_URL}/api/auth/profile`, get().getAuthHeaders());
                    if (res.data?.user) {
                        // Confirmed valid: just update user data, keep logged in
                        set({ user: res.data.user });
                        return true;
                    } else {
                        // Valid token format but rejected by server (e.g. revoked/user deleted)
                        console.warn('Token valid but user not found/rejected by server');
                        get().logout();
                        return false;
                    }
                } catch (err) {
                    console.error('Profile fetch failed in background', err);

                    // If 401, it means token is definitely invalid (expired on server etc)
                    if (err.response?.status === 401) {
                        toast.error('Session expired. Please log in again.');
                        get().logout();
                        return false;
                    }

                    // If network error (no response), we might choose to keep them logged in 
                    // or force logout depending on security reqs. 
                    // For now, let's keep them logged in (offline mode support conceptually) 
                    // unless it's explicitly an auth error.
                    return true;
                }
            },

            logout: () => {
                localStorage.removeItem('token');
                if (window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect();
                set({ token: null, user: null, isLoggedIn: false });
                window.dispatchEvent(new Event('logout'));
            },

            loginSuccess: async (token, user) => {
                localStorage.setItem('token', token);
                set({ token, user, isLoggedIn: true, loadingAuth: false, authChecked: true });
            }
        }),
        {
            name: 'auth-storage', // unique name
            partialize: (state) => ({ token: state.token, user: state.user }),
        }
    )
);
