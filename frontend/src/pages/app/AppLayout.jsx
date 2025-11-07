import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Wallet, LogOut, Home, FileText, Key } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

/**
 * App Layout - Layout สำหรับ Member UI แบบ Lottery App
 */
const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  // Calculate total balance
  const totalBalance = (user?.credit || 0) + (user?.balance || 0);

  const handleLogout = async () => {
    await logout();
    toast.success('ออกจากระบบสำเร็จ');
    navigate('/login');
  };

  // Navigation items
  const navItems = [
    { path: '/app/home', icon: Home, label: 'หน้าหลัก' },
    { path: '/app/history', icon: FileText, label: 'ประวัติ' },
    { path: '/profile/change-password', icon: Key, label: 'เปลี่ยนรหัสผ่าน' },
  ];

  // Check if current path is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-bg-cream">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-t from-primary-light-gold via-primary-gold to-primary-mustard border-b-2 border-primary-dark-gold shadow-lg z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left Side - Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-gold to-primary-dark-gold rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-xl">🎰</span>
            </div>
            <h1 className="text-xl font-bold text-text-primary hidden md:block">
              ระบบหวยออนไลน์ - สมาชิก
            </h1>
          </div>

          {/* Right Side - Balance & User Menu */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Balance Display */}
            <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-bg-dark-gray/50 rounded-lg border border-primary-gold/30">
              <Wallet className="w-4 h-4 md:w-5 md:h-5 text-primary-light-gold" />
              <div className="text-left">
                <p className="text-[10px] md:text-xs text-text-primary font-medium hidden sm:block">เครดิตคงเหลือ</p>
                <p className="text-xs md:text-sm font-bold text-primary-light-gold">
                  {totalBalance.toLocaleString()}
                  <span className="hidden sm:inline"> บาท</span>
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-6 md:h-8 bg-primary-dark-gold"></div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-gold to-primary-dark-gold flex items-center justify-center text-sm font-semibold text-text-primary">
                {user?.name?.charAt(0).toUpperCase() || 'M'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                <p className="text-xs text-text-secondary">สมาชิก</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-16 pb-20">
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary-gold/30 shadow-lg z-40">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
                  active
                    ? 'text-primary-gold'
                    : 'text-gray-500 hover:text-primary-gold'
                }`}
              >
                <Icon className={`w-6 h-6 ${active ? 'stroke-2' : 'stroke-1.5'}`} />
                <span className={`text-xs ${active ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
