import React, { useMemo } from 'react';
import { Product, ProductPrice } from '../types';
import PlusIcon from './icons/PlusIcon';

interface ProductCardProps {
  product: Product;
  onAddItem: (product: Product, price: ProductPrice) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddItem }) => {
  const bestPriceInfo = useMemo(() => {
    if (!product.prices || product.prices.length === 0) {
      return null;
    }
    return product.prices.reduce((min, p) => (p.price < min.price ? p : min), product.prices[0]);
  }, [product.prices]);

  const handleGoToSite = (url: string, supermarketName: string) => {
    if (window.confirm(`Você será redirecionado para o site do ${supermarketName}. Deseja continuar?`)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
      <div className="relative">
        <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
        <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">{product.category}</span>
        {bestPriceInfo?.promotion && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider animate-pulse">
            <i className="fa-solid fa-star mr-1"></i>
            OFERTA
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 truncate">{product.name}</h3>
        
        <div className="mt-4 space-y-2">
          {product.prices.sort((a, b) => a.price - b.price).map((priceInfo) => (
            <div 
              key={priceInfo.supermarket} 
              onClick={() => handleGoToSite(priceInfo.supermarketWebsite, priceInfo.supermarket)}
              className={`flex items-center p-3 rounded-lg transition-all duration-300 cursor-pointer ${priceInfo === bestPriceInfo ? 'bg-green-100 border-2 border-green-500 hover:bg-green-200' : 'bg-gray-50 hover:bg-gray-100'}`}
            >
              <img src={priceInfo.supermarketLogoUrl} alt={priceInfo.supermarket} className="w-10 h-10 object-contain rounded-full mr-4 bg-white shadow-sm" />
              <div className="flex-grow">
                <p className={`font-semibold ${priceInfo === bestPriceInfo ? 'text-green-800' : 'text-gray-600'}`}>
                  {priceInfo.supermarket}
                </p>
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
      </div>
    </div>
  );
};

export default ProductCard;
