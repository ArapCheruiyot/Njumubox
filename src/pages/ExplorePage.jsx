import { Link } from 'react-router-dom';
import ShoeShowcase from '../components/ShoeShowcase';
import logo from '../assets/logo.png';

function ExplorePage() {
  return (
    <div className="app">
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="NdulaBox Logo" className="logo-image" />
          <h1 className="logo-text">NdulaBox</h1>
        </div>
        <div className="header-right">
          <span className="tagline">Explore All Shoes</span>
          <Link to="/" className="admin-link" style={{ borderColor: '#27ae60' }}>
            ← Back to Stores
          </Link>
          <Link to="/admin" className="admin-link">
            🔧 Admin
          </Link>
        </div>
      </header>

      <ShoeShowcase />

      <footer className="footer">
        <p>© 2026 NdulaBox. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ExplorePage;