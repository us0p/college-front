import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import ChatWidget from './ChatWidget';

const navItems = [
  { to: '/', label: 'Posts', icon: '📝' },
  { to: '/documents', label: 'Docs', icon: '📄' },
  { to: '/users', label: 'Users', icon: '👥' },
  { to: '/roles', label: 'Roles', icon: '🔑' },
];

export default function Layout() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white px-4 py-3 flex items-center justify-between shadow">
        <span className="font-bold text-lg tracking-tight">CollegeApp</span>
        <button
          onClick={logout}
          className="text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-lg transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <ChatWidget />

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs px-3 py-1 rounded-lg transition-colors ${
                isActive ? 'text-indigo-600 font-semibold' : 'text-gray-500'
              }`
            }
          >
            <span className="text-xl">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
