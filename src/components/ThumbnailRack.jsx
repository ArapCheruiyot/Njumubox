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

  // Navigation functions
  const goToPrev = () => {
    if (currentIndex > 0) {
      onSelectShoe(shoes[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    if (currentIndex < shoes.length - 1) {
      onSelectShoe(shoes[currentIndex + 1]);
    }
  };

  return (
    <div className={`thumbnail-rack ${shoes.length === 1 ? 'single-shoe' : ''}`}>
      {/* Previous Arrow - Hide if only 1 shoe */}
      {shoes.length > 1 && (
        <button 
          className="rack-arrow rack-arrow-prev" 
          onClick={goToPrev}
          disabled={currentIndex === 0}
          aria-label="Previous shoe"
        >
          ‹
        </button>
      )}

      {/* Thumbnail - Only 1 */}
      <div className="rack-thumbnails">
        {selectedShoe && selectedShoe.images && selectedShoe.images.length > 0 && (
          <div className="rack-thumb-wrapper">
            <img
              src={selectedShoe.images[0]}
              alt={selectedShoe.name}
              className="rack-thumb active"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Next Arrow - Hide if only 1 shoe */}
      {shoes.length > 1 && (
        <button 
          className="rack-arrow rack-arrow-next" 
          onClick={goToNext}
          disabled={currentIndex === shoes.length - 1}
          aria-label="Next shoe"
        >
          ›
        </button>
      )}

      {/* Dots indicator - Hide if only 1 shoe */}
      {shoes.length > 1 && (
        <div className="rack-dots">
          {shoes.map((_, index) => (
            <span 
              key={index}
              className={`rack-dot ${currentIndex === index ? 'active' : ''}`}
              onClick={() => onSelectShoe(shoes[index])}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ThumbnailRack;