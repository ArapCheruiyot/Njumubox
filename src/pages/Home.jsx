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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 70px)',
          color: 'white'
        }}>
          <p>Loading stores...</p>
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
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 70px)',
          color: 'white',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h2>👟 No Stores Yet</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>
            Be the first to <Link to="/admin" style={{ color: '#3498db' }}>open a store</Link>!
          </p>
        </div>
      </div>
    );
  }

  const currentStore = stores[currentStoreIndex];
  const totalImages = currentShoe?.images?.length || 0;

  return (
    <div className="app" style={{ height: '100vh', overflow: 'hidden' }}>
      <header className="header" style={{ flexShrink: 0 }}>
        <div className="logo-container">
          <img src={logo} alt="NdulaBox Logo" className="logo-image" />
          <h1 className="logo-text">NdulaBox</h1>
        </div>
        <div className="header-right">
          <Link to="/admin" className="admin-link">🔧 Admin</Link>
          <Link to="/explore" className="admin-link" style={{ borderColor: '#27ae60' }}>
            🌐 Explore All
          </Link>
        </div>
      </header>

      {/* FULL SCREEN IMAGE CONTAINER */}
      <div style={{
        position: 'relative',
        height: 'calc(100vh - 70px)',
        width: '100%',
        background: '#0f0f1a',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Main Image - Full screen */}
        {currentShoe && (
          <img 
            src={currentShoe.images[currentImageIndex]} 
            alt={currentShoe.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
        
        {/* 360° Badge - Top Right */}
        {totalImages > 1 && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            backdropFilter: 'blur(10px)',
            zIndex: 10
          }}>
            🔄 {currentImageIndex + 1}/{totalImages}
          </div>
        )}

        {/* ===== VIEW STORE BUTTON - TOP RIGHT ===== */}
        <Link 
          to={`/store/${currentStore?.uid}`}
          style={{
            position: 'absolute',
            top: '20px',
            right: '100px',
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #27ae60, #1e8449)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '10px',
            fontSize: '0.95rem',
            fontWeight: 'bold',
            zIndex: 10,
            boxShadow: '0 4px 20px rgba(39,174,96,0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(39,174,96,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(39,174,96,0.3)';
          }}
        >
          👁️ View Store
        </Link>

        {/* ===== OVERLAY AT BOTTOM - Shoe Details + Navigation ===== */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
          padding: '30px 24px 20px',
          zIndex: 5
        }}>
          {/* Shoe Details - Bottom Left */}
          <div style={{ 
            textAlign: 'left',
            marginBottom: '15px'
          }}>
            <h2 style={{ 
              color: 'white', 
              fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
              fontWeight: 700,
              marginBottom: '2px',
              textShadow: '0 2px 20px rgba(0,0,0,0.5)'
            }}>
              {currentShoe?.name}
            </h2>
            <p style={{ 
              color: 'rgba(255,255,255,0.6)', 
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              marginBottom: '4px'
            }}>
              {currentShoe?.brand}
            </p>
            <p style={{ 
              color: '#2ecc71', 
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              fontWeight: 'bold',
              textShadow: '0 2px 20px rgba(0,0,0,0.5)'
            }}>
              Ksh {currentShoe?.price?.toLocaleString()}
            </p>
          </div>

          {/* Navigation Arrows + Store Dots */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            {/* Left: Previous/Next Arrows */}
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <button 
                onClick={goToPreviousStore}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                ◀
              </button>
              
              <button 
                onClick={goToNextStore}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                }}
              >
                ▶
              </button>
              
              <span style={{ 
                color: 'rgba(255,255,255,0.4)', 
                fontSize: '0.8rem',
                marginLeft: '5px'
              }}>
                {currentStoreIndex + 1} / {stores.length}
              </span>
            </div>

            {/* Right: Store Dots */}
            <div style={{
              display: 'flex',
              gap: '6px',
              alignItems: 'center'
            }}>
              {stores.map((store, index) => (
                <div
                  key={store.uid}
                  onClick={() => {
                    stopAutoRotate();
                    setCurrentStoreIndex(index);
                    const randomShoe = getRandomShoe(store.shoes);
                    setCurrentShoe(randomShoe);
                    setCurrentImageIndex(0);
                    currentIndexRef.current = 0;
                    setTimeout(() => startAutoRotate(), 1500);
                  }}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: index === currentStoreIndex ? '#3498db' : 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: index === currentStoreIndex ? '2px solid #3498db' : 'none'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '6px 20px',
        background: 'rgba(15,15,26,0.95)',
        color: 'rgba(255,255,255,0.15)',
        fontSize: '0.6rem',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        position: 'relative',
        zIndex: 10,
        flexShrink: 0
      }}>
        <p>© 2026 NdulaBox. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;