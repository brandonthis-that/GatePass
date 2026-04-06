import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    const login = async (username, password) => {
        try {
            const response = await api.post('/api/auth/token/', { username, password });
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            const profileResponse = await api.get('/api/users/me/', {
                headers: { Authorization: `Bearer ${access}` }
            });

            setUser(profileResponse.data);
            return profileResponse.data;
        } catch (error) {
            console.error("Login Error", error);
            throw error;
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await api.get('/api/users/me/');
                    setUser(response.data);
                } catch (error) {
                    console.error("Failed to load user profile", error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
