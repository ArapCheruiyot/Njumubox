import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';
import StorePage from './pages/StorePage';
import ExplorePage from './pages/ExplorePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/store/:vendorId" element={<StorePage />} />
        <Route path="/explore" element={<ExplorePage />} />
      </Routes>
    </Router>
  );
}

export default App;