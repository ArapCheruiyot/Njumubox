import './App.css';
import { useState, useEffect } from 'react';
import ReactGA from 'react-ga4';
import StoryModal from './StoryModal';
import Message from './Message';
import Pricing from './Pricing';
import LanguageRotator from './LanguageRotator';
import About from './About';
import Services from './Services';

// Initialize Google Analytics with your Measurement ID
ReactGA.initialize('G-DK128QB2VE');

function App() {
  const [modalStory, setModalStory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track page views
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  const openModal = (storyId) => {
    setModalStory(storyId);
  };

  const closeModal = () => {
    setModalStory(null);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div>
      {/* Navigation */}
      <nav className="nav">
        <div className="logo">
          <span>◇</span>vision-to-version.com
        </div>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#work">Work</a>
          <a href="#envisioned">Ideas</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </div>
        <button 
          className="mobile-menu-btn" 
          id="mobileMenuBtn"
          onClick={toggleMobileMenu}
          style={{ cursor: 'pointer' }}
        >
          ☰
        </button>
      </nav>

      {/* Mobile menu */}
      <div 
        className="mobile-menu" 
        id="mobileMenu"
        style={{
          display: isMobileMenuOpen ? 'flex' : 'none',
          flexDirection: 'column',
          position: 'absolute',
          top: '60px',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '20px',
          zIndex: 1000
        }}
      >
        <a href="#about" onClick={closeMobileMenu} style={styles.mobileLink}>About</a>
        <a href="#services" onClick={closeMobileMenu} style={styles.mobileLink}>Services</a>
        <a href="#work" onClick={closeMobileMenu} style={styles.mobileLink}>Work</a>
        <a href="#envisioned" onClick={closeMobileMenu} style={styles.mobileLink}>Ideas</a>
        <a href="#pricing" onClick={closeMobileMenu} style={styles.mobileLink}>Pricing</a>
        <a href="#contact" onClick={closeMobileMenu} style={styles.mobileLink}>Contact</a>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <img src="/images/VictorMoses.png" alt="Victor + Moses — Code & Vision" />
        </div>
        
        {/* Language Rotator - Floating on hero image */}
        <LanguageRotator />
        
        <div className="hero-content">
          <h1>
            We turn <span className="highlight">ideas</span>
            <br />into working code.
          </h1>
          <div className="tagline">
            "We don't just imagine the future. We build it, line by line."
          </div>
          <div className="signature">
            — Victor, Business & Ideas
            <br />
            — Moses, Code & Execution
          </div>
          <a href="#work" className="cta-button">View our work →</a>
        </div>
      </section>

      {/* About Section */}
      <About />

      {/* Services Section */}
      <Services />

      {/* Scroll hint */}
      <div className="scroll-hint">
        ▼ Scroll down for portfolio & envisioned projects ▼
      </div>

      {/* Portfolio Section */}
      <section id="work" className="section">
        <div className="container">
          <h2 className="section-title">What we've built</h2>
          <div className="portfolio-grid">
            
            {/* 🆕 NdulaBox Card - MOVED TO FIRST POSITION */}
            <div className="portfolio-card">
              <img src="/images/ndulabox-preview.png" alt="NdulaBox shoe marketplace" className="card-screenshot" />
              <h3>👟 NdulaBox — Shoe Marketplace</h3>
              <p>E-commerce marketplace connecting Kenyan shoe vendors directly with customers. Each vendor gets their own store link to share. Camera upload, real-time search, and mobile-first design.</p>
              <small>React • Firebase • Cloudinary • Vite</small>
              <div className="card-links">
                <a href="https://njumubox.onrender.com/" target="_blank" rel="noopener noreferrer" className="card-link">
                  Live Demo →
                </a>
                <a href="https://github.com/ArapCheruiyot/ndulabox" target="_blank" rel="noopener noreferrer" className="card-link">
                  GitHub →
                </a>
                <button className="card-link story-btn" onClick={() => openModal('ndulabox')}>
                  Read Story →
                </button>
              </div>
            </div>

            {/* Superkeeper Card */}
            <div className="portfolio-card">
              <img src="/images/logo.png" alt="Superkeeper dashboard" className="card-screenshot" />
              <h3>📦 Superkeeper</h3>
              <p>Inventory management for small shops in Kenya. Track stock, manage staff, see sales in real-time. Ready for first customers.</p>
              <small>Flask • SQLite • HTML/CSS/JS</small>
              <div className="card-links">
                <a href="https://superkeeperapp-6isv.onrender.com/" target="_blank" rel="noopener noreferrer" className="card-link">
                  Live Demo →
                </a>
                <button className="card-link story-btn" onClick={() => openModal('superkeeper')}>
                  Read Story →
                </button>
              </div>
            </div>

            {/* CareCrewKe Card */}
            <div className="portfolio-card">
              <img src="/images/carecrewlogo.png" alt="CareCrewKe platform" className="card-screenshot" />
              <h3>👥 CareCrewKe</h3>
              <p>AI-powered job platform with CV matching and smart recommendations.</p>
              <small>Flask • AI • Firebase</small>
            </div>

            {/* Facebook Data Collector Card */}
            <div className="portfolio-card">
              <img src="/images/facebook-collector.png" alt="Facebook Data Collector" className="card-screenshot" />
              <h3>📘 Facebook Data Collector</h3>
              <p>Extract structured data from Facebook posts — dates, locations, people mentioned, comments, and action categories. Saves locally to CSV.</p>
              <small>Python • Flask • Regex • NLP</small>
              <div className="card-links">
                <a href="https://facebook-data-collector.onrender.com/" target="_blank" rel="noopener noreferrer" className="card-link">
                  Live Demo →
                </a>
                <button className="card-link story-btn" onClick={() => openModal('facebook')}>
                  Read Story →
                </button>
              </div>
            </div>

            {/* M-Pesa API Playground Card */}
            <div className="portfolio-card">
              <img src="/images/darajaplay.png" alt="M-Pesa API Playground dashboard" className="card-screenshot" />
              <h3>💰 M-Pesa API Playground</h3>
              <p>Interactive demo platform for Safaricom M-Pesa Daraja APIs. Test STK Push (C2B) and B2C payments in sandbox environment. Built with Flask and Daraja API.</p>
              <small>Python • Flask • Daraja API • REST</small>
              <div className="card-links">
                <a href="https://mpesa-daraja-apis.onrender.com/" target="_blank" rel="noopener noreferrer" className="card-link">
                  Live Demo →
                </a>
                <a href="https://github.com/ArapCheruiyot/Darajaplay" target="_blank" rel="noopener noreferrer" className="card-link">
                  GitHub →
                </a>
                <button className="card-link story-btn" onClick={() => openModal('mpesa')}>
                  Read Story →
                </button>
              </div>
            </div>

            {/* Urban MoveHomes Card */}
            <div className="portfolio-card">
              <img src="/images/urban-movehomes.png" alt="Urban MoveHomes website" className="card-screenshot" />
              <h3>🚚 Urban MoveHomes</h3>
              <p>Fully responsive website for a professional moving company in Kenya. Includes admin dashboard, quote form, and WhatsApp integration.</p>
              <small>React • Firebase • CSS</small>
              <div className="card-links">
                <a href="https://urbanmoveshomes.onrender.com/" target="_blank" rel="noopener noreferrer" className="card-link">
                  Live Demo →
                </a>
                <button className="card-link story-btn" onClick={() => openModal('urban-movehomes')}>
                  Read Story →
                </button>
              </div>
            </div>

            {/* SayIt Card */}
            <div className="portfolio-card">
              <img src="/images/sayit.png" alt="SayIt reading helper app" className="card-screenshot" />
              <h3>📖 SayIt — Reading Helper</h3>
              <p>Kid-friendly web app that helps children read independently. Point phone at a word, tap to hear it pronounced. No typing required.</p>
              <small>React • Tesseract.js • Web Speech API</small>
              <div className="card-links">
                <a href="https://sayit-yq89.onrender.com/" target="_blank" rel="noopener noreferrer" className="card-link">
                  Live Demo →
                </a>
                <button className="card-link story-btn" onClick={() => openModal('sayit')}>
                  Read Story →
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Envisioned Projects Section */}
      <section id="envisioned" className="section section-dark">
        <div className="container">
          <h2 className="section-title">What we're envisioning</h2>
          <div className="envisioned-grid">
            <div className="envisioned-card">
              <h3>🎓 AI College</h3>
              <p>Interactive platform where AI teaches coding with personalized attention.</p>
              <span className="status-badge">In Development</span>
            </div>
            <div className="envisioned-card">
              <h3>🔒 Focus Learning Mode</h3>
              <p>Distraction-free learning with engagement tracking.</p>
              <span className="status-badge">Planning Phase</span>
            </div>
            <div className="envisioned-card">
              <h3>📊 Parent Dashboard</h3>
              <p>Real-time insights into learning progress.</p>
              <span className="status-badge">Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing />

      {/* Contact Section */}
      <Message />

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Vision-to-Version — Victor + Moses</p>
      </footer>

      {/* Modal Component */}
      <StoryModal storyId={modalStory} onClose={closeModal} />
    </div>
  );
}

const styles = {
  mobileLink: {
    display: 'block',
    padding: '12px 0',
    textDecoration: 'none',
    color: '#333',
    fontSize: '16px',
    fontWeight: '500',
    borderBottom: '1px solid #eee'
  }
};

export default App;