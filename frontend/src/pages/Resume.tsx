import React, { useState, useEffect } from 'react';
import { Resume as ResumeType, WorkExperience, ProjectExperience } from '../types';
import { resumeApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { getOptions } from '../utils/api';

const options = getOptions();

const Resume: React.FC = () => {
  const { user } = useAuth();
  const [resume, setResume] = useState<ResumeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'work' | 'project' | 'attachment' | 'intention'>('basic');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [basicInfo, setBasicInfo] = useState({
    name: '',
    phone: '',
    email: '',
    gender: '' as 'male' | 'female' | '',
    birthday: '',
    currentCity: '',
    education: '',
    major: '',
    graduationYear: '',
    workYears: 0,
    selfIntroduction: '',
  });

  const [workExpForm, setWorkExpForm] = useState({
    id: '',
    company: '',
    position: '',
    startTime: '',
    endTime: '',
    isCurrent: false,
    description: '',
    salary: '',
  });

  const [projectExpForm, setProjectExpForm] = useState({
    id: '',
    name: '',
    role: '',
    startTime: '',
    endTime: '',
    description: '',
    technologies: '',
  });

  const [intention, setIntention] = useState({
    currentPosition: '',
    currentCompany: '',
    currentSalary: '',
    expectedSalary: '',
    expectedCity: '',
    expectedPosition: '',
  });

  const [editingWork, setEditingWork] = useState<WorkExperience | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectExperience | null>(null);

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    try {
      const data = await resumeApi.getMyResume();
      setResume(data);
      if (data) {
        setBasicInfo({
          name: data.name,
          phone: data.phone,
          email: data.email,
          gender: data.gender || '',
          birthday: data.birthday || '',
          currentCity: data.currentCity || '',
          education: data.education,
          major: data.major || '',
          graduationYear: data.graduationYear?.toString() || '',
          workYears: data.workYears,
          selfIntroduction: data.selfIntroduction || '',
        });
        setIntention({
          currentPosition: data.currentPosition || '',
          currentCompany: data.currentCompany || '',
          currentSalary: data.currentSalary || '',
          expectedSalary: data.expectedSalary || '',
          expectedCity: data.expectedCity || '',
          expectedPosition: data.expectedPosition || '',
        });
      } else if (user) {
        setBasicInfo(prev => ({
          ...prev,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
        }));
      }
    } catch (error) {
      console.error('Failed to load resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveBasic = async () => {
    if (!basicInfo.name || !basicInfo.phone || !basicInfo.email || !basicInfo.education) {
      showMessage('error', '请填写必填项（姓名、手机号、邮箱、学历）');
      return;
    }
    setSaving(true);
    try {
      const data = await resumeApi.saveResume({
        ...basicInfo,
        graduationYear: basicInfo.graduationYear ? parseInt(basicInfo.graduationYear) : undefined,
        gender: basicInfo.gender as 'male' | 'female' | undefined,
      });
      setResume(data);
      showMessage('success', '基本信息保存成功');
    } catch (error) {
      console.error('Failed to save:', error);
      showMessage('error', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWorkExp = async () => {
    if (!workExpForm.company || !workExpForm.position || !workExpForm.startTime || !workExpForm.description) {
      showMessage('error', '请填写必填项（公司、职位、开始时间、工作描述）');
      return;
    }
    if (!workExpForm.isCurrent && !workExpForm.endTime) {
      showMessage('error', '请填写结束时间或选择至今');
      return;
    }
    setSaving(true);
    try {
      await resumeApi.saveWorkExperience({
        ...workExpForm,
        id: editingWork?.id,
        isCurrent: workExpForm.isCurrent,
      });
      await loadResume();
      setWorkExpForm({ id: '', company: '', position: '', startTime: '', endTime: '', isCurrent: false, description: '', salary: '' });
      setEditingWork(null);
      showMessage('success', '工作经历保存成功');
    } catch (error) {
      console.error('Failed to save work experience:', error);
      showMessage('error', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProjectExp = async () => {
    if (!projectExpForm.name || !projectExpForm.role || !projectExpForm.startTime || !projectExpForm.description) {
      showMessage('error', '请填写必填项（项目名称、担任角色、开始时间、项目描述）');
      return;
    }
    setSaving(true);
    try {
      await resumeApi.saveProjectExperience({
        ...projectExpForm,
        id: editingProject?.id,
      });
      await loadResume();
      setProjectExpForm({ id: '', name: '', role: '', startTime: '', endTime: '', description: '', technologies: '' });
      setEditingProject(null);
      showMessage('success', '项目经历保存成功');
    } catch (error) {
      console.error('Failed to save project experience:', error);
      showMessage('error', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkExp = async (id: string) => {
    if (!window.confirm('确定要删除这条工作经历吗？')) return;
    try {
      await resumeApi.deleteWorkExperience(id);
      await loadResume();
      showMessage('success', '删除成功');
    } catch (error) {
      console.error('Failed to delete work experience:', error);
      showMessage('error', '删除失败');
    }
  };

  const handleDeleteProjectExp = async (id: string) => {
    if (!window.confirm('确定要删除这条项目经历吗？')) return;
    try {
      await resumeApi.deleteProjectExperience(id);
      await loadResume();
      showMessage('success', '删除成功');
    } catch (error) {
      console.error('Failed to delete project experience:', error);
      showMessage('error', '删除失败');
    }
  };

  const handleEditWorkExp = (exp: WorkExperience) => {
    setEditingWork(exp);
    setWorkExpForm({
      id: exp.id,
      company: exp.company,
      position: exp.position,
      startTime: exp.startTime,
      endTime: exp.endTime || '',
      isCurrent: !!exp.isCurrent,
      description: exp.description,
      salary: exp.salary || '',
    });
  };

  const handleEditProjectExp = (exp: ProjectExperience) => {
    setEditingProject(exp);
    setProjectExpForm({
      id: exp.id,
      name: exp.name,
      role: exp.role,
      startTime: exp.startTime,
      endTime: exp.endTime || '',
      description: exp.description,
      technologies: exp.technologies || '',
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showMessage('error', '文件大小不能超过10MB');
      return;
    }
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      showMessage('error', '仅支持 PDF、Word、TXT 格式');
      return;
    }
    setSaving(true);
    try {
      const data = await resumeApi.uploadResume(file);
      setResume(data.resume);
      showMessage('success', '附件上传成功');
    } catch (error) {
      console.error('Failed to upload:', error);
      showMessage('error', '上传失败，请重试');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async () => {
    if (!window.confirm('确定要删除附件简历吗？')) return;
    try {
      await resumeApi.deleteAttachment();
      await loadResume();
      showMessage('success', '删除成功');
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      showMessage('error', '删除失败');
    }
  };

  const handleSaveIntention = async () => {
    setSaving(true);
    try {
      const updatedResume = await resumeApi.patchResume(intention);
      setResume(updatedResume);
      showMessage('success', '求职意向保存成功');
    } catch (error) {
      console.error('Failed to save intention:', error);
      showMessage('error', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const tabs = [
    { key: 'basic', label: '基本信息' },
    { key: 'work', label: '工作经历' },
    { key: 'project', label: '项目经历' },
    { key: 'attachment', label: '附件简历' },
    { key: 'intention', label: '求职意向' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">我的简历</h1>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex border-b">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={basicInfo.name}
                    onChange={e => setBasicInfo({ ...basicInfo, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">手机号 <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={basicInfo.phone}
                    onChange={e => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={basicInfo.email}
                    onChange={e => setBasicInfo({ ...basicInfo, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
                  <select
                    value={basicInfo.gender}
                    onChange={e => setBasicInfo({ ...basicInfo, gender: e.target.value as 'male' | 'female' | '' })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择</option>
                    <option value="male">男</option>
                    <option value="female">女</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">出生日期</label>
                  <input
                    type="date"
                    value={basicInfo.birthday}
                    onChange={e => setBasicInfo({ ...basicInfo, birthday: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">所在城市</label>
                  <select
                    value={basicInfo.currentCity}
                    onChange={e => setBasicInfo({ ...basicInfo, currentCity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择</option>
                    {options.cities.filter(c => c.value !== 'all').map(city => (
                      <option key={city.value} value={city.value}>{city.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学历 <span className="text-red-500">*</span></label>
                  <select
                    value={basicInfo.education}
                    onChange={e => setBasicInfo({ ...basicInfo, education: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择</option>
                    {options.educations.filter(e => e.value !== 'all').map(edu => (
                      <option key={edu.value} value={edu.value}>{edu.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">专业</label>
                  <input
                    type="text"
                    value={basicInfo.major}
                    onChange={e => setBasicInfo({ ...basicInfo, major: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：计算机科学与技术"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">毕业年份</label>
                  <input
                    type="number"
                    min="1980"
                    max="2030"
                    value={basicInfo.graduationYear}
                    onChange={e => setBasicInfo({ ...basicInfo, graduationYear: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：2020"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">工作年限（年）</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={basicInfo.workYears}
                    onChange={e => setBasicInfo({ ...basicInfo, workYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">自我介绍</label>
                <textarea
                  value={basicInfo.selfIntroduction}
                  onChange={e => setBasicInfo({ ...basicInfo, selfIntroduction: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="简要介绍自己的专业背景、技能特长等"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveBasic}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'work' && (
            <div className="space-y-6">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium text-gray-800 mb-4">
                  {editingWork ? '编辑工作经历' : '添加工作经历'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">公司名称 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={workExpForm.company}
                      onChange={e => setWorkExpForm({ ...workExpForm, company: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">职位 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={workExpForm.position}
                      onChange={e => setWorkExpForm({ ...workExpForm, position: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">开始时间 <span className="text-red-500">*</span></label>
                    <input
                      type="month"
                      value={workExpForm.startTime}
                      onChange={e => setWorkExpForm({ ...workExpForm, startTime: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                    <input
                      type="month"
                      value={workExpForm.endTime}
                      onChange={e => setWorkExpForm({ ...workExpForm, endTime: e.target.value })}
                      disabled={workExpForm.isCurrent}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={workExpForm.isCurrent}
                        onChange={e => setWorkExpForm({ ...workExpForm, isCurrent: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">至今仍在该公司工作</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">薪资（月薪）</label>
                    <input
                      type="text"
                      value={workExpForm.salary}
                      onChange={e => setWorkExpForm({ ...workExpForm, salary: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="如：15K-20K"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">工作描述 <span className="text-red-500">*</span></label>
                  <textarea
                    value={workExpForm.description}
                    onChange={e => setWorkExpForm({ ...workExpForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="描述你的工作职责、主要业绩和技能应用"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveWorkExp}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                  {editingWork && (
                    <button
                      onClick={() => {
                        setEditingWork(null);
                        setWorkExpForm({ id: '', company: '', position: '', startTime: '', endTime: '', isCurrent: false, description: '', salary: '' });
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      取消
                    </button>
                  )}
                </div>
              </div>

              {resume?.workExperiences && resume.workExperiences.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">已添加的工作经历</h3>
                  {resume.workExperiences.map(exp => (
                    <div key={exp.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-800">{exp.position} · {exp.company}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {exp.startTime} - {exp.isCurrent ? '至今' : exp.endTime}
                          </div>
                          {exp.salary && <div className="text-sm text-blue-600 mt-1">薪资：{exp.salary}</div>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditWorkExp(exp)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteWorkExp(exp.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mt-3 whitespace-pre-wrap">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'project' && (
            <div className="space-y-6">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium text-gray-800 mb-4">
                  {editingProject ? '编辑项目经历' : '添加项目经历'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">项目名称 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={projectExpForm.name}
                      onChange={e => setProjectExpForm({ ...projectExpForm, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">担任角色 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={projectExpForm.role}
                      onChange={e => setProjectExpForm({ ...projectExpForm, role: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="如：前端开发、项目经理"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">开始时间 <span className="text-red-500">*</span></label>
                    <input
                      type="month"
                      value={projectExpForm.startTime}
                      onChange={e => setProjectExpForm({ ...projectExpForm, startTime: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                    <input
                      type="month"
                      value={projectExpForm.endTime}
                      onChange={e => setProjectExpForm({ ...projectExpForm, endTime: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">技术栈</label>
                    <input
                      type="text"
                      value={projectExpForm.technologies}
                      onChange={e => setProjectExpForm({ ...projectExpForm, technologies: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="如：React, TypeScript, Node.js"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">项目描述 <span className="text-red-500">*</span></label>
                  <textarea
                    value={projectExpForm.description}
                    onChange={e => setProjectExpForm({ ...projectExpForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="描述项目背景、你的职责、主要成果和技术亮点"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProjectExp}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                  {editingProject && (
                    <button
                      onClick={() => {
                        setEditingProject(null);
                        setProjectExpForm({ id: '', name: '', role: '', startTime: '', endTime: '', description: '', technologies: '' });
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      取消
                    </button>
                  )}
                </div>
              </div>

              {resume?.projectExperiences && resume.projectExperiences.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">已添加的项目经历</h3>
                  {resume.projectExperiences.map(exp => (
                    <div key={exp.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-800">{exp.name} · {exp.role}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {exp.startTime} - {exp.endTime || '至今'}
                          </div>
                          {exp.technologies && (
                            <div className="text-sm text-gray-600 mt-1">
                              技术栈：{exp.technologies}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProjectExp(exp)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteProjectExp(exp.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mt-3 whitespace-pre-wrap">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'attachment' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm mb-4">
                上传附件简历，支持 PDF、Word、TXT 格式，文件大小不超过 10MB
              </p>
              
              {resume?.attachmentUrl ? (
                <div className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{resume.attachmentName}</div>
                        <div className="text-sm text-gray-500">已上传</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`http://localhost:3001${resume.attachmentUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        查看
                      </a>
                      <button
                        onClick={handleDeleteAttachment}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="resume-upload"
                    onChange={handleUpload}
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-gray-600">点击或拖拽文件到此处上传</p>
                    <p className="text-sm text-gray-400 mt-1">支持 PDF、DOC、DOCX、TXT 格式</p>
                  </label>
                </div>
              )}
            </div>
          )}

          {activeTab === 'intention' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">当前职位</label>
                  <input
                    type="text"
                    value={intention.currentPosition}
                    onChange={e => setIntention({ ...intention, currentPosition: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：高级前端工程师"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">当前公司</label>
                  <input
                    type="text"
                    value={intention.currentCompany}
                    onChange={e => setIntention({ ...intention, currentCompany: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">当前薪资（月薪）</label>
                  <input
                    type="text"
                    value={intention.currentSalary}
                    onChange={e => setIntention({ ...intention, currentSalary: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：20K-30K"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">期望薪资</label>
                  <input
                    type="text"
                    value={intention.expectedSalary}
                    onChange={e => setIntention({ ...intention, expectedSalary: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：25K-35K"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">期望城市</label>
                  <select
                    value={intention.expectedCity}
                    onChange={e => setIntention({ ...intention, expectedCity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择</option>
                    {options.cities.filter(c => c.value !== 'all').map(city => (
                      <option key={city.value} value={city.value}>{city.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">期望职位</label>
                  <input
                    type="text"
                    value={intention.expectedPosition}
                    onChange={e => setIntention({ ...intention, expectedPosition: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：前端开发工程师"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveIntention}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resume;
