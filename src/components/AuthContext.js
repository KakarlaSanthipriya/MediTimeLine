import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(''); // 'patient', 'doctor', 'diagnostic'
  const [userId, setUserId] = useState(''); // HH number or user id
  const [userAddress, setUserAddress] = useState(''); // wallet address
  const [loading, setLoading] = useState(true); // Loading flag

  // Load auth state from localStorage on app start
  useEffect(() => {
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        const { userType, userId, userAddress } = JSON.parse(authData);
        setIsAuthenticated(true);
        setUserType(userType);
        setUserId(userId);
        setUserAddress(userAddress);
      } catch (error) {
        console.error('Error parsing auth data:', error);
        localStorage.removeItem('authData');
      }
    }
    setLoading(false);
  }, []);

  const login = (type, id, address) => {
    setIsAuthenticated(true);
    setUserType(type);
    setUserId(id);
    setUserAddress(address);

    localStorage.setItem('authData', JSON.stringify({ userType: type, userId: id, userAddress: address }));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserType('');
    setUserId('');
    setUserAddress('');
    localStorage.removeItem('authData');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, userId, userAddress, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
