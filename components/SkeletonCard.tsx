import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="bg-gray-300 w-full h-48"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-6"></div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-100">
            <div className="space-y-2 flex-grow pr-4">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-3 bg-gray-300 rounded w-32"></div>
            </div>
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-100">
             <div className="space-y-2 flex-grow pr-4">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
