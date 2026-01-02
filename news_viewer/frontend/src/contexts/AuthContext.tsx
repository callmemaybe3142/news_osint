/**
 * Authentication context and provider
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface User {
    id: number;
    username: string;
    created_at: string;
    last_login: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user info on mount if token exists
    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(API_ENDPOINTS.ME, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    // Token is invalid, clear it
                    localStorage.removeItem('token');
                    setToken(null);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                localStorage.removeItem('token');
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [token]);

    const login = async (username: string, password: string) => {
        const response = await fetch(API_ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }

        const data = await response.json();
        const newToken = data.access_token;

        localStorage.setItem('token', newToken);
        setToken(newToken);

        // Fetch user info
        const userResponse = await fetch(API_ENDPOINTS.ME, {
            headers: {
                'Authorization': `Bearer ${newToken}`,
            },
        });

        if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
