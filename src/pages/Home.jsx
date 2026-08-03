import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usersCollection, shoesCollection, getDocs, query, where, doc, getDoc } from '../firebase';
import logo from '../assets/logo.png';
import '../css/mode.css';  // Import mode styles

function Home() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [currentStoreIndex, setCurrentStoreIndex] = useState(0);
  const [currentShoe, setCurrentShoe] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSellerMode, setIsSellerMode] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  
  const autoRotateTimerRef = useRef(null);
  const containerRef = useRef(null);

  const getOptimizedImage = (url) => {
    if (!url) return '';
    if (url.includes('cloudinary.com')) {
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/q_auto:eco,f_auto,fl_lossy,w_800/${parts[1]}`;
      }
    }
    return url;
  };

  // Toggle between Buyer and Seller mode
  const toggleMode = () => {
    const newMode = !isSellerMode;
    setIsSellerMode(newMode);
    if (newMode) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  // Set initial mode based on current path
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setIsSellerMode(true);
    } else {
      setIsSellerMode(false);
    }
  }, []);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const shoesSnapshot = await getDocs(shoesCollection);
        const allShoes = [];
        shoesSnapshot.forEach((doc) => {
          allShoes.push({ id: doc.id, ...doc.data() });
        });

        if (allShoes.length === 0) {
          setLoading(false);
          setStores([]);
          return;
        }

        const shoesByUser = {};
        allShoes.forEach((shoe) => {
          const userId = shoe.userId;
          if (!userId) return;
          if (!shoesByUser[userId]) {
            shoesByUser[userId] = [];
          }
          shoesByUser[userId].push(shoe);
        });

        const storesData = [];
        for (const userId of Object.keys(shoesByUser)) {
          let storeName = 'Unnamed Store';
          let userEmail = '';
          let location = { city: '', area: '', street: '', fullAddress: '' };
          
          try {
            const userDocRef = doc(usersCollection, userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists) {
              const userData = userDoc.data();
              storeName = userData.storeName || 'Unnamed Store';
              userEmail = userData.email || '';
              location = userData.location || { city: '', area: '', street: '', fullAddress: '' };
            } else {
              console.warn('⚠️ User document missing for:', userId);
            }
          } catch (error) {
            console.warn('Could not fetch user info for:', userId);
          }
          
          storesData.push({
            uid: userId,
            storeName: storeName,
            email: userEmail,
            location: location,
            shoes: shoesByUser[userId]
          });
        }

        const shuffled = shuffleArray(storesData);
        setStores(shuffled);
        
        if (shuffled.length > 0) {
          const firstStore = shuffled[0];
          const randomShoe = getRandomShoe(firstStore.shoes);
          setCurrentShoe(randomShoe);
          setCurrentImageIndex(0);
          
          if (randomShoe && randomShoe.images && randomShoe.images.length > 0) {
            const img = new Image();
            img.src = getOptimizedImage(randomShoe.images[0]);
            img.onload = () => setImageLoaded(true);
            img.onerror = () => setImageLoaded(false);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading stores:', error);
        setLoading(false);
      }
    };
    
    loadStores();
  }, []);

  useEffect(() => {
    if (currentShoe && currentShoe.images && currentShoe.images.length > 1) {
      startAutoRotate();
    }
    return () => stopAutoRotate();
  }, [currentShoe]);

  useEffect(() => {
    setImageLoaded(false);
    if (currentShoe && currentShoe.images && currentShoe.images.length > 0) {
      const img = new Image();
      img.src = getOptimizedImage(currentShoe.images[currentImageIndex]);
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(false);
    }
  }, [currentShoe, currentImageIndex]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getRandomShoe = (shoes) => {
    if (!shoes || shoes.length === 0) return null;
    return shoes[Math.floor(Math.random() * shoes.length)];
  };

  const goToNextImage = () => {
    if (!currentShoe || currentShoe.images.length <= 1) return;
    const totalImages = currentShoe.images.length;
    const nextIndex = (currentImageIndex + 1) % totalImages;
    setCurrentImageIndex(nextIndex);
  };

  const goToPreviousImage = () => {
    if (!currentShoe || currentShoe.images.length <= 1) return;
    const totalImages = currentShoe.images.length;
    const prevIndex = (currentImageIndex - 1 + totalImages) % totalImages;
    setCurrentImageIndex(prevIndex);
  };

  const startAutoRotate = () => {
    if (!currentShoe || currentShoe.images.length <= 1 || isDragging) return;
    stopAutoRotate();
    setIsAutoRotating(true);
    autoRotateTimerRef.current = setInterval(() => {
      if (!isDragging) {
        goToNextImage();
      }
    }, 3000);
  };

  const stopAutoRotate = () => {
    setIsAutoRotating(false);
    if (autoRotateTimerRef.current) {
      clearInterval(autoRotateTimerRef.current);
      autoRotateTimerRef.current = null;
    }
  };

  const handleDragStart = (e) => {
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    setIsDragging(true);
    setDragStartX(clientX);
    setDragOffset(0);
    stopAutoRotate();
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const delta = clientX - dragStartX;
    setDragOffset(delta);
    
    if (Math.abs(delta) > 50) {
      const direction = delta > 0 ? -1 : 1;
      const totalImages = currentShoe?.images?.length || 0;
      if (totalImages > 1) {
        const newIndex = (currentImageIndex + direction + totalImages) % totalImages;
        setCurrentImageIndex(newIndex);
        setDragStartX(clientX);
        setDragOffset(0);
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOffset(0);
    setTimeout(() => {
      if (!isDragging && currentShoe && currentShoe.images && currentShoe.images.length > 1) {
        startAutoRotate();
      }
    }, 5000);
  };

  const goToNextStore = () => {
    if (stores.length === 0) return;
    stopAutoRotate();
    
    const nextIndex = (currentStoreIndex + 1) % stores.length;
    setCurrentStoreIndex(nextIndex);
    const nextStore = stores[nextIndex];
    const randomShoe = getRandomShoe(nextStore.shoes);
    setCurrentShoe(randomShoe);
    setCurrentImageIndex(0);
    setImageLoaded(false);
    
    setTimeout(() => startAutoRotate(), 1500);
  };

  const goToPreviousStore = () => {
    if (stores.length === 0) return;
    stopAutoRotate();
    
    const prevIndex = (currentStoreIndex - 1 + stores.length) % stores.length;
    setCurrentStoreIndex(prevIndex);
    const prevStore = stores[prevIndex];
    const randomShoe = getRandomShoe(prevStore.shoes);
    setCurrentShoe(randomShoe);
    setCurrentImageIndex(0);
    setImageLoaded(false);
    
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
            {/* Buyer/Seller Toggle - Loading State */}
            <div className="mode-toggle">
              <span className="mode-label mode-buyer active">👤 Buyer</span>
              <div className="toggle-switch">
                <div className="toggle-slider buyer" />
              </div>
              <span className="mode-label mode-seller">🛒 Seller</span>
            </div>
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
            {/* Buyer/Seller Toggle - Empty State */}
            <div className="mode-toggle">
              <span className="mode-label mode-buyer active">👤 Buyer</span>
              <div className="toggle-switch" onClick={toggleMode}>
                <div className="toggle-slider buyer" />
              </div>
              <span className="mode-label mode-seller">🛒 Seller</span>
            </div>
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
  const hasLocation = currentStore?.location?.fullAddress && currentStore.location.fullAddress.length > 0;
  const has360View = totalImages > 1;

  return (
    <div className="app home-fullscreen">
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="NdulaBox Logo" className="logo-image" />
          <h1 className="logo-text">NdulaBox</h1>
        </div>
        <div className="header-right">
          {/* ===== BUYER/SELLER TOGGLE ===== */}
          <div className="mode-toggle">
            <button 
              className={`mode-label mode-buyer ${!isSellerMode ? 'active' : ''}`}
              onClick={() => {
                if (isSellerMode) {
                  setIsSellerMode(false);
                  navigate('/');
                }
              }}
            >
              👤 Buyer
            </button>
            <div className="toggle-switch" onClick={toggleMode}>
              <div className={`toggle-slider ${isSellerMode ? 'seller' : 'buyer'}`} />
            </div>
            <button 
              className={`mode-label mode-seller ${isSellerMode ? 'active' : ''}`}
              onClick={() => {
                if (!isSellerMode) {
                  setIsSellerMode(true);
                  navigate('/admin');
                }
              }}
            >
              🛒 Seller
            </button>
          </div>
        </div>
      </header>

      <div className="home-image-container">
        {/* ===== MAIN IMAGE WITH DRAG ===== */}
        {currentShoe && currentShoe.images && currentShoe.images.length > 0 ? (
          <>
            <div
              ref={containerRef}
              className="home-image-wrapper"
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                cursor: has360View ? 'grab' : 'default',
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                overflow: 'hidden'
              }}
            >
              <img 
                src={getOptimizedImage(currentShoe.images[currentImageIndex])}
                alt={currentShoe.name}
                className="home-shoe-image"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
                style={{ 
                  opacity: imageLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }}
                draggable={false}
                key={`${currentShoe.id}-${currentImageIndex}`}
              />
              
              {!imageLoaded && (
                <div className="image-loading">
                  <div className="spinner">🔄</div>
                </div>
              )}
              
              {/* 360° Badge - Top Right */}
              {has360View && (
                <div className="home-360-badge">
                  🔄 {currentImageIndex + 1}/{totalImages}
                </div>
              )}
              
              {/* ===== STORE INFO - TOP LEFT ===== */}
              <div className="home-store-top-left">
                <span className="home-store-name-top">📍 {currentStore?.storeName}</span>
                {hasLocation && (
                  <span className="home-store-location-top">
                    {currentStore.location.city}
                  </span>
                )}
              </div>
              
              {/* Drag hint */}
              {has360View && !isDragging && imageLoaded && (
                <div className="drag-hint">
                  <span>
                    <span className="drag-arrow">↔</span> Drag to rotate
                  </span>
                </div>
              )}
            </div>

            {/* ===== BOTTOM OVERLAY - DETAILS LEFT, CONTROLS RIGHT ===== */}
            <div className="home-bottom-overlay">
              {/* Left side - Shoe Details */}
              <div className="home-details-overlay">
                <h2 className="home-shoe-name">{currentShoe?.name}</h2>
                <p className="home-shoe-brand">{currentShoe?.brand}</p>
                <p className="home-shoe-price">Ksh {currentShoe?.price?.toLocaleString()}</p>
              </div>

              {/* Right side - Controls (Stacked Vertically) */}
              <div className="home-right-controls">
                {/* View Store Button */}
                <Link 
                  to={`/store/${currentStore?.uid}`} 
                  className="home-view-store-btn"
                >
                  👁️ View Store
                </Link>

                {/* Navigation */}
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
                          const selectedStore = stores[index];
                          const randomShoe = getRandomShoe(selectedStore.shoes);
                          setCurrentShoe(randomShoe);
                          setCurrentImageIndex(0);
                          setImageLoaded(false);
                          setTimeout(() => startAutoRotate(), 1500);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="home-no-image">
            <span>📷 No Image</span>
          </div>
        )}
      </div>

      {/* Minimal Footer */}
      <footer className="home-footer">
        <p>© 2026 NdulaBox. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;