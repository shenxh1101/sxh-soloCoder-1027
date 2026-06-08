export type UserRole = 'jobseeker' | 'hr';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  avatar?: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  size: string;
  description: string;
  address: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  salaryMin: number;
  salaryMax: number;
  salaryType: 'monthly' | 'annual';
  city: string;
  district?: string;
  experience: string;
  education: string;
  type: string;
  companyId: string;
  hrId: string;
  viewCount: number;
  applyCount: number;
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
  companyName?: string;
  companyLogo?: string;
  industry?: string;
  size?: string;
  companyDescription?: string;
  companyAddress?: string;
  companyWebsite?: string;
}

export interface Resume {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  gender?: 'male' | 'female';
  birthday?: string;
  currentCity?: string;
  education: string;
  major?: string;
  graduationYear?: number;
  workYears: number;
  currentPosition?: string;
  currentCompany?: string;
  currentSalary?: string;
  expectedSalary?: string;
  expectedCity?: string;
  expectedPosition?: string;
  selfIntroduction?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  workExperiences?: WorkExperience[];
  projectExperiences?: ProjectExperience[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperience {
  id: string;
  resumeId: string;
  company: string;
  position: string;
  startTime: string;
  endTime?: string;
  isCurrent: number;
  description: string;
  salary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectExperience {
  id: string;
  resumeId: string;
  name: string;
  role: string;
  startTime: string;
  endTime?: string;
  description: string;
  technologies?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 'applied' | 'pending' | 'interview' | 'hired' | 'rejected';

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  resumeId: string;
  status: ApplicationStatus;
  hrNotes?: string;
  appliedAt: string;
  updatedAt: string;
  title?: string;
  salaryMin?: number;
  salaryMax?: number;
  city?: string;
  experience?: string;
  type?: string;
  companyName?: string;
  companyLogo?: string;
  applicantName?: string;
  applicantPhone?: string;
  applicantEmail?: string;
  education?: string;
  workYears?: number;
  currentPosition?: string;
  currentCompany?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  userId: string;
  hrId: string;
  type: 'phone' | 'onsite' | 'video';
  dateTime: string;
  location?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  result?: 'pass' | 'fail' | 'pending';
  createdAt: string;
  updatedAt: string;
  title?: string;
  companyName?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

export interface Favorite {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
  title?: string;
  salaryMin?: number;
  salaryMax?: number;
  city?: string;
  experience?: string;
  type?: string;
  companyName?: string;
  companyLogo?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  company?: Company;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FilterOptions {
  city: string;
  salary: string;
  experience: string;
  education: string;
  type: string;
  keyword: string;
}

export interface HRStats {
  totalViews: number;
  totalApplies: number;
  totalJobs: number;
  applicationsByStatus: Record<string, number>;
  topJobs: Array<{
    id: string;
    title: string;
    viewCount: number;
    applyCount: number;
  }>;
}

export interface JobStats {
  viewCount: number;
  applyCount: number;
  applicationStats: Record<string, number>;
}
