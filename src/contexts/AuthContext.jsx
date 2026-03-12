import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

function authFetch(path, options = {}) {
  return fetch(path, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const res = await authFetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        setUser({ username: data.username, email: data.email });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    const res = await authFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.msg || 'Login failed');
    }
    const data = await res.json();
    setUser({ username: data.username, email: data.email });
    return data;
  }, []);

  const signup = useCallback(async (username, email, password) => {
    const res = await authFetch('/api/auth/create', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    if (res.status === 409) {
      throw new Error('Existing user');
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.msg || 'Signup failed');
    }
    const data = await res.json();
    setUser({ username: data.username, email: data.email });
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'DELETE' });
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
