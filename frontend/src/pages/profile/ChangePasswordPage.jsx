import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import PageHeader from '../../components/common/PageHeader';
import { parseErrorMessage } from '../../lib/utils';
import toast from 'react-hot-toast';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';

/**
 * Change Password Page
 * หน้าเปลี่ยนรหัสผ่านสำหรับผู้ใช้ทุกประเภท (Master, Agent, Member)
 */
const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { user, changePassword } = useAuthStore();

  // State Management
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'กรุณากรอกรหัสผ่านปัจจุบัน';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'กรุณากรอกรหัสผ่านใหม่';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่านใหม่';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านใหม่ไม่ตรงกัน';
    }

    if (formData.currentPassword && formData.newPassword &&
        formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านปัจจุบัน';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await changePassword(formData.currentPassword, formData.newPassword);
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ');

      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Navigate back
      navigate(-1);
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <PageHeader
        title="เปลี่ยนรหัสผ่าน"
        subtitle={`ผู้ใช้: ${user?.name} (${user?.username})`}
        leftContent={
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[#6c757d] hover:bg-[#5a6268] text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
          >
            <ArrowLeft size={18} />
            <span>ย้อนกลับ</span>
          </button>
        }
      />

      {/* Form Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-bg-card rounded-lg p-8 border border-border-default shadow-md">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary-gold rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">เปลี่ยนรหัสผ่าน</h2>
              <p className="text-sm text-text-muted">กรุณากรอกข้อมูลด้านล่างเพื่อเปลี่ยนรหัสผ่าน</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                รหัสผ่านปัจจุบัน <span className="text-accent-error">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 bg-bg-light-cream text-text-primary border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.currentPassword
                      ? 'border-accent-error ring-2 ring-accent-error'
                      : 'border-border-default focus:ring-primary-gold focus:border-transparent'
                  }`}
                  placeholder="กรอกรหัสผ่านปัจจุบัน"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-accent-error text-sm mt-1">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                รหัสผ่านใหม่ <span className="text-accent-error">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 bg-bg-light-cream text-text-primary border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.newPassword
                      ? 'border-accent-error ring-2 ring-accent-error'
                      : 'border-border-default focus:ring-primary-gold focus:border-transparent'
                  }`}
                  placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-accent-error text-sm mt-1">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                ยืนยันรหัสผ่านใหม่ <span className="text-accent-error">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 bg-bg-light-cream text-text-primary border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? 'border-accent-error ring-2 ring-accent-error'
                      : 'border-border-default focus:ring-primary-gold focus:border-transparent'
                  }`}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-accent-error text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-bg-light-cream border border-border-default rounded-lg p-4">
              <p className="text-sm font-medium text-text-secondary mb-2">ข้อกำหนดรหัสผ่าน:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-text-muted">
                <li>ต้องมีความยาวอย่างน้อย 6 ตัวอักษร</li>
                <li>ต้องไม่เหมือนกับรหัสผ่านปัจจุบัน</li>
                <li>แนะนำให้ใช้ตัวอักษรผสมตัวเลขเพื่อความปลอดภัย</li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-border-default">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="px-6 py-3 bg-[#6c757d] text-white font-medium rounded-lg hover:bg-[#5a6268] transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-accent-success hover:bg-accent-success/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                <Lock size={18} />
                <span>{loading ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
