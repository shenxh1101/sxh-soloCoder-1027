import React from 'react';
import { getOptions } from '../utils/api';
import { FilterOptions } from '../types';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const options = getOptions();

  const handleChange = (key: keyof FilterOptions, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="card p-6 mb-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">关键词</label>
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索职位名称或描述..."
              value={filters.keyword}
              onChange={(e) => handleChange('keyword', e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">城市</label>
            <select
              value={filters.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="input"
            >
              {options.cities.map((city) => (
                <option key={city.value} value={city.value}>{city.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">薪资</label>
            <select
              value={filters.salary}
              onChange={(e) => handleChange('salary', e.target.value)}
              className="input"
            >
              {options.salaries.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">经验</label>
            <select
              value={filters.experience}
              onChange={(e) => handleChange('experience', e.target.value)}
              className="input"
            >
              {options.experiences.map((exp) => (
                <option key={exp.value} value={exp.value}>{exp.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">学历</label>
            <select
              value={filters.education}
              onChange={(e) => handleChange('education', e.target.value)}
              className="input"
            >
              {options.educations.map((edu) => (
                <option key={edu.value} value={edu.value}>{edu.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">类型</label>
          <div className="flex flex-wrap gap-2">
            {options.jobTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleChange('type', type.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filters.type === type.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
