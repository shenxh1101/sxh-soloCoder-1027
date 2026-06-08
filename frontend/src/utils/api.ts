import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import {
  User, Company, Job, Resume, Application, Interview, Favorite,
  AuthResponse, PaginatedResponse, HRStats, JobStats
} from '../types';

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    role: 'jobseeker' | 'hr';
    name: string;
    phone?: string;
    companyName?: string;
    industry?: string;
    size?: string;
    companyAddress?: string;
    companyDescription?: string;
  }) => api.post<AuthResponse>('/auth/register', data).then(res => res.data),

  login: (data: { email: string; password: string; role: 'jobseeker' | 'hr' }) =>
    api.post<AuthResponse>('/auth/login', data).then(res => res.data),

  getMe: () => api.get<{ user: User; company?: Company }>('/auth/me').then(res => res.data),

  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
    api.put<User>('/auth/profile', data).then(res => res.data),
};

export const jobApi = {
  getJobs: (params: {
    keyword?: string;
    city?: string;
    salary?: string;
    experience?: string;
    education?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  }) => api.get<PaginatedResponse<Job>>('/jobs', { params }).then(res => res.data),

  getJobDetail: (id: string) => api.get<Job>(`/jobs/${id}`).then(res => res.data),

  createJob: (data: Partial<Job>) => api.post<Job>('/jobs', data).then(res => res.data),

  updateJob: (id: string, data: Partial<Job>) => api.put<Job>(`/jobs/${id}`, data).then(res => res.data),

  toggleFavorite: (jobId: string) =>
    api.post<{ favorited: boolean }>(`/jobs/${jobId}/favorite`).then(res => res.data),

  getFavorites: () => api.get<Favorite[]>('/jobs/favorites/list').then(res => res.data),

  applyJob: (jobId: string) => api.post<Application>(`/jobs/${jobId}/apply`).then(res => res.data),
};

export const resumeApi = {
  getMyResume: () => api.get<Resume | null>('/resumes/my').then(res => res.data),

  saveResume: (data: Partial<Resume>) => api.post<Resume>('/resumes', data).then(res => res.data),

  patchResume: (data: Partial<Resume>) => api.patch<Resume>('/resumes/my', data).then(res => res.data),

  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string; name: string; resume: Resume }>('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);
  },

  deleteAttachment: () => api.delete<{ success: boolean }>('/resumes/attachment').then(res => res.data),

  saveWorkExperience: (data: Partial<{
    id?: string;
    company: string;
    position: string;
    startTime: string;
    endTime?: string;
    isCurrent: boolean;
    description: string;
    salary?: string;
  }>) => api.post('/resumes/work-experience', data).then(res => res.data),

  deleteWorkExperience: (id: string) =>
    api.delete<{ success: boolean }>(`/resumes/work-experience/${id}`).then(res => res.data),

  saveProjectExperience: (data: Partial<{
    id?: string;
    name: string;
    role: string;
    startTime: string;
    endTime?: string;
    description: string;
    technologies?: string;
  }>) => api.post('/resumes/project-experience', data).then(res => res.data),

  deleteProjectExperience: (id: string) =>
    api.delete<{ success: boolean }>(`/resumes/project-experience/${id}`).then(res => res.data),

  getResumeById: (id: string) => api.get<Resume>(`/resumes/${id}`).then(res => res.data),
};

export const applicationApi = {
  getMyApplications: (status?: string) =>
    api.get<Application[]>('/applications/my', { params: { status } }).then(res => res.data),

  updateStatus: (id: string, data: { status: string; hrNotes?: string }) =>
    api.put<Application>(`/applications/${id}/status`, data).then(res => res.data),

  getStats: () => api.get<Record<string, number>>('/applications/stats').then(res => res.data),
};

export const interviewApi = {
  createInterview: (data: {
    applicationId: string;
    type: 'phone' | 'onsite' | 'video';
    dateTime: string;
    location?: string;
    notes?: string;
  }) => api.post<Interview>('/interviews', data).then(res => res.data),

  getMyInterviews: () => api.get<Interview[]>('/interviews/my').then(res => res.data),

  updateInterview: (id: string, data: { type?: string; dateTime?: string; location?: string; status?: string; result?: string; notes?: string }) =>
    api.put<Interview>(`/interviews/${id}`, data).then(res => res.data),
};

