import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../types';
import { getOptions, jobApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

interface JobCardProps {
  job: Job;
  showFavorite?: boolean;
  onFavoriteChange?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, showFavorite = true, onFavoriteChange }) => {
  const options = getOptions();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const experienceLabel = options.experienceLabels[job.experience as keyof typeof options.experienceLabels] || job.experience;
  const typeLabel = options.jobTypeLabels[job.type as keyof typeof options.jobTypeLabels] || job.type;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || user.role !== 'jobseeker') return;
    
    setFavoriteLoading(true);
    try {
      const result = await jobApi.toggleFavorite(job.id);
      setIsFavorited(result.favorited);
      onFavoriteChange?.();
    } catch (error) {
      console.error('Toggle favorite failed:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <Link to={`/jobs/${job.id}`} className="block">
      <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer group">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                {job.title}
              </h3>
              {job.status === 'closed' && (
                <span className="badge bg-gray-100 text-gray-600">已关闭</span>
              )}
            </div>
            <div className="mt-2 flex items-center space-x-4">
              <span className="text-xl font-bold text-red-500">
                {job.salaryMin}K-{job.salaryMax}K
              </span>
              <span className="text-sm text-gray-500">· {job.city}</span>
              <span className="text-sm text-gray-500">· {experienceLabel}</span>
              <span className="badge bg-blue-50 text-blue-700">{typeLabel}</span>
            </div>
          </div>
          {showFavorite && user?.role === 'jobseeker' && (
            <button
              onClick={handleFavorite}
              disabled={favoriteLoading}
              className={`p-2 rounded-full transition-colors ${
                isFavorited
                  ? 'text-red-500 bg-red-50'
                  : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <svg className="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>
        <div className="mt-4 flex items-center space-x-3">
          {job.companyLogo && (
            <img src={job.companyLogo} alt={job.companyName} className="w-10 h-10 rounded-lg bg-gray-100" />
          )}
          {!job.companyLogo && (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-gray-500 font-medium text-sm">{job.companyName?.charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">{job.companyName}</p>
            <p className="text-xs text-gray-500">
              {job.industry} · {job.size}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
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
          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
