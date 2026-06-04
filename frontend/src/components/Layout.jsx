import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Overlay for mobile menu - behind button */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 998,
            display: 'block',
          }}
        />
      )}

      {/* Mobile menu toggle - on top */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        title={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`sidebar ${mobileMenuOpen ? 'open' : ''} ${!sidebarOpen ? 'collapsed' : ''}`}>
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      </div>

      <main className="main-content" onClick={closeMobileMenu}>
        {children}
      </main>
    </div>
  );
}
