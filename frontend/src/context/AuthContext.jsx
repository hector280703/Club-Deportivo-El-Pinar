import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // No hay token, no autenticado
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Verificar que el token sea válido con el servidor
        const { data } = await API.get('/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
      } catch (err) {
        // Token inválido o expirado - limpiar sesión
        console.log('Token verification failed:', err.response?.status);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
