import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Sidebar from './Sidebar';
import Greeting from './Greeting';

const Layout = () => {
  const { state } = useApp();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open on larger screens

  // Redirect to login if not authenticated
  if (!state.user && location.pathname !== '/login' && location.pathname !== '/create-account') {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname === '/login' || location.pathname === '/create-account') {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with hamburger menu and greeting */}
      <header className={`fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-30 transition-all duration-300 ${
        sidebarOpen ? 'lg:left-64' : 'lg:left-0'
      }`}>
        <div className="flex items-center justify-between h-full px-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-md"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Greeting />
        </div>
      </header>

      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`flex-1 p-4 lg:p-6 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;