import { useState } from 'react';

function ProductCard({ shoe }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('👟 Please select a size first!');
      return;
    }
    
    setIsAdded(true);
    alert(`🛒 Added ${shoe.name} (Size ${selectedSize}) to cart!`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Format price in Ksh
  const formattedPrice = shoe.price.toLocaleString();

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={shoe.image} alt={shoe.name} />
        <span className="category-badge">{shoe.category}</span>
      </div>
      
      <h3>{shoe.name}</h3>
      <p className="brand">{shoe.brand}</p>
      <p className="price">Ksh {formattedPrice}</p>
      
      <div className="size-selector">
        <label>Size:</label>
        <div className="size-buttons">
          {shoe.sizes.map((size) => (
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
        className={`add-to-cart ${isAdded ? 'added' : ''}`}
        onClick={handleAddToCart}
      >
        {isAdded ? '✓ Added!' : 'Add to Cart 🛒'}
      </button>
    </div>
  );
}

export default ProductCard;