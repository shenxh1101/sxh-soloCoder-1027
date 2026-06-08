import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Application, ApplicationStatus, Interview } from '../types';
import { applicationApi, interviewApi } from '../utils/api';
import { getOptions } from '../utils/api';

const options = getOptions();

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<ApplicationStatus | 'all'>('all');
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, [activeStatus]);

  const loadData = async () => {
    try {
      const [appsData, interviewsData, statsData] = await Promise.all([
        applicationApi.getMyApplications(activeStatus === 'all' ? undefined : activeStatus),
        interviewApi.getMyInterviews(),
        applicationApi.getStats(),
      ]);
      setApplications(appsData);
      setInterviews(interviewsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusTabs = [
    { key: 'all', label: '全部', count: applications.length || Object.values(stats).reduce((a, b) => a + b, 0) },
    { key: 'applied', label: '已投递', count: stats.applied || 0 },
    { key: 'pending', label: '待沟通', count: stats.pending || 0 },
    { key: 'interview', label: '面试', count: stats.interview || 0 },
    { key: 'hired', label: '录用', count: stats.hired || 0 },
    { key: 'rejected', label: '拒绝', count: stats.rejected || 0 },
  ];

  const getInterviewForApplication = (appId: string) => {
    return interviews.filter(i => i.applicationId === appId);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">我的投递</h1>

      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="flex border-b overflow-x-auto">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveStatus(tab.key as any)}
              className={`flex-shrink-0 px-6 py-4 text-center font-medium transition-colors flex items-center gap-2 ${
                activeStatus === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeStatus === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">暂无投递记录</h3>
          <p className="text-gray-500 mb-4">
            {activeStatus === 'all' ? '还没有投递任何职位，快去看看吧' : `暂无${statusTabs.find(t => t.key === activeStatus)?.label}的投递`}
          </p>
          <Link
            to="/jobs"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            浏览职位
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => {
            const appInterviews = getInterviewForApplication(app.id);
            return (
              <div key={app.id} className="bg-white rounded-lg shadow-sm border p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        to={`/jobs/${app.jobId}`}
                        className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors"
                      >
                        {app.title}
                      </Link>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${options.statusColors[app.status]}`}>
                        {options.statusLabels[app.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                      <span>{app.companyName}</span>
                      <span>·</span>
                      <span>{app.salaryMin && app.salaryMax ? `${app.salaryMin}K-${app.salaryMax}K` : '面议'}</span>
                      <span>·</span>
                      <span>{app.city}</span>
                      <span>·</span>
                      <span>{options.experienceLabels[app.experience as keyof typeof options.experienceLabels] || app.experience}</span>
                      <span>·</span>
                      <span>{options.jobTypeLabels[app.type as keyof typeof options.jobTypeLabels] || app.type}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      投递时间：{formatDate(app.appliedAt)}
                    </div>
                  </div>
                </div>

                {app.hrNotes && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-md border-l-4 border-yellow-400">
                    <div className="text-sm font-medium text-yellow-800 mb-1">HR 备注</div>
                    <p className="text-sm text-yellow-700">{app.hrNotes}</p>
                  </div>
                )}

                {appInterviews.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm font-medium text-gray-700 mb-3">面试安排</div>
                    <div className="space-y-3">
                      {appInterviews.map(interview => (
                        <div key={interview.id} className="flex items-start gap-3 p-3 bg-purple-50 rounded-md">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-800">
                                {options.interviewTypeLabels[interview.type]}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                interview.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                interview.status === 'completed' ? 'bg-green-100 text-green-700' :
                                interview.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {options.interviewStatusLabels[interview.status]}
                              </span>
                              {interview.result && (
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  interview.result === 'pass' ? 'bg-green-100 text-green-700' :
                                  interview.result === 'fail' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {options.interviewResultLabels[interview.result]}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              时间：{formatDateTime(interview.dateTime)}
                            </div>
                            {interview.location && (
                              <div className="text-sm text-gray-600 mb-1">
                                地点：{interview.location}
                              </div>
                            )}
                            {interview.notes && (
                              <div className="text-sm text-gray-500">
                                备注：{interview.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    最后更新：{formatDate(app.updatedAt)}
                  </div>
                  <Link
                    to={`/jobs/${app.jobId}`}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    查看职位详情 →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;
