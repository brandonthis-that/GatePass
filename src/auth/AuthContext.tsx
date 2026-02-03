import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { User, AuthState } from '../types';
import AuthService from './AuthService';

// Auth actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// Auth context
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = AuthService.getTokenFromStorage();
      
      if (token && AuthService.isTokenValid(token)) {
        try {
          const user = await AuthService.getCurrentUser();
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        } catch (error) {
          // Token is invalid or expired
          AuthService.logout();
          dispatch({ type: 'LOGIN_FAILURE', payload: 'Session expired' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const { user, token } = await AuthService.login({ email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const register = async (data: any) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const { user, token } = await AuthService.register(data);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>; // TODO: Replace with loading component
    }

    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }

    return <Component {...props} />;
  };
};

export default AuthContext;