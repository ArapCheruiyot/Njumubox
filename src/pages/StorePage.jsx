import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { shoesCollection, usersCollection, getDocs, query, where, getDoc, doc } from '../firebase';
import logo from '../assets/logo.png';
import '../css/store.css';
import '../css/mode.css';
import { trackAppEvents } from '../utils/analytics';

function StorePage() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [storeShoes, setStoreShoes] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [currentShoe, setCurrentShoe] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentShoeIndex, setCurrentShoeIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showDragHint, setShowDragHint] = useState(false);
  const [isSellerMode, setIsSellerMode] = useState(false);
  
  // Drag states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  
  const autoRotateTimerRef = useRef(null);
  const currentIndexRef = useRef(0);
  const containerRef = useRef(null);

  // Helper: Optimize Cloudinary images
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
    trackAppEvents.modeSwitch(newMode ? 'Seller' : 'Buyer');
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

  // Load store info and their shoes
  useEffect(() => {
    const loadStoreData = async () => {
      try {
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
          phone: userData.phone || '',
          location: userData.location || {
            city: '',
            area: '',
            street: '',
            fullAddress: ''
          }
        });

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
          
          // Preload first image
          if (vendorShoes[0] && vendorShoes[0].images && vendorShoes[0].images.length > 0) {
            const img = new Image();
            img.src = getOptimizedImage(vendorShoes[0].images[0]);
            img.onload = () => setImageLoaded(true);
            img.onerror = () => setImageLoaded(false);
          }
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

  // Reset image loaded when image changes
  useEffect(() => {
    setImageLoaded(false);
    if (currentShoe && currentShoe.images && currentShoe.images.length > 0) {
      const img = new Image();
      img.src = getOptimizedImage(currentShoe.images[currentImageIndex]);
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(false);
    }
  }, [currentShoe, currentImageIndex]);

  // Show drag hint when image loads
  useEffect(() => {
    if (imageLoaded && currentShoe && currentShoe.images && currentShoe.images.length > 1) {
      setShowDragHint(true);
      const timer = setTimeout(() => {
        setShowDragHint(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded, currentShoe]);

  // Track shoe view when shoe changes
  useEffect(() => {
    if (currentShoe && storeInfo) {
      trackAppEvents.viewShoe(currentShoe.name, storeInfo.storeName);
    }
  }, [currentShoe, storeInfo]);

  const goToNextImage = () => {
    if (!currentShoe || currentShoe.images.length <= 1) return;
    
    const totalImages = currentShoe.images.length;
    const nextIndex = (currentIndexRef.current + 1) % totalImages;
    
    setCurrentImageIndex(nextIndex);
    currentIndexRef.current = nextIndex;
    setImageLoaded(false);
    
    if (nextIndex === 0 && storeShoes.length > 1) {
      setTimeout(() => {
        goToNextShoe();
      }, 1000);
    }
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

  // ===== DRAG HANDLERS =====
  const handleDragStart = (e) => {
    if (!currentShoe || currentShoe.images.length <= 1) return;
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    setIsDragging(true);
    setDragStartX(clientX);
    setDragOffset(0);
    setShowDragHint(false);
    stopAutoRotate();
  };

  const handleDragMove = (e) => {
    if (!isDragging || !currentShoe) return;
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
        setImageLoaded(false);
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

  const goToNextShoe = () => {
    if (storeShoes.length === 0) return;
    stopAutoRotate();
    
    const nextIndex = (currentShoeIndex + 1) % storeShoes.length;
    setCurrentShoeIndex(nextIndex);
    setCurrentShoe(storeShoes[nextIndex]);
    setCurrentImageIndex(0);
    currentIndexRef.current = 0;
    setImageLoaded(false);
    setShowDragHint(true);
    
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
    setImageLoaded(false);
    setShowDragHint(true);
    
    setTimeout(() => startAutoRotate(), 1500);
  };

  const hasPhone = storeInfo?.phone && storeInfo.phone.length > 0;
  const hasLocation = storeInfo?.location?.fullAddress && storeInfo.location.fullAddress.length > 0;

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
  const has360View = totalImages > 1;

  return (
    <div className="app home-fullscreen">
      <header className="header">
        <div className="logo-container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h1 className="logo-text" style={{ marginBottom: '2px' }}>
              👟 {storeInfo.storeName}
            </h1>
            {hasLocation && (
              <span style={{ 
                fontSize: '0.7rem', 
                color: 'rgba(255,255,255,0.5)',
                marginLeft: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                📍 {storeInfo.location.fullAddress}
              </span>
            )}
          </div>
        </div>
        <div className="header-right">
          <span className="tagline">{storeShoes.length} shoes</span>
          <Link to="/" className="admin-link">← Back</Link>
          
          {/* ===== BUYER/SELLER TOGGLE ===== */}
          <div className="mode-toggle">
            <button 
              className={`mode-label mode-buyer ${!isSellerMode ? 'active' : ''}`}
              onClick={() => {
                if (isSellerMode) {
                  setIsSellerMode(false);
                  navigate('/');
                  trackAppEvents.modeSwitch('Buyer');
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
                  trackAppEvents.modeSwitch('Seller');
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
              
              {/* Drag hint */}
              {has360View && !isDragging && imageLoaded && showDragHint && (
                <div className="drag-hint">
                  <span>
                    <span className="drag-arrow">↔</span> Drag to rotate
                  </span>
                </div>
              )}
            </div>

            {/* ===== BOTTOM OVERLAY - DETAILS LEFT, CONTROLS RIGHT ===== */}
            <div className="home-bottom-overlay">
              {/* Left side - Shoe Details WITH SIZES */}
              <div className="home-details-overlay">
                <h2 className="home-shoe-name">{currentShoe?.name}</h2>
                <p className="home-shoe-brand">{currentShoe?.brand}</p>
                <p className="home-shoe-price">Ksh {currentShoe?.price?.toLocaleString()}</p>
                
                {/* ===== SIZES DISPLAY ===== */}
                {currentShoe?.sizes && currentShoe.sizes.length > 0 && (
                  <div className="shoe-sizes-container">
                    <span className="shoe-sizes-label">📏 Sizes:</span>
                    <div className="shoe-sizes">
                      {currentShoe.sizes.map((size, index) => (
                        <span key={index} className="shoe-size-tag">{size}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right side - Controls (Stacked Vertically) */}
              <div className="home-right-controls">
                {/* WhatsApp & Call Buttons */}
                {hasPhone ? (
                  <div className="store-cta-container">
                    <a 
                      href={`https://wa.me/${storeInfo.phone}?text=Hi%20${encodeURIComponent(storeInfo.storeName)}%2C%20I%20saw%20your%20${encodeURIComponent(currentShoe?.name || 'shoes')}%20on%20NdulaBox!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="store-cta-btn store-whatsapp"
                      title="Chat on WhatsApp"
                      onClick={() => trackAppEvents.whatsappClick(storeInfo?.storeName)}
                    >
                      <span className="store-cta-icon">💬</span>
                      WhatsApp
                    </a>
                    <a 
                      href={`tel:${storeInfo.phone}`}
                      className="store-cta-btn store-call"
                      title="Call Store"
                      onClick={() => trackAppEvents.callClick(storeInfo?.storeName)}
                    >
                      <span className="store-cta-icon">📞</span>
                      Call
                    </a>
                  </div>
                ) : (
                  <div className="store-no-phone">
                    <span className="store-no-phone-icon">📱</span>
                    <span className="store-no-phone-text">No contact</span>
                  </div>
                )}

                {/* Navigation */}
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
                          setImageLoaded(false);
                          setShowDragHint(true);
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
        <p>© 2026 NdulaBox - {storeInfo.storeName}</p>
      </footer>
    </div>
  );
}

export default StorePage;