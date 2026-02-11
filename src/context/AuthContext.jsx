import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('ocms_token');
      const storedUser = localStorage.getItem('ocms_user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // No token = not logged in
        setUser(null);
        setToken(null);
      }
    } catch (e) {
      console.error('Auth initialization error:', e);
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  }, []);

  const login = (userObj, authToken) => {
    setUser(userObj);
    setToken(authToken);
    try {
      localStorage.setItem('ocms_token', authToken);
      localStorage.setItem('ocms_user', JSON.stringify(userObj));
    } catch (e) {
      console.error('Storage error:', e);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('ocms_token');
      localStorage.removeItem('ocms_user');
    } catch (e) {
      console.error('Storage error:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
