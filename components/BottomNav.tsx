
import React from 'react';
import { View } from '../types';

interface BottomNavProps {
  activeView: View;
  onNavigate: (view: View) => void;
  listCount: number;
}

const NavButton: React.FC<{
  iconClass: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
}> = ({ iconClass, label, isActive, onClick, badgeCount }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-300 ${
      isActive ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'
    }`}
  >
    <div className="relative">
      <i className={`fa-solid ${iconClass} text-2xl`}></i>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {badgeCount}
        </span>
      )}
    </div>
    <span className={`text-xs mt-1 font-bold ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity`}>{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate, listCount }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around items-center max-w-2xl mx-auto">
      <NavButton
        iconClass="fa-magnifying-glass"
        label="Buscar"
        isActive={activeView === View.SEARCH}
        onClick={() => onNavigate(View.SEARCH)}
      />
      <NavButton
        iconClass="fa-clipboard-list"
        label="Lista"
        isActive={activeView === View.LIST}
        onClick={() => onNavigate(View.LIST)}
        badgeCount={listCount}
      />
    </div>
  );
};

export default BottomNav;
