import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usersCollection, shoesCollection, getDocs, query, where } from '../firebase';
import logo from '../assets/logo.png';

function Home() {
  const [stores, setStores] = useState([]);
  const [currentStoreIndex, setCurrentStoreIndex] = useState(0);
  const [currentShoe, setCurrentShoe] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  
  const autoRotateTimerRef = useRef(null);
  const currentIndexRef = useRef(0);

  // Load stores and their shoes
  useEffect(() => {
    const loadStores = async () => {
      try {
        const usersSnapshot = await getDocs(usersCollection);
        const storesData = [];
        
        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          const q = query(shoesCollection, where("userId", "==", userDoc.id));
          const shoesSnapshot = await getDocs(q);
          const vendorShoes = [];
          shoesSnapshot.forEach((doc) => {
            vendorShoes.push({ id: doc.id, ...doc.data() });
          });
          
          if (vendorShoes.length > 0) {
            storesData.push({
              uid: userDoc.id,
              storeName: userData.storeName || 'Unnamed Store',
              email: userData.email,
              shoes: vendorShoes
            });
          }
        }
        
        const shuffled = shuffleArray(storesData);
        setStores(shuffled);
        
        if (shuffled.length > 0) {
          const randomShoe = getRandomShoe(shuffled[0].shoes);
          setCurrentShoe(randomShoe);
          setCurrentImageIndex(0);
          currentIndexRef.current = 0;
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading stores:', error);
        setLoading(false);
      }
    };
    
    loadStores();
  }, []);

  // Start auto-rotation when shoe changes
  useEffect(() => {
    if (currentShoe && currentShoe.images && currentShoe.images.length > 1) {
      startAutoRotate();
    }
    return () => stopAutoRotate();
  }, [currentShoe]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getRandomShoe = (shoes) => {
    return shoes[Math.floor(Math.random() * shoes.length)];
  };

  // ===== ROTATION FUNCTIONS =====
  const goToNextImage = () => {
    if (!currentShoe || currentShoe.images.length <= 1) return;
    
    const totalImages = currentShoe.images.length;
    const nextIndex = (currentIndexRef.current + 1) % totalImages;
    
    setCurrentImageIndex(nextIndex);
    currentIndexRef.current = nextIndex;
    
    // When we complete all images, move to next store
    if (nextIndex === 0 && stores.length > 1) {
      setTimeout(() => {
        goToNextStore();
      }, 1000);
    }
  };

  const startAutoRotate = () => {
    if (!currentShoe || currentShoe.images.length <= 1) return;
    stopAutoRotate();
    setIsAutoRotating(true);
    autoRotateTimerRef.current = setInterval(() => {
      goToNextImage();
    }, 3000);
  };

  const stopAutoRotate = () => {
    setIsAutoRotating(false);
    if (autoRotateTimerRef.current) {
      clearInterval(autoRotateTimerRef.current);
      autoRotateTimerRef.current = null;
    }
  };

  // ===== STORE NAVIGATION =====
  const goToNextStore = () => {
    if (stores.length === 0) return;
    stopAutoRotate();
    
    const nextIndex = (currentStoreIndex + 1) % stores.length;
    setCurrentStoreIndex(nextIndex);
    const randomShoe = getRandomShoe(stores[nextIndex].shoes);
    setCurrentShoe(randomShoe);
    setCurrentImageIndex(0);
    currentIndexRef.current = 0;
    
    setTimeout(() => startAutoRotate(), 1500);
  };

  const goToPreviousStore = () => {
    if (stores.length === 0) return;
    stopAutoRotate();
    
    const prevIndex = (currentStoreIndex - 1 + stores.length) % stores.length;
    setCurrentStoreIndex(prevIndex);
    const randomShoe = getRandomShoe(stores[prevIndex].shoes);
    setCurrentShoe(randomShoe);
    setCurrentImageIndex(0);
    currentIndexRef.current = 0;
    
    setTimeout(() => startAutoRotate(), 1500);
  };

  if (loading) {
    return (
      <div className="app">
        <header className="header">
          <div className="logo-container">
            <img src={logo} alt="NdulaBox Logo" className="logo-image" />
            <h1 className="logo-text">NdulaBox</h1>
          </div>
          <div className="header-right">
            <Link to="/admin" className="admin-link">🔧 Admin</Link>
          </div>
        </header>
        <div className="home-loading">
          <p>Loading shoes...</p>
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="app">
        <header className="header">
          <div className="logo-container">
            <img src={logo} alt="NdulaBox Logo" className="logo-image" />
            <h1 className="logo-text">NdulaBox</h1>
          </div>
          <div className="header-right">
            <Link to="/admin" className="admin-link">🔧 Admin</Link>
          </div>
        </header>
        <div className="home-empty">
          <h2>👟 No Shoes Yet</h2>
          <p>Be the first to <Link to="/admin" className="home-empty-link">add a shoe</Link>!</p>
        </div>
      </div>
    );
  }

  const currentStore = stores[currentStoreIndex];
  const totalImages = currentShoe?.images?.length || 0;

  return (
    <div className="app home-fullscreen">
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="NdulaBox Logo" className="logo-image" />
          <h1 className="logo-text">NdulaBox</h1>
        </div>
        <div className="header-right">
          <Link to="/admin" className="admin-link">🔧 Admin</Link>
          <Link to="/explore" className="admin-link explore-link">
            🌐 Explore All
          </Link>
        </div>
      </header>

      <div className="home-image-container">
        {/* Main Image */}
        {currentShoe && (
          <img 
            src={currentShoe.images[currentImageIndex]} 
            alt={currentShoe.name}
            className="home-shoe-image"
          />
        )}
        
        {/* 360° Badge - Top Right */}
        {totalImages > 1 && (
          <div className="home-360-badge">
            🔄 {currentImageIndex + 1}/{totalImages}
          </div>
        )}

        {/* ===== SHOE DETAILS - BOTTOM LEFT ===== */}
        <div className="home-details-overlay">
          <h2 className="home-shoe-name">{currentShoe?.name}</h2>
          <p className="home-shoe-brand">{currentShoe?.brand}</p>
          <p className="home-shoe-price">Ksh {currentShoe?.price?.toLocaleString()}</p>
        </div>

        {/* ===== NAVIGATION BUTTONS - BOTTOM RIGHT ===== */}
        <div className="home-nav-overlay">
          <div className="home-nav-buttons">
            <button 
              onClick={goToPreviousStore}
              className="home-nav-btn"
              aria-label="Previous store"
            >
              ◀
            </button>
            
            <span className="home-nav-counter">
              {currentStoreIndex + 1} / {stores.length}
            </span>
            
            <button 
              onClick={goToNextStore}
              className="home-nav-btn home-nav-btn-next"
              aria-label="Next store"
            >
              ▶
            </button>
          </div>
          
          {/* Store Dots */}
          <div className="home-dots">
            {stores.map((store, index) => (
              <div
                key={store.uid}
                className={`home-dot ${index === currentStoreIndex ? 'active' : ''}`}
                onClick={() => {
                  stopAutoRotate();
                  setCurrentStoreIndex(index);
                  const randomShoe = getRandomShoe(store.shoes);
                  setCurrentShoe(randomShoe);
                  setCurrentImageIndex(0);
                  currentIndexRef.current = 0;
                  setTimeout(() => startAutoRotate(), 1500);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="home-footer">
        <p>© 2026 NdulaBox. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;