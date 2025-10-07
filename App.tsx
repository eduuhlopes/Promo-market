import React, { useState, useCallback } from 'react';
import { Product, ProductPrice, View } from './types';
import { fetchProductsFromGemini } from './services/geminiService';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import BottomNav from './components/BottomNav';
import ShoppingList from './components/ShoppingList';
import SkeletonCard from './components/SkeletonCard';

interface ShoppingListItem {
    product: Product;
    price: ProductPrice;
}

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>(View.SEARCH);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggleExpand = (productId: string) => {
    setExpandedProductId(prevId => (prevId === productId ? null : productId));
  };

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setLocationError(null);
    setProducts([]);
    setExpandedProductId(null); // Reset expanded card on new search

    const getLocation = (): Promise<{ lat: number; lon: number }> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocalização não é suportada por este navegador."));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
          },
          (err) => {
            switch (err.code) {
              case err.PERMISSION_DENIED:
                reject(new Error("Você negou o acesso à localização. Habilite para buscar por supermercados próximos."));
                break;
              case err.POSITION_UNAVAILABLE:
                reject(new Error("Informações de localização não estão disponíveis."));
                break;
              case err.TIMEOUT:
                reject(new Error("A requisição para obter a localização expirou."));
                break;
              default:
                reject(new Error("Ocorreu um erro desconhecido ao obter a localização."));
                break;
            }
          }
        );
      });
    };

    try {
      const { lat, lon } = await getLocation();
      const results = await fetchProductsFromGemini(query, lat, lon);
      setProducts(results);
    } catch (err: any) {
      if (err.message.includes("localização") || err.message.includes("Geolocalização")) {
        setLocationError(err.message);
      } else {
        setError(err.message || 'Ocorreu um erro inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddItem = (product: Product, price: ProductPrice) => {
    setShoppingList(prevList => [...prevList, { product, price }]);
    showToast(`${product.name} adicionado à lista!`);
  };
  
  const handleClearList = () => {
    setShoppingList([]);
  };

  const renderContent = () => {
    if (activeView === View.LIST) {
      return <ShoppingList items={shoppingList} onClear={handleClearList} />;
    }

    return (
      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : locationError ? (
           <p className="text-center text-yellow-800 bg-yellow-100 p-4 rounded-lg">{locationError}</p>
        ) : error ? (
          <p className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddItem={handleAddItem}
                isExpanded={expandedProductId === product.id}
                onToggleExpand={() => handleToggleExpand(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-md">
            <i className="fa-solid fa-tags text-5xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-700">Bem-vindo ao Promo Finder!</h3>
            <p className="text-gray-500 mt-2">Digite o nome de um produto na barra de busca para encontrar as melhores promoções perto de você.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-slate-50 font-sans pb-20">
      <header className="bg-white p-4 text-center sticky top-0 z-20">
        <h1 className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-2">
            <i className="fa-solid fa-cart-arrow-down"></i>
            Promo Finder
        </h1>
      </header>
      
      {activeView === View.SEARCH && <SearchBar onSearch={handleSearch} isLoading={isLoading} />}
      
      <main>
        {renderContent()}
      </main>

       {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm shadow-lg z-30 animate-bounce">
          {toastMessage}
        </div>
      )}

      <BottomNav activeView={activeView} onNavigate={setActiveView} listCount={shoppingList.length} />
    </div>
  );
};

export default App;