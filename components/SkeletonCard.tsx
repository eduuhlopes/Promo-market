import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="bg-gray-300 w-full h-48"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="mt-4 flex justify-between items-center">
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;