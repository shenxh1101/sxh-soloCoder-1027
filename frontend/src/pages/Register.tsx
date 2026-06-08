import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi, getOptions } from '../utils/api';
import Toast from '../components/Toast';

const Register: React.FC = () => {
  const [role, setRole] = useState<'jobseeker' | 'hr'>('jobseeker');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    industry: '',
    size: '',
    companyAddress: '',
    companyDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const options = getOptions();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setToast({ message: '两次输入的密码不一致', type: 'error' });
      return;
    }

    if (formData.password.length < 6) {
      setToast({ message: '密码至少6位', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.register({
        email: formData.email,
        password: formData.password,
        role,
        name: formData.name,
        phone: formData.phone || undefined,
        companyName: role === 'hr' ? formData.companyName : undefined,
        industry: role === 'hr' ? formData.industry : undefined,
        size: role === 'hr' ? formData.size : undefined,
        companyAddress: role === 'hr' ? formData.companyAddress : undefined,
        companyDescription: role === 'hr' ? formData.companyDescription : undefined,
      });

      login(data.token, data.user, data.company);
      setToast({ message: '注册成功！', type: 'success' });
      setTimeout(() => {
        navigate(role === 'hr' ? '/hr/dashboard' : '/jobs');
      }, 500);
    } catch (error: any) {
      setToast({ 
        message: error.response?.data?.error || '注册失败，请稍后重试', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-12 px-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <svg className="w-10 h-10 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-2xl font-bold text-gray-900">智聘网</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">创建账号</h2>
          <p className="text-gray-500 mt-2">加入智聘网，开启您的职业新篇章</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="请输入姓名"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="请输入手机号"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">邮箱 *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="请输入邮箱"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">密码 *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="请输入密码（至少6位）"
                  required
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">确认密码 *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="请再次输入密码"
                required
                className="input"
              />
            </div>

            {role === 'hr' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">企业信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">公司名称 *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="请输入公司名称"
                      required
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">所属行业 *</label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      required
                      className="input"
                    >
                      <option value="">请选择行业</option>
                      {options.industries.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">公司规模 *</label>
                    <select
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      required
                      className="input"
                    >
                      <option value="">请选择公司规模</option>
                      {options.companySizes.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">公司地址 *</label>
                    <input
                      type="text"
                      name="companyAddress"
                      value={formData.companyAddress}
                      onChange={handleChange}
                      placeholder="请输入公司地址"
                      required
                      className="input"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">公司简介</label>
                  <textarea
                    name="companyDescription"
                    value={formData.companyDescription}
                    onChange={handleChange}
                    placeholder="请输入公司简介"
                    rows={3}
                    className="input"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">已有账号？</span>
            <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700 ml-1">
              立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
