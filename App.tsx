import React, { useState, useCallback } from 'react';
import { Product, ProductPrice, View } from './types';
import { fetchProductsFromGemini, fetchProductPricesFromGemini } from './services/geminiService';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import BottomNav from './components/BottomNav';
import ShoppingList from './components/ShoppingList';
import SkeletonCard from './components/SkeletonCard';
import SupermarketInfoModal from './components/SupermarketInfoModal';

interface ShoppingListItem {
    product: Product;
    price: ProductPrice;
}

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [detailsLoadingId, setDetailsLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>(View.SEARCH);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [modalInfo, setModalInfo] = useState<ProductPrice | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };
  
  const handleOpenModal = (info: ProductPrice) => {
    setModalInfo(info);
  };
  
  const handleCloseModal = () => {
    setModalInfo(null);
  };

  const getLocation = useCallback((): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      // Return cached location if available
      if (userLocation) {
        resolve(userLocation);
        return;
      }
      if (!navigator.geolocation) {
        reject(new Error("Geolocalização não é suportada por este navegador."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setUserLocation(location); // Cache location
          resolve(location);
        },
        (err) => {
          let message = "Ocorreu um erro desconhecido ao obter a localização.";
          switch (err.code) {
            case err.PERMISSION_DENIED:
              message = "Você negou o acesso à localização. Habilite para buscar por supermercados próximos.";
              break;
            case err.POSITION_UNAVAILABLE:
              message = "Informações de localização não estão disponíveis.";
              break;
            case err.TIMEOUT:
              message = "A requisição para obter a localização expirou.";
              break;
          }
          setLocationError(message);
          reject(new Error(message));
        }
      );
    });
  }, [userLocation]);

  const handleFetchProductDetails = useCallback(async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.prices.length > 0) return; // Don't re-fetch

    setDetailsLoadingId(productId);
    setError(null);

    try {
      const { lat, lon } = await getLocation();
      const prices = await fetchProductPricesFromGemini(product.name, lat, lon);
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? { ...p, prices } : p
        )
      );
    } catch (err: any) {
        setError(`Não foi possível carregar os preços para ${product.name}.`);
        // Optionally clear prices to allow a retry
        setProducts(prevProducts =>
            prevProducts.map(p =>
            p.id === productId ? { ...p, prices: [] } : p
            )
        );
    } finally {
        setDetailsLoadingId(null);
    }
  }, [products, getLocation]);
  
  const handleToggleExpand = (productId: string) => {
    const newExpandedId = expandedProductId === productId ? null : productId;
    setExpandedProductId(newExpandedId);
    if (newExpandedId) {
      handleFetchProductDetails(productId);
    }
  };


  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setLocationError(null);
    setProducts([]);
    setExpandedProductId(null);

    try {
      // Ensure we have location permission before showing results
      await getLocation();
      const results = await fetchProductsFromGemini(query);
      setProducts(results);
    } catch (err: any) {
      if (!err.message.includes("localização")) {
         setError(err.message || 'Ocorreu um erro inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [getLocation]);

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
                onOpenModal={handleOpenModal}
                isDetailsLoading={detailsLoadingId === product.id}
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

      {modalInfo && <SupermarketInfoModal info={modalInfo} onClose={handleCloseModal} />}

      <BottomNav activeView={activeView} onNavigate={setActiveView} listCount={shoppingList.length} />
    </div>
  );
};

export default App;