import React, { useState, useEffect } from 'react';
import { Interview } from '../types';
import { interviewApi, hrApi } from '../utils/api';
import { getOptions } from '../utils/api';
import Modal from '../components/Modal';
import { Link } from 'react-router-dom';

const options = getOptions();

const HRInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [editForm, setEditForm] = useState({
    type: 'phone' as 'phone' | 'onsite' | 'video',
    dateTime: '',
    location: '',
    notes: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'no_show',
  });

  const [resultForm, setResultForm] = useState({
    result: 'pending' as 'pass' | 'fail' | 'pending',
    notes: '',
  });

  const [jobs, setJobs] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    loadData();
    loadJobs();
  }, [statusFilter]);

  const loadJobs = async () => {
    try {
      const data = await hrApi.getMyJobs({ status: 'active', pageSize: 100 });
      setJobs(data.list.map(j => ({ id: j.id, title: j.title })));
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const loadData = async () => {
    try {
      let data = await interviewApi.getMyInterviews();
      if (statusFilter !== 'all') {
        data = data.filter(i => i.status === statusFilter);
      }
      data.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
      setInterviews(data);
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleEdit = (interview: Interview) => {
    setSelectedInterview(interview);
    setEditForm({
      type: interview.type,
      dateTime: interview.dateTime.slice(0, 16),
      location: interview.location || '',
      notes: interview.notes || '',
      status: interview.status,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedInterview || !editForm.dateTime) {
      showMessage('error', '请填写面试时间');
      return;
    }
    try {
      await interviewApi.updateInterview(selectedInterview.id, {
        type: editForm.type,
        dateTime: editForm.dateTime,
        location: editForm.location || undefined,
        notes: editForm.notes || undefined,
        status: editForm.status,
      });
      showMessage('success', '面试信息更新成功');
      setShowEditModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to update interview:', error);
      showMessage('error', '更新失败');
    }
  };

  const handleUpdateResult = (interview: Interview) => {
    setSelectedInterview(interview);
    setResultForm({
      result: interview.result || 'pending',
      notes: interview.notes || '',
    });
    setShowResultModal(true);
  };

  const handleSaveResult = async () => {
    if (!selectedInterview) return;
    try {
      await interviewApi.updateInterview(selectedInterview.id, {
        result: resultForm.result,
        status: 'completed',
        notes: resultForm.notes || undefined,
      });
      showMessage('success', '面试结果已记录');
      setShowResultModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to update result:', error);
      showMessage('error', '保存失败');
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'no_show': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (result?: string) => {
    switch (result) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'fail': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isUpcoming = (dateStr: string) => {
    return new Date(dateStr) > new Date();
  };

  const statusTabs = [
    { key: 'all', label: '全部' },
    { key: 'scheduled', label: '待面试' },
    { key: 'completed', label: '已完成' },
    { key: 'cancelled', label: '已取消' },
    { key: 'no_show', label: '未出席' },
  ];

  const upcomingCount = interviews.filter(i => isUpcoming(i.dateTime) && i.status === 'scheduled').length;
  const todayCount = interviews.filter(i => {
    const interviewDate = new Date(i.dateTime).toDateString();
    const today = new Date().toDateString();
    return interviewDate === today && i.status === 'scheduled';
  }).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">面试管理</h1>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">今日面试</p>
              <p className="text-2xl font-bold text-gray-800">{todayCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">待面试</p>
              <p className="text-2xl font-bold text-gray-800">{upcomingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">总面试数</p>
              <p className="text-2xl font-bold text-gray-800">{interviews.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="flex border-b overflow-x-auto">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
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

        {interviews.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">暂无面试安排</h3>
            <p className="text-gray-500 mb-4">
              {statusFilter === 'all' ? '还没有安排任何面试' : `暂无${statusTabs.find(t => t.key === statusFilter)?.label}的面试`}
            </p>
            <Link
              to="/hr/applications"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              去筛选简历
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {interviews.map(interview => (
              <div key={interview.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        interview.type === 'onsite' ? 'bg-blue-100 text-blue-600' :
                        interview.type === 'video' ? 'bg-purple-100 text-purple-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {interview.type === 'onsite' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                        {interview.type === 'video' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                        {interview.type === 'phone' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{interview.userName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                            {options.interviewStatusLabels[interview.status]}
                          </span>
                          {interview.result && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getResultColor(interview.result)}`}>
                              {options.interviewResultLabels[interview.result]}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          面试职位：
                          <Link
                            to={`/jobs/${interview.jobId}`}
                            target="_blank"
                            className="text-blue-600 hover:underline ml-1"
                          >
                            {interview.title}
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 ml-13">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDateTime(interview.dateTime)}
                        {isUpcoming(interview.dateTime) && interview.status === 'scheduled' && (
                          <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                            即将开始
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">面试类型：</span>
                        {options.interviewTypeLabels[interview.type]}
                      </div>
                      {interview.location && (
                        <div className="md:col-span-2">
                          <span className="text-gray-500">地点/方式：</span>
                          {interview.location}
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">联系方式：</span>
                        {interview.userPhone}
                      </div>
                      <div>
                        <span className="text-gray-500">邮箱：</span>
                        {interview.userEmail}
                      </div>
                    </div>
                    {interview.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600 ml-13">
                        <span className="font-medium">备注：</span>{interview.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {interview.status === 'scheduled' && isUpcoming(interview.dateTime) && (
                      <button
                        onClick={() => handleEdit(interview)}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        编辑
                      </button>
                    )}
                    {(interview.status === 'scheduled' || interview.status === 'completed') && !interview.result && (
                      <button
                        onClick={() => handleUpdateResult(interview)}
                        className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      >
                        记录结果
                      </button>
                    )}
                    {interview.status === 'scheduled' && (
                      <button
                        onClick={async () => {
                          if (!window.confirm('确定要取消该面试吗？')) return;
                          try {
                            await interviewApi.updateInterview(interview.id, { status: 'cancelled' });
                            showMessage('success', '面试已取消');
                            loadData();
                          } catch (error) {
                            console.error('Failed to cancel interview:', error);
                            showMessage('error', '取消失败');
                          }
                        }}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        取消
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="编辑面试"
        maxWidth="lg"
      >
        {selectedInterview && (
          <div>
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                编辑 <span className="font-medium text-gray-800">{selectedInterview.userName}</span> 的面试安排
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">面试类型</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(options.interviewTypeLabels).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => setEditForm({ ...editForm, type: value as any })}
                        className={`p-3 border rounded-md text-center transition-colors ${
                          editForm.type === value
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
                    value={editForm.dateTime}
                    onChange={e => setEditForm({ ...editForm, dateTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {editForm.type === 'onsite' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">面试地点</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="如：北京市海淀区中关村大厦A座10层"
                    />
                  </div>
                )}
                {editForm.type === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">会议链接/方式</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="如：腾讯会议，会议号：123-456-789"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">面试状态</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(options.interviewStatusLabels).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => setEditForm({ ...editForm, status: value as any })}
                        className={`p-2 border rounded-md text-center text-sm transition-colors ${
                          editForm.status === value
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">面试备注</label>
                  <textarea
                    value={editForm.notes}
                    onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="面试注意事项、需要考察的重点等..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title="记录面试结果"
        maxWidth="lg"
      >
        {selectedInterview && (
          <div>
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                记录 <span className="font-medium text-gray-800">{selectedInterview.userName}</span> 的面试结果
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">面试结果</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(options.interviewResultLabels).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => setResultForm({ ...resultForm, result: value as any })}
                        className={`p-3 border rounded-md text-center transition-colors ${
                          resultForm.result === value
                            ? value === 'pass' ? 'border-green-500 bg-green-50 text-green-700' :
                              value === 'fail' ? 'border-red-500 bg-red-50 text-red-700' :
                              'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">评价备注</label>
                  <textarea
                    value={resultForm.notes}
                    onChange={e => setResultForm({ ...resultForm, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="记录候选人的优缺点、技术能力、沟通能力等评价..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResultModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveResult}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                保存结果
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HRInterviews;
