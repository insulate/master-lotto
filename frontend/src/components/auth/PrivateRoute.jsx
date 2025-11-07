import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * PrivateRoute - Component สำหรับป้องกัน route ที่ต้องการ authentication และ authorization
 * @param {React.ReactNode} children - Component ที่จะแสดงผล
 * @param {Array<string>} allowedRoles - รายการ role ที่อนุญาตให้เข้าถึง (ถ้าไม่ระบุจะอนุญาตทุก role)
 */
function PrivateRoute({ children, allowedRoles = null }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  // ตรวจสอบว่า login หรือยัง
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ตรวจสอบ role (ถ้ามีกำหนด allowedRoles)
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Redirect ไปหน้าที่เหมาะสมตาม role
    const roleRedirects = {
      master: '/dashboard',
      agent: '/agent/dashboard',
      member: '/app/home',
    };

    return <Navigate to={roleRedirects[user.role] || '/login'} replace />;
  }

  return children;
}

export default PrivateRoute;
