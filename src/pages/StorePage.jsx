import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shoesCollection, usersCollection, getDocs, query, where, getDoc, doc } from '../firebase';
import logo from '../assets/logo.png';

function StorePage() {
  const { vendorId } = useParams();
  const [storeShoes, setStoreShoes] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [currentShoe, setCurrentShoe] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentShoeIndex, setCurrentShoeIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  
  const autoRotateTimerRef = useRef(null);
  const currentIndexRef = useRef(0);

  // Load store info and their shoes
  useEffect(() => {
    const loadStoreData = async () => {
      try {
        // 1. Get store info
        const userDocRef = doc(usersCollection, vendorId);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists) {
          setLoading(false);
          return;
        }
        
        const userData = userDoc.data();
        setStoreInfo({
          uid: vendorId,
          storeName: userData.storeName || 'Unnamed Store',
          email: userData.email,
        });

        // 2. Get this store's shoes
        const q = query(shoesCollection, where("userId", "==", vendorId));
        const shoesSnapshot = await getDocs(q);
        const vendorShoes = [];
        shoesSnapshot.forEach((doc) => {
          vendorShoes.push({ id: doc.id, ...doc.data() });
        });
        
        setStoreShoes(vendorShoes);
        
        if (vendorShoes.length > 0) {
          setCurrentShoe(vendorShoes[0]);
          setCurrentImageIndex(0);
          currentIndexRef.current = 0;
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading store data:', error);
        setLoading(false);
      }
    };
    
    loadStoreData();
  }, [vendorId]);

  // Start auto-rotation when shoe changes
  useEffect(() => {
    if (currentShoe && currentShoe.images && currentShoe.images.length > 1) {
      startAutoRotate();
    }
    return () => stopAutoRotate();
  }, [currentShoe]);

  // ===== ROTATION FUNCTIONS =====
  const goToNextImage = () => {
    if (!currentShoe || currentShoe.images.length <= 1) return;
    
    const totalImages = currentShoe.images.length;
    const nextIndex = (currentIndexRef.current + 1) % totalImages;
    
    setCurrentImageIndex(nextIndex);
    currentIndexRef.current = nextIndex;
    
    // When we complete all images, move to next shoe in this store
    if (nextIndex === 0 && storeShoes.length > 1) {
      setTimeout(() => {
        goToNextShoe();
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

  // ===== SHOE NAVIGATION =====
  const goToNextShoe = () => {
    if (storeShoes.length === 0) return;
    stopAutoRotate();
    
    const nextIndex = (currentShoeIndex + 1) % storeShoes.length;
    setCurrentShoeIndex(nextIndex);
    setCurrentShoe(storeShoes[nextIndex]);
    setCurrentImageIndex(0);
    currentIndexRef.current = 0;
    
    setTimeout(() => startAutoRotate(), 1500);
  };

  const goToPreviousShoe = () => {
    if (storeShoes.length === 0) return;
    stopAutoRotate();
    
    const prevIndex = (currentShoeIndex - 1 + storeShoes.length) % storeShoes.length;
    setCurrentShoeIndex(prevIndex);
    setCurrentShoe(storeShoes[prevIndex]);
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
            <Link to="/" className="admin-link">← Back</Link>
          </div>
        </header>
        <div className="home-loading">
          <p>Loading store...</p>
        </div>
      </div>
    );
  }

  if (!storeInfo || storeShoes.length === 0) {
    return (
      <div className="app">
        <header className="header">
          <div className="logo-container">
            <img src={logo} alt="NdulaBox Logo" className="logo-image" />
            <h1 className="logo-text">NdulaBox</h1>
          </div>
          <div className="header-right">
            <Link to="/" className="admin-link">← Back to Stores</Link>
          </div>
        </header>
        <div className="home-empty">
          <h2>👟 No Shoes in This Store</h2>
          <p>This store hasn't added any shoes yet.</p>
          <Link to="/" className="home-empty-link">← Back to Stores</Link>
        </div>
      </div>
    );
  }

  const totalImages = currentShoe?.images?.length || 0;

  return (
    <div className="app home-fullscreen">
      <header className="header">
        <div className="logo-container">
          <h1 className="logo-text">👟 {storeInfo.storeName}</h1>
        </div>
        <div className="header-right">
          <span className="tagline">{storeShoes.length} shoes</span>
          <Link to="/" className="admin-link">← Back</Link>
          <Link to="/admin" className="admin-link">🔧 Admin</Link>
        </div>
      </header>

      <div className="home-image-container">
        {/* Main Image */}
        {currentShoe && (
          <img 
            src={currentShoe.images[currentImageIndex]} 
            alt={currentShoe.name}
            className="home-shoe-image"
            key={`${currentShoe.id}-${currentImageIndex}`}
          />
        )}
        
        {/* 360° Badge */}
        {totalImages > 1 && (
          <div className="home-360-badge">
            🔄 {currentImageIndex + 1}/{totalImages}
          </div>
        )}

        {/* Shoe Details - Bottom Left */}
        <div className="home-details-overlay">
          <h2 className="home-shoe-name">{currentShoe?.name}</h2>
          <p className="home-shoe-brand">{currentShoe?.brand}</p>
          <p className="home-shoe-price">Ksh {currentShoe?.price?.toLocaleString()}</p>
        </div>

        {/* Navigation - Bottom Right */}
        <div className="home-nav-overlay">
          <div className="home-nav-buttons">
            <button 
              onClick={goToPreviousShoe}
              className="home-nav-btn"
              aria-label="Previous shoe"
            >
              ◀
            </button>
            
            <span className="home-nav-counter">
              {currentShoeIndex + 1} / {storeShoes.length}
            </span>
            
            <button 
              onClick={goToNextShoe}
              className="home-nav-btn home-nav-btn-next"
              aria-label="Next shoe"
            >
              ▶
            </button>
          </div>
          
          {/* Store Shoe Dots */}
          <div className="home-dots">
            {storeShoes.map((shoe, index) => (
              <div
                key={shoe.id}
                className={`home-dot ${index === currentShoeIndex ? 'active' : ''}`}
                onClick={() => {
                  stopAutoRotate();
                  setCurrentShoeIndex(index);
                  setCurrentShoe(storeShoes[index]);
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
        <p>© 2026 NdulaBox - {storeInfo.storeName}</p>
      </footer>
    </div>
  );
}

export default StorePage;