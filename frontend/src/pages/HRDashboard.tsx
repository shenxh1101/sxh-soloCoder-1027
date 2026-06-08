import React, { useState, useEffect } from 'react';
import { HRStats } from '../types';
import { hrApi } from '../utils/api';
import { getOptions } from '../utils/api';
import { Link } from 'react-router-dom';

const options = getOptions();

const HRDashboard: React.FC = () => {
  const [stats, setStats] = useState<HRStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await hrApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const statusOrder: Array<keyof typeof options.statusLabels> = ['applied', 'pending', 'interview', 'hired', 'rejected'];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">数据概览</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">发布职位</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.totalJobs || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <Link to="/hr/jobs" className="text-sm text-blue-600 hover:text-blue-800 mt-3 inline-block">
            查看全部 →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">总浏览量</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.totalViews || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">总投递量</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.totalApplies || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <Link to="/hr/applications" className="text-sm text-blue-600 hover:text-blue-800 mt-3 inline-block">
            查看全部 →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">面试待安排</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.applicationsByStatus?.pending || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <Link to="/hr/applications?status=pending" className="text-sm text-blue-600 hover:text-blue-800 mt-3 inline-block">
            立即处理 →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">投递状态分布</h3>
          <div className="space-y-4">
            {statusOrder.map(status => {
              const count = stats?.applicationsByStatus?.[status] || 0;
              const total = stats?.totalApplies || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">{options.statusLabels[status]}</span>
                    <span className="text-sm font-medium text-gray-800">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        status === 'hired' ? 'bg-green-500' :
                        status === 'rejected' ? 'bg-gray-500' :
                        status === 'interview' ? 'bg-purple-500' :
                        status === 'pending' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">热门职位 TOP 5</h3>
          {stats?.topJobs && stats.topJobs.length > 0 ? (
            <div className="space-y-3">
              {stats.topJobs.map((job, index) => (
                <div key={job.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' :
                    'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{job.title}</div>
                    <div className="text-sm text-gray-500">
                      {job.viewCount} 次浏览 · {job.applyCount} 次投递
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-600">{job.applyCount}</div>
                    <div className="text-xs text-gray-400">投递</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无数据
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">快速操作</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/hr/jobs/create"
            className="flex flex-col items-center gap-2 p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-medium text-gray-800">发布职位</span>
          </Link>
          <Link
            to="/hr/applications"
            className="flex flex-col items-center gap-2 p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-medium text-gray-800">筛选简历</span>
          </Link>
          <Link
            to="/hr/interviews"
            className="flex flex-col items-center gap-2 p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-medium text-gray-800">面试安排</span>
          </Link>
          <Link
            to="/hr/jobs"
            className="flex flex-col items-center gap-2 p-6 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-medium text-gray-800">职位管理</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