export const hrApi = {
  getMyJobs: (params: { status?: string; page?: number; pageSize?: number }) =>
    api.get<PaginatedResponse<Job>>('/hr/jobs', { params }).then(res => res.data),

  getApplications: (params: {
    jobId?: string;
    status?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) => api.get<PaginatedResponse<Application>>('/hr/applications', { params }).then(res => res.data),

  getStats: () => api.get<HRStats>('/hr/stats').then(res => res.data),

  getJobStats: (jobId: string) => api.get<JobStats>(`/hr/job/${jobId}/stats`).then(res => res.data),
};

export const getOptions = () => ({
  cities: [
    { label: '不限', value: 'all' },
    { label: '北京', value: '北京' },
    { label: '上海', value: '上海' },
    { label: '广州', value: '广州' },
    { label: '深圳', value: '深圳' },
    { label: '杭州', value: '杭州' },
    { label: '成都', value: '成都' },
    { label: '武汉', value: '武汉' },
    { label: '西安', value: '西安' },
    { label: '南京', value: '南京' },
    { label: '苏州', value: '苏州' },
    { label: '重庆', value: '重庆' },
    { label: '天津', value: '天津' },
    { label: '青岛', value: '青岛' },
    { label: '大连', value: '大连' },
    { label: '厦门', value: '厦门' },
    { label: '其他', value: '其他' },
  ],
  salaries: [
    { label: '不限', value: 'all' },
    { label: '10K以下', value: '0-10' },
    { label: '10K-20K', value: '10-20' },
    { label: '20K-40K', value: '20-40' },
    { label: '40K-60K', value: '40-60' },
    { label: '60K以上', value: '60-' },
  ],
  experiences: [
    { label: '不限', value: 'all' },
    { label: '应届生', value: 'fresh' },
    { label: '1-3年', value: '1-3' },
    { label: '3-5年', value: '3-5' },
    { label: '5-10年', value: '5-10' },
    { label: '10年以上', value: '10+' },
  ],
  educations: [
    { label: '不限', value: 'all' },
    { label: '大专', value: 'college' },
    { label: '本科', value: 'bachelor' },
    { label: '硕士', value: 'master' },
    { label: '博士', value: 'doctor' },
  ],
  jobTypes: [
    { label: '不限', value: 'all' },
    { label: '全职', value: 'fulltime' },
    { label: '兼职', value: 'parttime' },
    { label: '实习', value: 'internship' },
    { label: '远程', value: 'remote' },
  ],
  companySizes: [
    { label: '0-20人', value: '0-20' },
    { label: '20-99人', value: '20-99' },
    { label: '100-499人', value: '100-499' },
    { label: '500-999人', value: '500-999' },
    { label: '1000人以上', value: '1000+' },
  ],
  industries: [
    '互联网', '金融', '教育', '医疗健康', '电子商务', '游戏',
    '人工智能', '新能源', '汽车', '房地产', '咨询', '法律',
    '媒体', '广告营销', '其他',
  ],
  statusLabels: {
    applied: '已投递',
    pending: '待沟通',
    interview: '面试',
    hired: '录用',
    rejected: '拒绝',
  },
  statusColors: {
    applied: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    interview: 'bg-purple-100 text-purple-800',
    hired: 'bg-green-100 text-green-800',
    rejected: 'bg-gray-100 text-gray-800',
  },
  educationLabels: {
    college: '大专',
    bachelor: '本科',
    master: '硕士',
    doctor: '博士',
  },
  experienceLabels: {
    fresh: '应届生',
    '1-3': '1-3年',
    '3-5': '3-5年',
    '5-10': '5-10年',
    '10+': '10年以上',
  },
  jobTypeLabels: {
    fulltime: '全职',
    parttime: '兼职',
    internship: '实习',
    remote: '远程',
  },
  interviewTypeLabels: {
    phone: '电话面试',
    onsite: '现场面试',
    video: '视频面试',
  },
  interviewStatusLabels: {
    scheduled: '已安排',
    completed: '已完成',
    cancelled: '已取消',
    no_show: '未出席',
  },
  interviewResultLabels: {
    pass: '通过',
    fail: '未通过',
    pending: '待定',
  },
});

export default api;
