import { Link } from 'react-router-dom';
import ShoeShowcase from '../components/ShoeShowcase';
import logo from '../assets/logo.png';

function Home() {
  // ===== CONFIGURE YOUR CONTACT DETAILS HERE =====
  const phoneNumber = "254114932232"; // ← REPLACE WITH YOUR NUMBER
  const whatsappMessage = "Hello NdulaBox! I'm interested in purchasing some shoes. Can you help me?";
  
  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  const callLink = `tel:+${phoneNumber}`;

  return (
    <div className="app">
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="NdulaBox Logo" className="logo-image" />
          <h1 className="logo-text">NdulaBox</h1>
        </div>
        
        <div className="header-right">
          <span className="tagline">Premium Footwear</span>
          <Link to="/admin" className="admin-link">
            🔧 Admin
          </Link>
          <div className="cart-icon">
            🛒 <span className="cart-count">0</span>
          </div>
        </div>
      </header>
      
      <ShoeShowcase />
      
      <footer className="footer">
        <p>© 2026 NdulaBox. All rights reserved.</p>
        <p className="footer-contact">
          📞 <a href={callLink}>Call us</a> • 
          💬 <a href={whatsappLink} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </p>
      </footer>

      {/* ===== FLOATING ACTION BUTTONS ===== */}
      <div className="floating-buttons">
        {/* WhatsApp Button */}
        <a 
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="float-btn whatsapp"
          title="Chat on WhatsApp"
        >
          <span className="float-icon">💬</span>
          <span className="float-label">WhatsApp</span>
        </a>

        {/* Call Button */}
        <a 
          href={callLink}
          className="float-btn call"
          title="Call us"
        >
          <span className="float-icon">📞</span>
          <span className="float-label">Call Now</span>
        </a>
      </div>
    </div>
  );
}

export default Home;