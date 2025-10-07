import React, { useMemo } from 'react';
import { Product, ProductPrice } from '../types';
import PlusIcon from './icons/PlusIcon';
import InfoIcon from './icons/InfoIcon';

interface ProductCardProps {
  product: Product;
  onAddItem: (product: Product, price: ProductPrice) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenModal: (info: ProductPrice) => void;
  isDetailsLoading: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddItem, isExpanded, onToggleExpand, onOpenModal, isDetailsLoading }) => {
  const bestPriceInfo = useMemo(() => {
    if (!product.prices || product.prices.length === 0) {
      return null;
    }
    return product.prices.reduce((min, p) => (p.price < min.price ? p : min), product.prices[0]);
  }, [product.prices]);

  const handleGoToSite = (url: string, supermarketName: string) => {
    if (window.confirm(`Você será redirecionado para a página do produto no site do ${supermarketName}. Deseja continuar?`)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand();
  };
  
  const handleContentClick = (e: React.MouseEvent) => {
      e.stopPropagation();
  };

  const renderExpandedContent = () => {
    if (isDetailsLoading) {
      return (
        <div className="flex items-center justify-center p-6 text-gray-500">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Buscando preços...
        </div>
      );
    }

    if (!product.prices || product.prices.length === 0) {
      return <p className="p-4 text-center text-gray-500">Nenhum preço encontrado para este produto.</p>;
    }

    return (
      <div className="space-y-2">
        {product.prices.sort((a, b) => a.price - b.price).map((priceInfo) => (
          <div 
            key={priceInfo.supermarket} 
            onClick={() => handleGoToSite(priceInfo.productUrl, priceInfo.supermarket)}
            className={`flex items-center p-3 rounded-lg transition-all duration-300 cursor-pointer ${priceInfo === bestPriceInfo ? 'bg-green-100 border-2 border-green-500 hover:bg-green-200' : 'bg-gray-50 hover:bg-gray-100'}`}
          >
            <img src={priceInfo.supermarketLogoUrl} alt={priceInfo.supermarket} className="w-10 h-10 object-contain rounded-full mr-4 bg-white shadow-sm" />
            <div className="flex-grow">
                <div className="flex items-center gap-1.5">
                    <p className={`font-semibold ${priceInfo === bestPriceInfo ? 'text-green-800' : 'text-gray-600'}`}>
                    {priceInfo.supermarket}
                    </p>
                    <button 
                        onClick={(e) => {
                        e.stopPropagation();
                        onOpenModal(priceInfo);
                        }}
                        className="text-gray-400 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors"
                        aria-label={`Ver informações de ${priceInfo.supermarket}`}
                    >
                        <InfoIcon className="w-5 h-5" />
                    </button>
                </div>
                {priceInfo.promotion && (
                <p className="text-sm text-red-600 font-bold">{priceInfo.promotion}</p>
                )}
            </div>
            <div className="text-right mx-2 sm:mx-4">
                <p className={`text-lg font-bold ${priceInfo === bestPriceInfo ? 'text-green-600' : 'text-gray-800'}`}>
                R$ {priceInfo.price.toFixed(2)}
                </p>
            </div>
            <button 
                onClick={(e) => {
                e.stopPropagation();
                onAddItem(product, priceInfo);
                }}
                className="ml-2 flex-shrink-0 bg-orange-500 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-transform duration-200 hover:scale-110">
                <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    );
  };


  return (
    <div 
        className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105"
        onClick={handleCardClick}
    >
      <div className="relative cursor-pointer">
        <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
        <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">{product.category}</span>
        {bestPriceInfo?.promotion && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider animate-pulse">
            <i className="fa-solid fa-star mr-1"></i>
            OFERTA
          </div>
        )}
      </div>
      <div className="p-4 cursor-pointer">
        <h3 className="text-xl font-bold text-gray-800 truncate">{product.name}</h3>
        {!isExpanded && (
            <div className="mt-2 flex justify-between items-center">
                <p className="text-sm text-gray-600 font-medium">Ver Preços</p>
                <i className="fa-solid fa-chevron-down text-gray-400"></i>
            </div>
        )}
      </div>

      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4" onClick={handleContentClick}>
            <div className="border-t pt-4">
                 <h4 className="text-sm font-semibold text-gray-500 mb-2">Comparar preços:</h4>
                 {renderExpandedContent()}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;