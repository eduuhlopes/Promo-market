import React from 'react';
import { ProductPrice } from '../types';

interface SupermarketInfoModalProps {
  info: ProductPrice;
  onClose: () => void;
}

const SupermarketInfoModal: React.FC<SupermarketInfoModalProps> = ({ info, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm m-4 p-6 relative animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center">
            <img 
                src={info.supermarketLogoUrl} 
                alt={`${info.supermarket} logo`} 
                className="w-20 h-20 object-contain rounded-full mb-4 bg-white shadow-md p-2"
            />
            <h3 className="text-2xl font-bold text-gray-800">{info.supermarket}</h3>
            
            <div className="mt-6 w-full text-left space-y-4">
                {info.address && (
                    <div className="flex items-start">
                        <i className="fa-solid fa-location-dot text-orange-500 mt-1 mr-3 w-4 text-center"></i>
                        <div>
                            <h4 className="font-semibold text-gray-500">Endereço</h4>
                            <p className="text-gray-700">{info.address}</p>
                        </div>
                    </div>
                )}
                {info.openingHours && (
                    <div className="flex items-start">
                        <i className="fa-solid fa-clock text-orange-500 mt-1 mr-3 w-4 text-center"></i>
                        <div>
                            <h4 className="font-semibold text-gray-500">Horário</h4>
                            <p className="text-gray-700">{info.openingHours}</p>
                        </div>
                    </div>
                )}
                {!info.address && !info.openingHours && (
                    <p className="text-center text-gray-500 italic mt-4">Nenhuma informação adicional disponível.</p>
                )}
            </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SupermarketInfoModal;