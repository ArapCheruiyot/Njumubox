import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usersCollection, shoesCollection, getDocs, query, where, doc, getDoc } from '../firebase';
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
        // 1. Get ALL shoes first
        const shoesSnapshot = await getDocs(shoesCollection);
        const allShoes = [];
        shoesSnapshot.forEach((doc) => {
          allShoes.push({ id: doc.id, ...doc.data() });
        });

        console.log('📦 Total shoes found:', allShoes.length);

        if (allShoes.length === 0) {
          setLoading(false);
          setStores([]);
          return;
        }

        // 2. Group shoes by userId
        const shoesByUser = {};
        allShoes.forEach((shoe) => {
          const userId = shoe.userId;
          if (!userId) {
            console.warn('⚠️ Shoe has no userId:', shoe);
            return;
          }
          if (!shoesByUser[userId]) {
            shoesByUser[userId] = [];
          }
          shoesByUser[userId].push(shoe);
        });

        console.log('👥 Users with shoes:', Object.keys(shoesByUser).length);

        // 3. Get user info for each userId
        const storesData = [];
        for (const userId of Object.keys(shoesByUser)) {
          let storeName = 'Unnamed Store';
          let userEmail = '';
          
          // Try to get user info from users collection
          try {
            const userDocRef = doc(usersCollection, userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists) {
              const userData = userDoc.data();
              storeName = userData.storeName || 'Unnamed Store';
              userEmail = userData.email || '';
            }
          } catch (error) {
            console.warn('Could not fetch user info for:', userId);
          }
          
          storesData.push({
            uid: userId,
            storeName: storeName,
            email: userEmail,
            shoes: shoesByUser[userId]
          });
        }

        console.log('🏪 Stores created:', storesData.length);

        // 4. Shuffle stores for random display
        const shuffled = shuffleArray(storesData);
        setStores(shuffled);
        
        // 5. Select first store and a random shoe from it
        if (shuffled.length > 0) {
          const firstStore = shuffled[0];
          const randomShoe = getRandomShoe(firstStore.shoes);
          setCurrentShoe(randomShoe);
          setCurrentImageIndex(0);
          currentIndexRef.current = 0;
          
          console.log('👟 First store:', firstStore.storeName, 'with', firstStore.shoes.length, 'shoes');
          console.log('👟 Random shoe:', randomShoe?.name);
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
    if (!shoes || shoes.length === 0) return null;
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
    const nextStore = stores[nextIndex];
    const randomShoe = getRandomShoe(nextStore.shoes);
    setCurrentShoe(randomShoe);
    setCurrentImageIndex(0);
    currentIndexRef.current = 0;
    
    console.log('➡️ Next store:', nextStore.storeName, 'shoe:', randomShoe?.name);
    
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
    currentIndexRef.current = 0;
    
    console.log('⬅️ Previous store:', prevStore.storeName, 'shoe:', randomShoe?.name);
    
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

        {/* ===== STORE INFO - BOTTOM RIGHT (ABOVE VIEW STORE) ===== */}
        <div className="home-store-info">
          <span className="home-store-name">📍 {currentStore?.storeName}</span>
        </div>

        {/* ===== VIEW STORE BUTTON - BOTTOM RIGHT ===== */}
        <Link 
          to={`/store/${currentStore?.uid}`} 
          className="home-view-store-btn"
        >
          👁️ View Store
        </Link>

        {/* Navigation - Bottom Right (BELOW View Store) */}
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