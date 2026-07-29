import { useState } from 'react';
import ProductCard from './ProductCard';
import { shoes } from '../data/shoes';

function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Get unique categories
  const categories = ['All', ...new Set(shoes.map(shoe => shoe.category))];
  
  // Filter shoes based on active category
  const filteredShoes = activeCategory === 'All' 
    ? shoes 
    : shoes.filter(shoe => shoe.category === activeCategory);

  return (
    <div className="product-section">
      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="product-grid">
        {filteredShoes.map((shoe) => (
          <ProductCard key={shoe.id} shoe={shoe} />
        ))}
      </div>
      
      {filteredShoes.length === 0 && (
        <p className="no-products">No shoes found in this category.</p>
      )}
    </div>
  );
}

export default ProductGrid;