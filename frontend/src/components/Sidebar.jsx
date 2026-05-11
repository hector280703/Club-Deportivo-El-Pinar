import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/socios', label: 'Socios', icon: Users },
  { to: '/pagos', label: 'Pagos', icon: CreditCard },
  { to: '/reportes', label: 'Reportes', icon: BarChart3 },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="El Pinar" className="logo-img" />
        <div>
          <h1 className="logo-title">El Pinar</h1>
          <p className="logo-subtitle">Club Deportivo</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.nombre?.charAt(0)}</div>
          <div>
            <p className="user-name">{user?.nombre}</p>
            <p className="user-role">Administrador</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
