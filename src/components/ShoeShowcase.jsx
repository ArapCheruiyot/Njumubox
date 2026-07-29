import { useState, useEffect, useRef } from 'react';
import { shoes as defaultShoes } from '../data/shoes';

function ShoeShowcase() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [shoes, setShoes] = useState([]);
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  
  // 360° rotation states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startAngle, setStartAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  
  const thumbnailsContainerRef = useRef(null);
  const thumbnailRefs = useRef({});
  const autoRotateTimerRef = useRef(null);
  const advanceTimerRef = useRef(null);
  const imageContainerRef = useRef(null);
  const currentIndexRef = useRef(0); // Track current index for interval

  // Load shoes from localStorage OR use default shoes
  useEffect(() => {
    const savedShoes = JSON.parse(localStorage.getItem('ndulabox_shoes') || '[]');
    
    let allShoes = [];
    if (savedShoes.length > 0) {
      allShoes = savedShoes;
      console.log('📦 Loaded from localStorage:', allShoes.length, 'shoes');
    } else {
      allShoes = defaultShoes;
      console.log('📦 Loaded from shoes.js:', allShoes.length, 'shoes');
    }
    
    setShoes(allShoes);
    if (allShoes.length > 0) {
      setSelectedShoe(allShoes[0]);
      setCurrentImageIndex(0);
      currentIndexRef.current = 0;
    }
  }, []);

  // Get filtered shoes based on category
  const filteredShoes = activeCategory === 'All' 
    ? shoes 
    : shoes.filter(shoe => shoe.category === activeCategory);

  // Get unique categories
  const categories = ['All', ...new Set(shoes.map(shoe => shoe.category))];

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    const newShoes = category === 'All' ? shoes : shoes.filter(s => s.category === category);
    if (newShoes.length > 0) {
      setSelectedShoe(newShoes[0]);
      setCurrentImageIndex(0);
      currentIndexRef.current = 0;
      if (thumbnailsContainerRef.current) {
        thumbnailsContainerRef.current.scrollLeft = 0;
      }
    }
  };

  // Handle thumbnail click - selects the shoe
  const handleThumbnailClick = (shoe) => {
    setSelectedShoe(shoe);
    setCurrentImageIndex(0);
    currentIndexRef.current = 0;
    stopAutoRotate();
  };

  // Handle scroll detection - auto-select shoe in center
  const handleScroll = () => {
    const container = thumbnailsContainerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const centerX = scrollLeft + containerWidth / 2;

    let closestShoe = null;
    let closestDistance = Infinity;
    let closestShoeId = null;

    Object.keys(thumbnailRefs.current).forEach((key) => {
      const ref = thumbnailRefs.current[key];
      if (!ref) return;

      const rect = ref.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const elementCenterX = rect.left + rect.width / 2 - containerRect.left + container.scrollLeft;
      
      const distance = Math.abs(elementCenterX - centerX);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestShoeId = key;
      }
    });

    if (closestShoeId) {
      const shoe = filteredShoes.find(s => s.id === parseInt(closestShoeId));
      if (shoe && shoe.id !== selectedShoe?.id) {
        setSelectedShoe(shoe);
        setCurrentImageIndex(0);
        currentIndexRef.current = 0;
        stopAutoRotate();
        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = setTimeout(() => {
          if (!isDragging && selectedShoe && selectedShoe.images.length > 1) {
            startAutoRotate();
          }
        }, 3000);
      }
    }
  };

  // Auto-select first shoe when filtered shoes change
  useEffect(() => {
    if (filteredShoes.length > 0 && !filteredShoes.find(s => s.id === selectedShoe?.id)) {
      setSelectedShoe(filteredShoes[0]);
      setCurrentImageIndex(0);
      currentIndexRef.current = 0;
    }
  }, [filteredShoes]);

  // ===== 360° ROTATION FUNCTIONS =====
  
  // Move to next image - FIXED VERSION
  const goToNextImage = () => {
    if (!selectedShoe || selectedShoe.images.length <= 1) {
      console.log('❌ No shoe or only 1 image');
      return;
    }
    
    // Calculate next index using ref to avoid stale state
    const totalImages = selectedShoe.images.length;
    const nextIndex = (currentIndexRef.current + 1) % totalImages;
    
    console.log(`🔄 Moving to image ${nextIndex + 1}/${totalImages}`);
    
    // Update both state and ref
    setCurrentImageIndex(nextIndex);
    currentIndexRef.current = nextIndex;
    
    // If we've completed all images, advance to next shoe
    if (nextIndex === 0 && filteredShoes.length > 1) {
      console.log('📦 Completed all images, moving to next shoe');
      setTimeout(() => {
        const currentShoeIndex = filteredShoes.findIndex(s => s.id === selectedShoe.id);
        const nextShoeIndex = (currentShoeIndex + 1) % filteredShoes.length;
        if (nextShoeIndex !== currentShoeIndex) {
          const nextShoe = filteredShoes[nextShoeIndex];
          setSelectedShoe(nextShoe);
          setCurrentImageIndex(0);
          currentIndexRef.current = 0;
          // Scroll thumbnail to show the selected shoe
          const thumbElement = thumbnailRefs.current[nextShoe.id];
          if (thumbElement) {
            thumbElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'nearest', 
              inline: 'center' 
            });
          }
        }
      }, 800);
    }
  };

  // Start auto-rotation
  const startAutoRotate = () => {
    if (!selectedShoe || selectedShoe.images.length <= 1) {
      console.log('❌ Cannot start auto-rotation: no shoe or only 1 image');
      return;
    }
    
    // Stop any existing rotation
    stopAutoRotate();
    
    console.log(`🔄 Starting auto-rotation for: ${selectedShoe.name} (${selectedShoe.images.length} images)`);
    setIsAutoRotating(true);
    
    // Reset index if at the end
    if (currentIndexRef.current >= selectedShoe.images.length) {
      currentIndexRef.current = 0;
      setCurrentImageIndex(0);
    }
    
    autoRotateTimerRef.current = setInterval(() => {
      goToNextImage();
    }, 2500); // 2.5 seconds per image
  };

  // Stop auto-rotation
  const stopAutoRotate = () => {
    setIsAutoRotating(false);
    if (autoRotateTimerRef.current) {
      clearInterval(autoRotateTimerRef.current);
      autoRotateTimerRef.current = null;
      console.log('⏹️ Auto-rotation stopped');
    }
  };

  // Mouse drag for 360° rotation
  const handleMouseDown = (e) => {
    if (!selectedShoe || selectedShoe.images.length <= 1) return;
    
    stopAutoRotate();
    setIsDragging(true);
    setStartX(e.clientX);
    setStartAngle(currentIndexRef.current);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const angleChange = Math.round(deltaX / 10);
    let newIndex = startAngle + angleChange;
    
    while (newIndex < 0) newIndex += selectedShoe.images.length;
    while (newIndex >= selectedShoe.images.length) newIndex -= selectedShoe.images.length;
    
    setCurrentImageIndex(newIndex);
    currentIndexRef.current = newIndex;
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setTimeout(() => {
        if (!isDragging && selectedShoe && selectedShoe.images.length > 1) {
          startAutoRotate();
        }
      }, 5000);
    }
  };

  // Touch events for mobile
  const handleTouchStart = (e) => {
    if (!selectedShoe || selectedShoe.images.length <= 1) return;
    
    stopAutoRotate();
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartAngle(currentIndexRef.current);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - startX;
    const angleChange = Math.round(deltaX / 10);
    let newIndex = startAngle + angleChange;
    
    while (newIndex < 0) newIndex += selectedShoe.images.length;
    while (newIndex >= selectedShoe.images.length) newIndex -= selectedShoe.images.length;
    
    setCurrentImageIndex(newIndex);
    currentIndexRef.current = newIndex;
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      setTimeout(() => {
        if (!isDragging && selectedShoe && selectedShoe.images.length > 1) {
          startAutoRotate();
        }
      }, 5000);
    }
  };

  // Start auto-rotation when shoe changes
  useEffect(() => {
    if (selectedShoe && selectedShoe.images.length > 1) {
      stopAutoRotate();
      currentIndexRef.current = 0;
      setCurrentImageIndex(0);
      setTimeout(() => startAutoRotate(), 1500);
    }
    return () => stopAutoRotate();
  }, [selectedShoe]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoRotate();
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('👟 Please select a size first!');
      return;
    }
    
    setIsAdded(true);
    alert(`🛒 Added ${selectedShoe.name} (Size ${selectedSize}) to cart!`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Show empty state
  if (!selectedShoe || filteredShoes.length === 0) {
    return (
      <div className="showcase-container">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>👟 No Shoes Found</h2>
          <p style={{ color: '#888', marginTop: '10px' }}>
            {activeCategory === 'All' 
              ? 'Please add some shoes in the ' 
              : `No shoes found in "${activeCategory}" category. `}
            <a href="/admin" style={{ color: '#3498db' }}>Admin Panel</a>
          </p>
        </div>
      </div>
    );
  }

  const totalImages = selectedShoe.images ? selectedShoe.images.length : 0;

  return (
    <div className="showcase-container">
      {/* Category Filters */}
      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Main Display Area */}
      <div 
        className="showcase-main"
        ref={imageContainerRef}
      >
        {/* Large Shoe Image - With 360° Interaction */}
        <div 
          className="main-image-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ cursor: totalImages > 1 ? 'grab' : 'default' }}
        >
          {selectedShoe.images && selectedShoe.images.length > 0 && (
            <>
              <img 
                src={selectedShoe.images[currentImageIndex]} 
                alt={`${selectedShoe.name} - Angle ${currentImageIndex + 1}`}
                className="main-shoe-image"
                key={selectedShoe.id + currentImageIndex}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  padding: '0',
                  transition: 'opacity 0.3s ease-in-out'
                }}
              />
              
              {/* 360° Badge */}
              {totalImages > 1 && (
                <div className="rotation-badge">
                  🔄 {isAutoRotating ? 'Auto-Rotating' : 'Drag to rotate'} • {currentImageIndex + 1}/{totalImages}
                </div>
              )}

              {/* Angle Indicator Dots */}
              {totalImages > 1 && (
                <div className="angle-dots">
                  {Array.from({ length: totalImages }).map((_, index) => (
                    <span 
                      key={index}
                      className={`dot ${currentImageIndex === index ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                        currentIndexRef.current = index;
                        stopAutoRotate();
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Play/Pause Button */}
              {totalImages > 1 && (
                <button 
                  className="rotation-toggle-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAutoRotating) {
                      stopAutoRotate();
                    } else {
                      startAutoRotate();
                    }
                  }}
                >
                  {isAutoRotating ? '⏸' : '▶'}
                </button>
              )}
            </>
          )}
        </div>

        {/* Shoe Details */}
        <div className="shoe-details">
          <h2 className="shoe-name">{selectedShoe.name}</h2>
          <p className="shoe-brand">{selectedShoe.brand}</p>
          <p className="shoe-price">Ksh {selectedShoe.price.toLocaleString()}</p>
          
          {totalImages > 1 && (
            <p className="rotation-hint">
              👆 Drag image to rotate • Auto-rotating
            </p>
          )}
          
          <div className="size-selector">
            <label>Select Size:</label>
            <div className="size-buttons">
              {selectedShoe.sizes.map((size) => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button 
            className={`add-to-cart-btn ${isAdded ? 'added' : ''}`}
            onClick={handleAddToCart}
          >
            {isAdded ? '✓ Added to Cart!' : 'Add to Cart 🛒'}
          </button>

          {/* Try-On Placeholder */}
          <div className="try-on-section">
            <button 
              className="try-on-btn"
              onClick={() => {
                alert('👟 Virtual Try-On Coming Soon!\n\nTry shoes on your feet before buying.\nWe\'ll notify you when it\'s ready!');
              }}
            >
              👟 Try On (Coming Soon)
            </button>
            <div className="try-on-message">
              <span className="coming-soon-badge">⚡ Coming Soon</span>
              <span className="try-on-hint">
                Try shoes on your feet before buying!
              </span>
            </div>
            <div className="try-on-notify">
              <input 
                type="email" 
                placeholder="Enter email to get notified..." 
                className="try-on-notify-input"
              />
              <button 
                className="try-on-notify-btn"
                onClick={() => {
                  alert('✅ Thank you! We\'ll notify you when Virtual Try-On is ready.');
                }}
              >
                🔔 Notify Me
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnails - ONE image per shoe */}
      <div className="thumbnails-container">
        <div 
          className="thumbnails-scroll"
          ref={thumbnailsContainerRef}
          onScroll={handleScroll}
        >
          {filteredShoes.map((shoe) => (
            <div 
              key={shoe.id} 
              className="thumbnail-group"
              ref={(el) => {
                if (el) {
                  thumbnailRefs.current[shoe.id] = el;
                }
              }}
            >
              {shoe.images && shoe.images.length > 0 && (
                <img
                  src={shoe.images[0]}
                  alt={shoe.name}
                  className={`thumbnail ${selectedShoe.id === shoe.id ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick(shoe)}
                  loading="lazy"
                  title={shoe.name}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ShoeShowcase;