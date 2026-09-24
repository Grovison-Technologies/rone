import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // In a real app with HttpOnly cookies, we'd typically have a /api/auth/me route
  // to check session on mount. For now, we'll store basic user info in localStorage 
  // along with the cookie, or just rely on localStorage for this V1.
  
  useEffect(() => {
    const storedUser = localStorage.getItem('rOneUser');
    const storedCustomer = localStorage.getItem('rOneCustomer');
    
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedCustomer) setCustomer(JSON.parse(storedCustomer));
    
    setLoading(false);
  }, []);

  const loginStaff = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('rOneUser', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const loginCustomer = async (mobile, pin) => {
    try {
      const { data } = await axios.post('/api/auth/customer/login', { mobile, pin });
      setCustomer(data);
      localStorage.setItem('rOneCustomer', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async (type = 'user') => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error(error);
    }
    
    if (type === 'user') {
      setUser(null);
      localStorage.removeItem('rOneUser');
    } else {
      setCustomer(null);
      localStorage.removeItem('rOneCustomer');
    }
  };

  return (
    <AuthContext.Provider value={{ user, customer, loading, loginStaff, loginCustomer, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
