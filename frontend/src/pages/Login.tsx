import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../utils/api';
import Toast from '../components/Toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'jobseeker' | 'hr'>('jobseeker');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authApi.login({ email, password, role });
      login(data.token, data.user, data.company);
      setToast({ message: '登录成功！', type: 'success' });
      setTimeout(() => {
        navigate(role === 'hr' ? '/hr/dashboard' : '/jobs');
      }, 500);
    } catch (error: any) {
      setToast({ 
        message: error.response?.data?.error || '登录失败，请检查邮箱和密码', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <svg className="w-10 h-10 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-2xl font-bold text-gray-900">智聘网</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">欢迎回来</h2>
          <p className="text-gray-500 mt-2">登录您的账号，开启求职/招聘之旅</p>
        </div>

        <div className="card p-8">
          <div className="flex mb-6">
            <button
              onClick={() => setRole('jobseeker')}
              className={`flex-1 py-3 text-center font-medium rounded-l-lg transition-colors ${
                role === 'jobseeker'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              求职者
            </button>
            <button
              onClick={() => setRole('hr')}
              className={`flex-1 py-3 text-center font-medium rounded-r-lg transition-colors ${
                role === 'hr'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              企业HR
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">还没有账号？</span>
            <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700 ml-1">
              立即注册
            </Link>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">演示账号：</p>
            <p className="text-xs text-gray-600">
              HR: hr1@zhilian.com / 123456
            </p>
            <p className="text-xs text-gray-600">
              求职者: zhangsan@example.com / 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
