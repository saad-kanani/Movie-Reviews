import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  const location = useLocation();
  const isRegisterPage = location.pathname === '/register' || location.pathname === '/login';

  return (
    <div className="min-h-screen bg-black">
      {!isRegisterPage && <Navbar />}
      <Outlet />
    </div>
  );
}
