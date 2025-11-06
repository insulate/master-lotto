import { Outlet, useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

/**
 * App Layout - Layout สำหรับ Member UI แบบ Lottery App
 */
const AppLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Calculate total balance
  const totalBalance = (user?.credit || 0) + (user?.balance || 0);

  const handleLogout = async () => {
    await logout();
    toast.success('ออกจากระบบสำเร็จ');
    navigate('/login');
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
                {user?.name?.charAt(0).toUpperCase() || 'M'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                <p className="text-xs text-text-secondary">สมาชิก</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-16">
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
