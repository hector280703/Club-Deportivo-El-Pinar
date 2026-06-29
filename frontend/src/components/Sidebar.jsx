import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  LogOut,
  ChevronLeft,
  TrendingUp,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/socios', label: 'Socios', icon: Users },
  { to: '/pagos', label: 'Pagos', icon: CreditCard },
  { to: '/finanzas', label: 'Finanzas', icon: TrendingUp },
  { to: '/reportes', label: 'Reportes', icon: BarChart3 },
];

export default function Sidebar({ isOpen, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <button className="sidebar-toggle" onClick={onToggle} title={isOpen ? 'Contraer' : 'Expandir'}>
        <ChevronLeft size={20} />
      </button>

      <div className="sidebar-logo">
        <img src="/logo.png" alt="El Pinar" className="logo-img" />
        {isOpen && (
          <div>
            <h1 className="logo-title">El Pinar</h1>
            <p className="logo-subtitle">Club Deportivo</p>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={!isOpen ? label : ''}
          >
            <Icon size={20} />
            {isOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.nombre?.charAt(0)}</div>
          {isOpen && (
            <div>
              <p className="user-name">{user?.nombre}</p>
              <p className="user-role">Administrador</p>
            </div>
          )}
        </div>
        {isOpen && (
          <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
