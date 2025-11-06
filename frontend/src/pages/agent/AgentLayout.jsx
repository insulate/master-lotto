import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Wallet } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

// Menu items for Agent role
const agentMenuItems = [
  {
    id: 'dashboard',
    label: 'แดชบอร์ด',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    href: '/agent/dashboard',
  },
  {
    id: 'members',
    label: 'จัดการผู้เล่น',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    href: '/agent/members',
  },
];

export default function AgentLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get user data and logout function from auth store
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Calculate total balance (credit + balance)
  const totalBalance = (user?.credit || 0) + (user?.balance || 0);

  // Detect screen size and auto-open sidebar on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile when clicking menu item
  const handleMenuClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    toast.success('ออกจากระบบสำเร็จ');
    navigate('/login');
  };

  // Get active item
  const activeItem = agentMenuItems.find(item => location.pathname === item.href)?.id || 'dashboard';

  return (
    <div className="min-h-screen bg-bg-cream">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-t from-primary-light-gold via-primary-gold to-primary-mustard border-b-2 border-primary-dark-gold shadow-lg z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left Side - Logo & Menu Toggle */}
          <div className="flex items-center gap-4">
            {/* Menu Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-primary-dark-gold/20 transition-colors duration-200 text-text-primary"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-gold to-primary-dark-gold rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-xl">🎰</span>
              </div>
              <h1 className="text-xl font-bold text-text-primary hidden md:block">
                ระบบหวยออนไลน์ - เอเย่นต์
              </h1>
            </div>
          </div>

          {/* Right Side - Balance & User Menu */}
          <div className="flex items-center gap-3">
            {/* Balance Display */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-bg-dark-gray/50 rounded-lg border border-primary-gold/30">
              <Wallet className="w-5 h-5 text-primary-light-gold" />
              <div className="text-left">
                <p className="text-xs text-text-primary font-medium">เครดิตคงเหลือ</p>
                <p className="text-sm font-bold text-primary-light-gold">
                  {totalBalance.toLocaleString()} บาท
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-primary-dark-gold"></div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-gold to-primary-dark-gold flex items-center justify-center text-sm font-semibold text-text-primary">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                <p className="text-xs text-text-secondary">เอเย่นต์</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-bg-dark border-r border-primary-dark-gold/30 shadow-lg transition-transform duration-300',
          'z-40',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="h-full overflow-y-auto p-4 pb-20">
          <ul className="space-y-1">
            {agentMenuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  onClick={handleMenuClick}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    activeItem === item.id
                      ? 'bg-primary-gold/20 text-primary-light-gold shadow-lg shadow-primary-gold/20'
                      : 'text-text-light hover:bg-primary-dark-gold/30 hover:text-primary-light-gold'
                  )}
                >
                  <div className={cn(activeItem === item.id && 'scale-110')}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section - Change Password & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-dark-gold/30 bg-bg-dark-gray space-y-2">
          {/* Change Password Button */}
          <Link
            to="/profile/change-password"
            onClick={handleMenuClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-light hover:bg-primary-gold/20 hover:text-primary-light-gold transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span className="font-medium">เปลี่ยนรหัสผ่าน</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-light hover:bg-accent-error/20 hover:text-accent-error transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          'pt-16 transition-all duration-300',
          'lg:ml-0',
          sidebarOpen && 'lg:ml-64'
        )}
      >
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
