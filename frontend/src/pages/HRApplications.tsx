import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Application, Resume, Interview } from '../types';
import { hrApi, applicationApi, interviewApi, resumeApi } from '../utils/api';
import { getOptions } from '../utils/api';
import Modal from '../components/Modal';

const options = getOptions();

const HRApplications: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialJobId = params.get('jobId') || '';
  const initialStatus = params.get('status') || 'all';

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [jobFilter, setJobFilter] = useState(initialJobId);
  const [keyword, setKeyword] = useState('');
  const [jobs, setJobs] = useState<Array<{ id: string; title: string }>>([]);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  const [newStatus, setNewStatus] = useState('');
  const [hrNotes, setHrNotes] = useState('');
  const [interviewForm, setInterviewForm] = useState({
    type: 'phone' as 'phone' | 'onsite' | 'video',
    dateTime: '',
    location: '',
    notes: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    loadApplications();
  }, [currentPage, statusFilter, jobFilter, keyword]);

  const loadJobs = async () => {
    try {
      const data = await hrApi.getMyJobs({ status: 'active', pageSize: 100 });
      setJobs(data.list.map(j => ({ id: j.id, title: j.title })));
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const loadApplications = async () => {
    try {
      const data = await hrApi.getApplications({
        jobId: jobFilter || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        keyword: keyword || undefined,
        page: currentPage,
        pageSize,
      });
      setApplications(data.list);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleViewResume = async (app: Application) => {
    setSelectedApp(app);
    setLoading(true);
    try {
      const data = await resumeApi.getResumeById(app.resumeId);
      setResume(data);
      setShowResumeModal(true);
    } catch (error) {
      console.error('Failed to load resume:', error);
      showMessage('error', '加载简历失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (app: Application) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setHrNotes(app.hrNotes || '');
    setShowStatusModal(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedApp || !newStatus) return;
    try {
      await applicationApi.updateStatus(selectedApp.id, { status: newStatus, hrNotes });
      showMessage('success', '状态更新成功');
      setShowStatusModal(false);
      loadApplications();
    } catch (error) {
      console.error('Failed to update status:', error);
      showMessage('error', '更新失败');
    }
  };

  const handleAddNotes = (app: Application) => {
    setSelectedApp(app);
    setHrNotes(app.hrNotes || '');
    setShowNotesModal(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    try {
      await applicationApi.updateStatus(selectedApp.id, {
        status: selectedApp.status,
        hrNotes,
      });
      showMessage('success', '备注保存成功');
      setShowNotesModal(false);
      loadApplications();
    } catch (error) {
      console.error('Failed to save notes:', error);
      showMessage('error', '保存失败');
    }
  };

  const handleScheduleInterview = (app: Application) => {
    setSelectedApp(app);
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 24);
    const defaultDateTime = now.toISOString().slice(0, 16);
    setInterviewForm({
      type: 'phone',
      dateTime: defaultDateTime,
      location: '',
      notes: '',
    });
    setShowInterviewModal(true);
  };

  const handleCreateInterview = async () => {
    if (!selectedApp || !interviewForm.dateTime) {
      showMessage('error', '请填写面试时间');
      return;
    }
    try {
      await interviewApi.createInterview({
        applicationId: selectedApp.id,
        type: interviewForm.type,
        dateTime: interviewForm.dateTime,
        location: interviewForm.location || undefined,
        notes: interviewForm.notes || undefined,
      });
      if (selectedApp.status !== 'interview') {
        await applicationApi.updateStatus(selectedApp.id, { status: 'interview' });
      }
      showMessage('success', '面试邀请已发送');
      setShowInterviewModal(false);
      loadApplications();
    } catch (error) {
      console.error('Failed to create interview:', error);
      showMessage('error', '创建失败');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const totalPages = Math.ceil(total / pageSize);

  const statusTabs = [
    { key: 'all', label: '全部' },
    { key: 'applied', label: '已投递' },
    { key: 'pending', label: '待沟通' },
    { key: 'interview', label: '面试' },
    { key: 'hired', label: '录用' },
    { key: 'rejected', label: '拒绝' },
  ];

  if (loading && applications.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">简历筛选</h1>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">职位：</span>
              <select
                value={jobFilter}
                onChange={e => {
                  setJobFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部职位</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">关键词：</span>
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setCurrentPage(1);
                    loadApplications();
                  }
                }}
                placeholder="搜索姓名、职位..."
                className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  setCurrentPage(1);
                  loadApplications();
                }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                搜索
              </button>
            </div>
          </div>
        </div>

        <div className="flex border-b overflow-x-auto">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setCurrentPage(1);
              }}
              className={`flex-shrink-0 px-6 py-3 text-center font-medium transition-colors ${
                statusFilter === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">暂无简历</h3>
            <p className="text-gray-500">
              {statusFilter === 'all' ? '还没有收到任何简历投递' : `暂无${statusTabs.find(t => t.key === statusFilter)?.label}的简历`}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {applications.map(app => (
                <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {(app.applicantName || '用').charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{app.applicantName}</div>
                          <div className="text-sm text-gray-500">
                            {app.applicantPhone} · {app.applicantEmail}
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${options.statusColors[app.status]}`}>
                          {options.statusLabels[app.status]}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        应聘职位：
                        <Link
                          to={`/jobs/${app.jobId}`}
                          target="_blank"
                          className="text-blue-600 hover:underline ml-1"
                        >
                          {app.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{options.educationLabels[app.education as keyof typeof options.educationLabels] || app.education}</span>
                        <span>·</span>
                        <span>{app.workYears}年工作经验</span>
                        <span>·</span>
                        <span>{app.currentPosition}</span>
                        <span>·</span>
                        <span>{app.currentCompany}</span>
                      </div>
                      {app.hrNotes && (
                        <div className="mt-3 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                          <span className="font-medium">备注：</span>{app.hrNotes}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-2">
                        投递时间：{formatDate(app.appliedAt)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => handleViewResume(app)}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        查看简历
                      </button>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleUpdateStatus(app)}
                          className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          更新状态
                        </button>
                        <button
                          onClick={() => handleScheduleInterview(app)}
                          className="px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        >
                          安排面试
                        </button>
                        <button
                          onClick={() => handleAddNotes(app)}
                          className="px-2 py-1 text-xs text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                        >
                          添加备注
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  上一页
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 border rounded-md transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        title="简历详情"
        maxWidth="3xl"
      >
        {resume && (
          <div className="max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">基本信息</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">姓名：</span>{resume.name}</div>
                  <div><span className="text-gray-500">性别：</span>{resume.gender === 'male' ? '男' : resume.gender === 'female' ? '女' : '-'}</div>
                  <div><span className="text-gray-500">手机号：</span>{resume.phone}</div>
                  <div><span className="text-gray-500">邮箱：</span>{resume.email}</div>
                  <div><span className="text-gray-500">出生日期：</span>{resume.birthday || '-'}</div>
                  <div><span className="text-gray-500">所在城市：</span>{resume.currentCity || '-'}</div>
                  <div><span className="text-gray-500">学历：</span>{options.educationLabels[resume.education as keyof typeof options.educationLabels] || resume.education}</div>
                  <div><span className="text-gray-500">专业：</span>{resume.major || '-'}</div>
                  <div><span className="text-gray-500">毕业年份：</span>{resume.graduationYear || '-'}</div>
                  <div><span className="text-gray-500">工作年限：</span>{resume.workYears}年</div>
                </div>
                {resume.selfIntroduction && (
                  <div className="mt-3">
                    <span className="text-gray-500 text-sm">自我介绍：</span>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{resume.selfIntroduction}</p>
                  </div>
                )}
              </div>

              {resume.workExperiences && resume.workExperiences.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">工作经历</h3>
                  <div className="space-y-4">
                    {resume.workExperiences.map(exp => (
                      <div key={exp.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-800">{exp.position} · {exp.company}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              {exp.startTime} - {exp.isCurrent ? '至今' : exp.endTime}
                            </div>
                          </div>
                          {exp.salary && <div className="text-sm text-blue-600">{exp.salary}</div>}
                        </div>
                        <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resume.projectExperiences && resume.projectExperiences.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">项目经历</h3>
                  <div className="space-y-4">
                    {resume.projectExperiences.map(exp => (
                      <div key={exp.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-800">{exp.name} · {exp.role}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {exp.startTime} - {exp.endTime || '至今'}
                        </div>
                        {exp.technologies && (
                          <div className="text-sm text-blue-600 mt-1">技术栈：{exp.technologies}</div>
                        )}
                        <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">求职意向</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">当前职位：</span>{resume.currentPosition || '-'}</div>
                  <div><span className="text-gray-500">当前公司：</span>{resume.currentCompany || '-'}</div>
                  <div><span className="text-gray-500">当前薪资：</span>{resume.currentSalary || '-'}</div>
                  <div><span className="text-gray-500">期望薪资：</span>{resume.expectedSalary || '-'}</div>
                  <div><span className="text-gray-500">期望城市：</span>{resume.expectedCity || '-'}</div>
                  <div><span className="text-gray-500">期望职位：</span>{resume.expectedPosition || '-'}</div>
                </div>
              </div>

              {resume.attachmentUrl && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">附件简历</h3>
                  <a
                    href={`http://localhost:3001${resume.attachmentUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {resume.attachmentName}
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowResumeModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  setShowResumeModal(false);
                  if (selectedApp) handleScheduleInterview(selectedApp);
                }}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                安排面试
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="更新状态"
        maxWidth="lg"
      >
        {selectedApp && (
          <div>
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                为 <span className="font-medium text-gray-800">{selectedApp.applicantName}</span> 的
                <span className="font-medium text-gray-800"> {selectedApp.title}</span> 简历更新状态
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">选择状态</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(options.statusLabels).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setNewStatus(value)}
                    className={`p-3 border rounded-md text-center transition-colors ${
                      newStatus === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">沟通备注</label>
              <textarea
                value={hrNotes}
                onChange={e => setHrNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="记录与候选人的沟通内容..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveStatus}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                确认更新
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        title="沟通备注"
        maxWidth="lg"
      >
        {selectedApp && (
          <div>
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                记录与 <span className="font-medium text-gray-800">{selectedApp.applicantName}</span> 的沟通内容
              </p>
              <textarea
                value={hrNotes}
                onChange={e => setHrNotes(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：电话沟通后候选人对薪资期望较高，需进一步确认..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                保存备注
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        title="安排面试"
        maxWidth="lg"
      >
        {selectedApp && (
          <div>
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                为 <span className="font-medium text-gray-800">{selectedApp.applicantName}</span> 安排面试
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">面试类型</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(options.interviewTypeLabels).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => setInterviewForm({ ...interviewForm, type: value as any })}
                        className={`p-3 border rounded-md text-center transition-colors ${
                          interviewForm.type === value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">面试时间 <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    value={interviewForm.dateTime}
                    onChange={e => setInterviewForm({ ...interviewForm, dateTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {interviewForm.type === 'onsite' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">面试地点</label>
                    <input
                      type="text"
                      value={interviewForm.location}
                      onChange={e => setInterviewForm({ ...interviewForm, location: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="如：北京市海淀区中关村大厦A座10层"
                    />
                  </div>
                )}
                {interviewForm.type === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">会议链接/方式</label>
                    <input
                      type="text"
                      value={interviewForm.location}
                      onChange={e => setInterviewForm({ ...interviewForm, location: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="如：腾讯会议，会议号：123-456-789"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">面试备注</label>
                  <textarea
                    value={interviewForm.notes}
                    onChange={e => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="面试注意事项、需要考察的重点等..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowInterviewModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateInterview}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                发送面试邀请
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HRApplications;
