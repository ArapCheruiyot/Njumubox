import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main site - http://localhost:5173/ */}
        <Route path="/" element={<Home />} />
        
        {/* Admin panel - http://localhost:5173/admin */}
        <Route path="/admin" element={<AdminPage />} />
        
        {/* Optional: 404 page */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;