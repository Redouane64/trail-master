import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface JWTAuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
}

const JWTAuthContext = createContext<JWTAuthContextType | undefined>(undefined);

export function useJWTAuth() {
  const context = useContext(JWTAuthContext);
  if (context === undefined) {
    throw new Error('useJWTAuth must be used within a JWTAuthProvider');
  }
  return context;
}

interface JWTAuthProviderProps {
  children: ReactNode;
}

export function JWTAuthProvider({ children }: JWTAuthProviderProps) {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    // Load token from localStorage on mount
    const savedToken = localStorage.getItem('jwt_token');
    if (savedToken) {
      setTokenState(savedToken);
    }
  }, []);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('jwt_token', newToken);
    } else {
      localStorage.removeItem('jwt_token');
    }
  };

  const isAuthenticated = !!token;

  return (
    <JWTAuthContext.Provider value={{ token, setToken, isAuthenticated }}>
      {children}
    </JWTAuthContext.Provider>
  );
}