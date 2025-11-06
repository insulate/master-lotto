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
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex flex-col">
      {/* Top Bar */}
      <div className="bg-red-800/80 backdrop-blur-sm border-b border-red-700/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-yellow-400">
              LOTTO
              <span className="text-white text-sm">MAX</span>
            </div>
          </div>

          {/* Credit Display */}
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-full px-4 py-1.5">
              <span className="text-yellow-400 text-sm font-medium">
                {(user?.credit || 0).toLocaleString()} บาท
              </span>
            </div>

            {/* Menu Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-red-700/50 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-4 top-16 bg-red-800 border border-red-700 rounded-lg shadow-xl min-w-[200px] overflow-hidden z-50">
            <div className="p-3 border-b border-red-700">
              <div className="text-white font-medium">{user?.name}</div>
              <div className="text-red-300 text-sm">{user?.username}</div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-white hover:bg-red-700 transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-20">
        <Outlet />
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-red-900/95 backdrop-blur-sm border-t border-red-700/50 z-40">
        <div className="container mx-auto px-2">
          <div className="grid grid-cols-4 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'text-yellow-400 bg-red-800/50'
                      : 'text-red-200 hover:text-white hover:bg-red-800/30'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
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
