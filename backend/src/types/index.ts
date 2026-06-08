export type UserRole = 'jobseeker' | 'hr';

export interface User {
  id: string;
  email: string;
  password: string;
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
}

export interface Favorite {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
}

export interface JobView {
  id: string;
  jobId: string;
  userId?: string;
  viewedAt: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
  company?: Company;
}
