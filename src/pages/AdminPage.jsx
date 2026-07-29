import AdminPanel from '../admin/AdminPanel';
import '../css/admin.css';
import logo from '../assets/logo.png';  // ← IMPORT LOGO

function AdminPage() {
  return (
    <div className="app">
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="NdulaBox Logo" className="logo-image" />  {/* ← USE LOGO */}
          <h1 className="logo-text">NdulaBox</h1>
        </div>
        
        <div className="header-right">
          <span className="tagline">🔧 Admin Panel</span>
          <a href="/" className="back-to-store-btn">
            ← Back to Store
          </a>
        </div>
      </header>
      
      <AdminPanel />
      
      <footer className="footer">
        <p>© 2026 NdulaBox - Admin Panel</p>
      </footer>
    </div>
  );
}

export default AdminPage;