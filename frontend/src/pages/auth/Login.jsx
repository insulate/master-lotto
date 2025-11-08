import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const result = await login(data.username, data.password);
      toast.success('เข้าสู่ระบบสำเร็จ');

      // Redirect based on user role
      const role = result.user.role;
      switch (role) {
        case 'master':
          navigate('/master/dashboard');
          break;
        case 'agent':
          navigate('/agent/dashboard');
          break;
        case 'member':
          navigate('/app/home');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-cream px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-gold rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-primary-dark-gold rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full bg-bg-dark border-2 border-primary-gold/30 rounded-2xl shadow-2xl p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-gold to-primary-dark-gold rounded-2xl mb-4 shadow-lg">
            <span className="text-4xl">🎰</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-light-gold mb-2">ระบบหวยออนไลน์</h1>
          <p className="text-text-light/80">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-light mb-2">
              ชื่อผู้ใช้
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className={`w-full px-4 py-3 rounded-lg border-2 bg-bg-dark-gray/50 text-text-light placeholder:text-text-light/40 ${
                errors.username ? 'border-accent-error' : 'border-primary-gold/30'
              } focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-primary-gold transition-all`}
              placeholder="กรอกชื่อผู้ใช้"
              {...register('username', {
                required: 'กรุณากรอกชื่อผู้ใช้',
                minLength: {
                  value: 3,
                  message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร',
                },
              })}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-accent-error">{errors.username.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-light mb-2">
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`w-full px-4 py-3 rounded-lg border-2 bg-bg-dark-gray/50 text-text-light placeholder:text-text-light/40 ${
                  errors.password ? 'border-accent-error' : 'border-primary-gold/30'
                } focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-primary-gold transition-all pr-12`}
                placeholder="กรอกรหัสผ่าน"
                {...register('password', {
                  required: 'กรุณากรอกรหัสผ่าน',
                  minLength: {
                    value: 6,
                    message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light/60 hover:text-primary-gold focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-accent-error">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary-gold to-primary-dark-gold text-bg-dark py-3 rounded-lg font-semibold hover:from-primary-dark-gold hover:to-primary-gold focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-bg-dark transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                เข้าสู่ระบบ
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-primary-gold/20">
          <p className="text-center text-sm text-text-secondary">
            ติดต่อผู้ดูแลระบบหากมีปัญหาการเข้าสู่ระบบ
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
