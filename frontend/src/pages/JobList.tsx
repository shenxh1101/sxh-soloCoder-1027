import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';
import JobCard from '../components/JobCard';
import Pagination from '../components/Pagination';
import { Job, FilterOptions } from '../types';
import { jobApi } from '../utils/api';

const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<FilterOptions>({
    city: 'all',
    salary: 'all',
    experience: 'all',
    education: 'all',
    type: 'all',
    keyword: '',
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const result = await jobApi.getJobs({
        ...filters,
        page,
        pageSize,
      });
      setJobs(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters, page]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container-page py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">职位列表</h1>
          <p className="text-gray-500 mt-1">共找到 {total} 个职位</p>
        </div>

        <FilterBar filters={filters} onFilterChange={handleFilterChange} />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="card p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg">暂无符合条件的职位</p>
            <p className="text-gray-400 mt-2">试试调整筛选条件吧</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default JobList;
