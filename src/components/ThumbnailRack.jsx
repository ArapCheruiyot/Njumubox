// components/ThumbnailRack.jsx
import React from 'react';
import '../css/ThumbnailRack.css';

const ThumbnailRack = ({ 
  shoes = [], 
  selectedShoe = null, 
  onSelectShoe = () => {} 
}) => {
  if (!shoes || shoes.length === 0) return null;

  // Find current index
  const currentIndex = shoes.findIndex(s => s.id === selectedShoe?.id);
  if (currentIndex === -1) return null;

  // Get visible thumbnails (3 at a time, centered on selected)
  const visibleCount = 3;
  const total = shoes.length;
  let start = Math.max(0, currentIndex - 1);
  let end = Math.min(total, start + visibleCount);
  
  if (end - start < visibleCount && start > 0) {
    start = Math.max(0, total - visibleCount);
    end = total;
  }
  
  const visibleThumbs = shoes.slice(start, end);

  // Navigation functions
  const goToPrev = () => {
    if (currentIndex > 0) {
      onSelectShoe(shoes[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    if (currentIndex < total - 1) {
      onSelectShoe(shoes[currentIndex + 1]);
    }
  };

  return (
    <div className="thumbnail-rack">
      {/* Previous Arrow */}
      <button 
        className="rack-arrow rack-arrow-prev" 
        onClick={goToPrev}
        disabled={currentIndex === 0}
        aria-label="Previous shoe"
      >
        ‹
      </button>

      {/* Thumbnails */}
      <div className="rack-thumbnails">
        {visibleThumbs.map((shoe) => (
          <div key={shoe.id} className="rack-thumb-wrapper">
            {shoe.images && shoe.images.length > 0 && (
              <img
                src={shoe.images[0]}
                alt={shoe.name}
                className={`rack-thumb ${selectedShoe?.id === shoe.id ? 'active' : ''}`}
                onClick={() => onSelectShoe(shoe)}
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>

      {/* Next Arrow */}
      <button 
        className="rack-arrow rack-arrow-next" 
        onClick={goToNext}
        disabled={currentIndex === total - 1}
        aria-label="Next shoe"
      >
        ›
      </button>

      {/* Dots indicator */}
      <div className="rack-dots">
        {shoes.map((_, index) => (
          <span 
            key={index}
            className={`rack-dot ${currentIndex === index ? 'active' : ''}`}
            onClick={() => onSelectShoe(shoes[index])}
          />
        ))}
      </div>
    </div>
  );
};

export default ThumbnailRack;