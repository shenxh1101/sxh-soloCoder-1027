import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { Job } from '../types';
import { jobApi, resumeApi, getOptions } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const options = getOptions();

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

  const fetchJobDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await jobApi.getJobDetail(id);
      setJob(data);
    } catch (error) {
      console.error('Failed to fetch job detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'jobseeker') {
      setToast({ message: '请使用求职者账号投递', type: 'error' });
      return;
    }

    try {
      const resume = await resumeApi.getMyResume();
      if (!resume) {
        setToast({ message: '请先完善简历信息', type: 'error' });
        setTimeout(() => navigate('/resume'), 1500);
        return;
      }
    } catch (error) {
      setToast({ message: '请先完善简历信息', type: 'error' });
      setTimeout(() => navigate('/resume'), 1500);
      return;
    }

    setApplying(true);
    try {
      await jobApi.applyJob(id!);
      setToast({ message: '投递成功！HR会尽快与您联系', type: 'success' });
    } catch (error: any) {
      setToast({ 
        message: error.response?.data?.error || '投递失败，请稍后重试', 
        type: 'error' 
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container-page py-20 text-center">
          <p className="text-gray-500 text-lg">职位不存在或已被删除</p>
          <button onClick={() => navigate('/jobs')} className="btn-primary mt-4">
            返回职位列表
          </button>
        </div>
      </div>
    );
  }

  const experienceLabel = options.experienceLabels[job.experience as keyof typeof options.experienceLabels] || job.experience;
  const educationLabel = options.educationLabels[job.education as keyof typeof options.educationLabels] || job.education;
  const typeLabel = options.jobTypeLabels[job.type as keyof typeof options.jobTypeLabels] || job.type;

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <Navbar />
      <div className="container-page py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-2xl font-bold text-red-500">
                      {job.salaryMin}K-{job.salaryMax}K
                    </span>
                    <span className="text-gray-500">· {job.city}</span>
                    <span className="text-gray-500">· {experienceLabel}</span>
                    <span className="text-gray-500">· {educationLabel}</span>
                    <span className="badge bg-blue-50 text-blue-700">{typeLabel}</span>
                    {job.status === 'closed' && (
                      <span className="badge bg-gray-100 text-gray-600">已关闭</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  {user?.role === 'jobseeker' && job.status === 'active' && (
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="btn-primary px-8 disabled:opacity-50"
                    >
                      {applying ? '投递中...' : '立即投递'}
                    </button>
                  )}
                  <div className="flex items-center justify-end space-x-4 text-sm text-gray-400">
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{job.viewCount}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{job.applyCount}人投递</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-1 h-5 bg-primary-600 rounded mr-3"></span>
                    职位描述
                  </h3>
                  <div className="text-gray-600 whitespace-pre-line leading-relaxed pl-4">
                    {job.description}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-1 h-5 bg-primary-600 rounded mr-3"></span>
                    任职要求
                  </h3>
                  <div className="text-gray-600 whitespace-pre-line leading-relaxed pl-4">
                    {job.requirements}
                  </div>
                </div>

                {job.benefits && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-1 h-5 bg-primary-600 rounded mr-3"></span>
                      福利待遇
                    </h3>
                    <div className="flex flex-wrap gap-2 pl-4">
                      {job.benefits.split('、').map((benefit, index) => (
                        <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">公司信息</h3>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-gray-400">
                    {job.companyName?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-lg truncate">
                    {job.companyName}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {job.industry} · {job.size}
                  </p>
                </div>
              </div>
              {job.companyDescription && (
                <p className="mt-4 text-sm text-gray-600 line-clamp-4">
                  {job.companyDescription}
                </p>
              )}
              <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                <div className="flex items-start space-x-2 text-gray-500">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{job.companyAddress || job.address}</span>
                </div>
                {job.companyWebsite && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span>{job.companyWebsite}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">求职小贴士</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-primary-500">•</span>
                  <span>投递前请确保简历信息完整准确</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary-500">•</span>
                  <span>仔细阅读职位要求，匹配自身条件</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary-500">•</span>
                  <span>可收藏感兴趣的职位，方便后续查看</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary-500">•</span>
                  <span>保持电话畅通，注意查收面试邀请</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
