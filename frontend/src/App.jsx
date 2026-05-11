import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Socios from './pages/Socios.jsx';
import Pagos from './pages/Pagos.jsx';
import Reportes from './pages/Reportes.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d1a10',
              color: '#f0fdf4',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '10px',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/socios"
            element={
              <ProtectedRoute>
                <Layout><Socios /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pagos"
            element={
              <ProtectedRoute>
                <Layout><Pagos /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reportes"
            element={
              <ProtectedRoute>
                <Layout><Reportes /></Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
