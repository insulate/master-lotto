import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Receipt, User, Clock, Menu } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

/**
 * App Layout - Layout สำหรับ Member UI แบบ Lottery App
 */
const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  // Navigation items for bottom bar
  const navItems = [
    { path: '/app/home', icon: Home, label: 'หน้าหลัก' },
    { path: '/app/betting', icon: Receipt, label: 'แทงหวย' },
    { path: '/app/history', icon: Clock, label: 'ประวัติ' },
    { path: '/app/profile', icon: User, label: 'โปรไฟล์' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-primary-gold to-primary-dark-gold border-b border-primary-gold sticky top-0 z-40 flex justify-center">
        <div className="w-[800px] py-3 flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-bg-dark">
              LOTTO
              <span className="text-bg-dark text-sm">MAX</span>
            </div>
          </div>

          {/* Credit Display */}
          <div className="flex items-center gap-4">
            <div className="bg-white/20 border border-white/50 rounded-full px-4 py-1.5">
              <span className="text-bg-dark text-sm font-medium">
                {(user?.credit || 0).toLocaleString()} บาท
              </span>
            </div>

            {/* Menu Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-bg-dark" />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-4 top-16 bg-bg-darker border border-primary-gold/30 rounded-lg shadow-xl min-w-[200px] overflow-hidden z-50">
            <div className="p-3 border-b border-primary-gold/20">
              <div className="text-text-light font-medium">{user?.name}</div>
              <div className="text-text-muted text-sm">{user?.username}</div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-text-light hover:bg-primary-gold/10 transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-bg-cream">
        <Outlet />
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default AppLayout;
