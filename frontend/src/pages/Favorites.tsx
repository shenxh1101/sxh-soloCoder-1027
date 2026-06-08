import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Favorite } from '../types';
import { jobApi, getOptions } from '../utils/api';

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const options = getOptions();

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const data = await jobApi.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await jobApi.toggleFavorite(jobId);
      setFavorites(favorites.filter(f => f.jobId !== jobId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container-page py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">我的收藏</h1>
          <p className="text-gray-500 mt-1">共收藏 {favorites.length} 个职位</p>
        </div>

        {favorites.length === 0 ? (
          <div className="card p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-gray-500 text-lg">暂无收藏的职位</p>
            <p className="text-gray-400 mt-2">看到感兴趣的职位，点击爱心即可收藏</p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => {
              const experienceLabel = options.experienceLabels[favorite.experience as keyof typeof options.experienceLabels] || favorite.experience;
              const typeLabel = options.jobTypeLabels[favorite.type as keyof typeof options.jobTypeLabels] || favorite.type;

              return (
                <div key={favorite.id} className="card p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <a href={`/jobs/${favorite.jobId}`} className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate">
                          {favorite.title}
                        </h3>
                        <span className="badge bg-blue-50 text-blue-700">{typeLabel}</span>
                      </div>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="text-xl font-bold text-red-500">
                          {favorite.salaryMin}K-{favorite.salaryMax}K
                        </span>
                        <span className="text-sm text-gray-500">· {favorite.city}</span>
                        <span className="text-sm text-gray-500">· {experienceLabel}</span>
                      </div>
                      <div className="mt-3 flex items-center space-x-3">
                        {favorite.companyLogo && (
                          <img src={favorite.companyLogo} alt={favorite.companyName} className="w-8 h-8 rounded-lg bg-gray-100" />
                        )}
                        {!favorite.companyLogo && (
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-500 font-medium text-xs">{favorite.companyName?.charAt(0)}</span>
                          </div>
                        )}
                        <span className="text-sm text-gray-700">{favorite.companyName}</span>
                      </div>
                    </a>
                    <button
                      onClick={(e) => handleRemoveFavorite(favorite.jobId, e)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="取消收藏"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    收藏于 {new Date(favorite.createdAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
