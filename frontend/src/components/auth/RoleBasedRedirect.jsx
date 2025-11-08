import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * RoleBasedRedirect - Component สำหรับ redirect ไปหน้าที่เหมาะสมตาม role
 */
function RoleBasedRedirect() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // ถ้ายังไม่ได้ login ให้ไปหน้า login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect ตาม role
  const roleRedirects = {
    master: '/master/dashboard',
    agent: '/agent/dashboard',
    member: '/app/home',
  };

  const redirectPath = roleRedirects[user?.role] || '/login';

  return <Navigate to={redirectPath} replace />;
}

export default RoleBasedRedirect;
