import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  auth, 
  provider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  usersCollection,
  getDoc,
  doc
} from '../firebase';
import AdminPanel from '../admin/AdminPanel.jsx';
import SetupProfile from './SetupProfile.jsx';
import { trackAppEvents } from '../utils/analytics';

function AdminPage() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const docRef = doc(usersCollection, currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists) {
            const data = docSnap.data();
            setUserProfile(data);
            setHasProfile(true);
            console.log('👤 User profile found:', data.storeName);
            // Track user login
            trackAppEvents.userLogin('Google');
          } else {
            setHasProfile(false);
            console.log('👤 New user - needs profile setup');
          }
        } catch (error) {
          console.error('Error checking profile:', error);
          setHasProfile(false);
        }
      } else {
        setHasProfile(false);
        setUserProfile(null);
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Login success:', result.user);
      // Login is tracked in the auth state change above
    } catch (error) {
      console.error('❌ Login error:', error);
      alert('Login failed: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setHasProfile(false);
      // Track user logout
      trackAppEvents.userLogout();
      console.log('👋 Logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0f0f1a',
        flexDirection: 'column'
      }}>
        <h1 style={{ color: 'white' }}>🔐 Admin Login</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          Login with Google to manage your shoe store
        </p>
        <button 
          onClick={handleLogin}
          style={{
            padding: '12px 30px',
            background: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          🚀 Login with Google
        </button>
      </div>
    );
  }

  if (!hasProfile) {
    return <SetupProfile user={user} />;
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '10px 20px',
        background: '#1a1a2e',
        color: 'white'
      }}>
        <div>
          <h2>👟 {userProfile?.storeName || 'NdulaBox Admin'}</h2>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
            {user.email}
          </span>
        </div>
        <div>
          <button onClick={handleLogout} style={{ padding: '5px 15px', cursor: 'pointer' }}>Logout</button>
          <a href="/" style={{ color: '#3498db', marginLeft: '15px' }}>← Back to Store</a>
        </div>
      </div>
      <AdminPanel user={user} userProfile={userProfile} />
    </div>
  );
}

export default AdminPage;