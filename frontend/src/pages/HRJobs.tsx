import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Job, JobStats } from '../types';
import { jobApi, hrApi } from '../utils/api';
import { getOptions } from '../utils/api';
import Modal from '../components/Modal';

const options = getOptions();

const HRJobs: React.FC = () => {
  const navigate = useNavigate();
  const { action, id } = useParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobStats, setJobStats] = useState<JobStats | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    benefits: '',
    salaryMin: 0,
    salaryMax: 0,
    salaryType: 'monthly' as 'monthly' | 'annual',
    city: '',
    district: '',
    experience: '',
    education: '',
    type: 'fulltime',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadJobs();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    if (action === 'create') {
      setShowCreateModal(true);
      resetForm();
    } else if (action === 'edit' && id) {
      loadJobForEdit(id);
    } else {
      setShowCreateModal(false);
    }
  }, [action, id]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      requirements: '',
      benefits: '',
      salaryMin: 0,
      salaryMax: 0,
      salaryType: 'monthly',
      city: '',
      district: '',
      experience: '',
      education: '',
      type: 'fulltime',
    });
    setFormErrors({});
    setSelectedJob(null);
  };

  const loadJobs = async () => {
    try {
      const data = await hrApi.getMyJobs({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: currentPage,
        pageSize,
      });
      setJobs(data.list);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobForEdit = async (jobId: string) => {
    try {
      const data = await jobApi.getJobDetail(jobId);
      setSelectedJob(data);
      setFormData({
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        benefits: data.benefits,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        salaryType: data.salaryType,
        city: data.city,
        district: data.district || '',
        experience: data.experience,
        education: data.education,
        type: data.type,
      });
      setShowCreateModal(true);
    } catch (error) {
      console.error('Failed to load job:', error);
    }
  };

  const loadJobStats = async (jobId: string) => {
    try {
      const data = await hrApi.getJobStats(jobId);
      setJobStats(data);
      setShowStatsModal(true);
    } catch (error) {
      console.error('Failed to load job stats:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = '请输入职位名称';
    if (!formData.description.trim()) errors.description = '请输入职位描述';
    if (!formData.requirements.trim()) errors.requirements = '请输入任职要求';
    if (!formData.salaryMin || formData.salaryMin <= 0) errors.salaryMin = '请输入最低薪资';
    if (!formData.salaryMax || formData.salaryMax <= formData.salaryMin) errors.salaryMax = '最高薪资必须大于最低薪资';
    if (!formData.city) errors.city = '请选择工作城市';
    if (!formData.experience) errors.experience = '请选择经验要求';
    if (!formData.education) errors.education = '请选择学历要求';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (selectedJob) {
        await jobApi.updateJob(selectedJob.id, formData);
        showMessage('success', '职位更新成功');
      } else {
        await jobApi.createJob(formData);
        showMessage('success', '职位发布成功');
      }
      setShowCreateModal(false);
      resetForm();
      navigate('/hr/jobs');
      loadJobs();
    } catch (error: any) {
      console.error('Failed to save job:', error);
      showMessage('error', error.response?.data?.message || '保存失败，请重试');
    }
  };

  const handleToggleStatus = async (job: Job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    const confirmMsg = newStatus === 'closed' ? '确定要关闭该职位吗？' : '确定要重新开启该职位吗？';
    if (!window.confirm(confirmMsg)) return;

    try {
      await jobApi.updateJob(job.id, { status: newStatus });
      showMessage('success', `职位已${newStatus === 'active' ? '开启' : '关闭'}`);
      loadJobs();
    } catch (error) {
      console.error('Failed to update job status:', error);
      showMessage('error', '操作失败');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">职位管理</h1>
        <Link
          to="/hr/jobs/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          发布职位
        </Link>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">状态筛选：</span>
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部</option>
              <option value="active">招聘中</option>
              <option value="closed">已关闭</option>
            </select>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">暂无职位</h3>
            <p className="text-gray-500 mb-4">
              {statusFilter === 'all' ? '还没有发布任何职位' : `暂无${statusFilter === 'active' ? '招聘中' : '已关闭'}的职位`}
            </p>
            <Link
              to="/hr/jobs/create"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              立即发布
            </Link>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {jobs.map(job => (
                <div key={job.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          to={`/jobs/${job.id}`}
                          target="_blank"
                          className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors"
                        >
                          {job.title}
                        </Link>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {job.status === 'active' ? '招聘中' : '已关闭'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                        <span className="text-blue-600 font-medium">
                          {job.salaryMin}K-{job.salaryMax}K
                        </span>
                        <span>·</span>
                        <span>{job.city}</span>
                        <span>·</span>
                        <span>{options.experienceLabels[job.experience as keyof typeof options.experienceLabels] || job.experience}</span>
                        <span>·</span>
                        <span>{options.educationLabels[job.education as keyof typeof options.educationLabels] || job.education}</span>
                        <span>·</span>
                        <span>{options.jobTypeLabels[job.type as keyof typeof options.jobTypeLabels] || job.type}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <span>浏览 {job.viewCount} 次</span>
                        <span>投递 {job.applyCount} 人</span>
                        <span>创建于 {formatDate(job.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadJobStats(job.id)}
                        className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                      >
                        数据统计
                      </button>
                      <Link
                        to={`/hr/applications?jobId=${job.id}`}
                        className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      >
                        查看简历
                      </Link>
                      <Link
                        to={`/hr/jobs/edit/${job.id}`}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(job)}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                          job.status === 'active'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {job.status === 'active' ? '关闭' : '开启'}
                      </button>
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
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          navigate('/hr/jobs');
          resetForm();
        }}
        title={selectedJob ? '编辑职位' : '发布职位'}
        maxWidth="3xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                职位名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.title ? 'border-red-500' : ''
                }`}
                placeholder="如：高级前端开发工程师"
              />
              {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最低薪资（K） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.salaryMin || ''}
                onChange={e => setFormData({ ...formData, salaryMin: parseInt(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.salaryMin ? 'border-red-500' : ''
                }`}
                placeholder="如：15"
              />
              {formErrors.salaryMin && <p className="text-red-500 text-sm mt-1">{formErrors.salaryMin}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最高薪资（K） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.salaryMax || ''}
                onChange={e => setFormData({ ...formData, salaryMax: parseInt(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.salaryMax ? 'border-red-500' : ''
                }`}
                placeholder="如：25"
              />
              {formErrors.salaryMax && <p className="text-red-500 text-sm mt-1">{formErrors.salaryMax}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">薪资类型</label>
              <select
                value={formData.salaryType}
                onChange={e => setFormData({ ...formData, salaryType: e.target.value as 'monthly' | 'annual' })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">月薪</option>
                <option value="annual">年薪</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                工作城市 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.city ? 'border-red-500' : ''
                }`}
              >
                <option value="">请选择</option>
                {options.cities.filter(c => c.value !== 'all').map(city => (
                  <option key={city.value} value={city.value}>{city.label}</option>
                ))}
              </select>
              {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                经验要求 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.experience}
                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.experience ? 'border-red-500' : ''
                }`}
              >
                <option value="">请选择</option>
                {options.experiences.filter(e => e.value !== 'all').map(exp => (
                  <option key={exp.value} value={exp.value}>{exp.label}</option>
                ))}
              </select>
              {formErrors.experience && <p className="text-red-500 text-sm mt-1">{formErrors.experience}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                学历要求 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.education}
                onChange={e => setFormData({ ...formData, education: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.education ? 'border-red-500' : ''
                }`}
              >
                <option value="">请选择</option>
                {options.educations.filter(e => e.value !== 'all').map(edu => (
                  <option key={edu.value} value={edu.value}>{edu.label}</option>
                ))}
              </select>
              {formErrors.education && <p className="text-red-500 text-sm mt-1">{formErrors.education}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">职位类型</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {options.jobTypes.filter(t => t.value !== 'all').map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">具体区域</label>
              <input
                type="text"
                value={formData.district}
                onChange={e => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：海淀区"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              职位描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.description ? 'border-red-500' : ''
              }`}
              placeholder="描述该职位的主要工作职责..."
            />
            {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任职要求 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.requirements}
              onChange={e => setFormData({ ...formData, requirements: e.target.value })}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.requirements ? 'border-red-500' : ''
              }`}
              placeholder="描述该职位的任职资格和技能要求..."
            />
            {formErrors.requirements && <p className="text-red-500 text-sm mt-1">{formErrors.requirements}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">福利待遇</label>
            <textarea
              value={formData.benefits}
              onChange={e => setFormData({ ...formData, benefits: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="描述公司提供的福利待遇，如：六险一金、弹性工作、年终奖金等"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={() => {
              setShowCreateModal(false);
              navigate('/hr/jobs');
              resetForm();
            }}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {selectedJob ? '更新职位' : '发布职位'}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        title="职位数据统计"
        maxWidth="lg"
      >
        {jobStats && selectedJob && (
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-800">{selectedJob.title}</h3>
              <p className="text-sm text-gray-500">{selectedJob.city} · {options.jobTypeLabels[selectedJob.type as keyof typeof options.jobTypeLabels]}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 mb-1">浏览次数</div>
                <div className="text-3xl font-bold text-blue-800">{jobStats.viewCount}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 mb-1">投递次数</div>
                <div className="text-3xl font-bold text-green-800">{jobStats.applyCount}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-3">投递状态分布</h4>
              <div className="space-y-3">
                {Object.entries(options.statusLabels).map(([status, label]) => {
                  const count = jobStats.applicationStats[status] || 0;
                  const total = jobStats.applyCount || 1;
                  const percentage = Math.round((count / total) * 100);
                  return (
                    <div key={status}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">{label}</span>
                        <span className="text-sm font-medium text-gray-800">{count} 人</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${options.statusColors[status as keyof typeof options.statusColors]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowStatsModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HRJobs;
