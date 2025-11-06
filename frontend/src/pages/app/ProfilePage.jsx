import { useAuthStore } from '../../store/authStore';

/**
 * Profile Page - หน้าโปรไฟล์ (Placeholder)
 */
const ProfilePage = () => {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-bg-dark border-2 border-primary-gold/30 rounded-lg p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-primary-gold mb-6">โปรไฟล์</h1>

        <div className="space-y-4">
          <div>
            <label className="text-text-muted text-sm">ชื่อ</label>
            <div className="text-text-light text-lg font-medium">{user?.name}</div>
          </div>

          <div>
            <label className="text-text-muted text-sm">ชื่อผู้ใช้</label>
            <div className="text-text-light text-lg font-medium">{user?.username}</div>
          </div>

          <div>
            <label className="text-text-muted text-sm">เครดิต</label>
            <div className="text-primary-gold text-2xl font-bold">
              {(user?.credit || 0).toLocaleString()} บาท
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
