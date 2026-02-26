import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    // Decode token to get basic info if needed, but we rely on /me for full profile including role
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

    const login = async (username, password) => {
        try {
            const response = await api.post('/api/auth/token/', { username, password });
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // Fetch user profile immediately after getting tokens
            const profileResponse = await api.get('/api/users/me/', {
                headers: { Authorization: `Bearer ${access}` }
            });

            setUser(profileResponse.data);
            return profileResponse.data; // Return user to component for immediate routing
        } catch (error) {
            console.error("Login Error", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
