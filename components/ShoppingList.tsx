
import React, { useMemo } from 'react';
import { Product, ProductPrice } from '../types';

interface ShoppingListItem {
    product: Product;
    price: ProductPrice;
}

interface ShoppingListProps {
  items: ShoppingListItem[];
  onClear: () => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ items, onClear }) => {
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price.price, 0);
  }, [items]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Sua Lista de Compras</h2>
        <button
          onClick={onClear}
          className="text-sm text-red-500 hover:text-red-700 font-semibold disabled:text-gray-400"
          disabled={items.length === 0}
        >
          Limpar Lista
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-md">
            <i className="fa-solid fa-cart-shopping text-5xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-700">Sua lista está vazia</h3>
            <p className="text-gray-500 mt-2">Adicione produtos da tela de busca para começar!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={`${item.product.id}-${item.price.supermarket}-${index}`} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center">
                <img src={item.product.imageUrl} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover mr-4" />
                <div>
                  <p className="font-bold text-gray-800">{item.product.name}</p>
                  <p className="text-sm text-gray-500">{item.price.supermarket}</p>
                </div>
              </div>
              <p className="font-bold text-lg text-green-600">R$ {item.price.price.toFixed(2)}</p>
            </div>
          ))}
          <div className="mt-6 pt-4 border-t-2 border-dashed">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-800">
                <span>Total:</span>
                <span className="text-orange-600">R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
