import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, company } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const jobseekerLinks = [
    { path: '/jobs', label: '职位列表' },
    { path: '/favorites', label: '我的收藏' },
    { path: '/resume', label: '简历中心' },
    { path: '/applications', label: '投递管理' },
  ];

  const hrLinks = [
    { path: '/hr/dashboard', label: '数据概览' },
    { path: '/hr/jobs', label: '职位管理' },
    { path: '/hr/applications', label: '简历筛选' },
    { path: '/hr/interviews', label: '面试管理' },
  ];

  const links = user?.role === 'hr' ? hrLinks : jobseekerLinks;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container-page">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-xl font-bold text-gray-900">智聘网</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    {company && (
                      <p className="text-xs text-gray-500">{company.name}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  退出
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                  登录
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="md:hidden flex overflow-x-auto pb-3 -mx-4 px-4 space-x-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive(link.path)
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
