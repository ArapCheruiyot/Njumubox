import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { initGA, trackPageView } from './utils/analytics';
import Home from './pages/Home';
import StorePage from './pages/StorePage';
import AdminPage from './pages/AdminPage';

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    // Initialize GA once
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
  }, []);

  useEffect(() => {
    // Track page views on route change
    trackPageView(location.pathname);
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/store/:vendorId" element={<StorePage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;