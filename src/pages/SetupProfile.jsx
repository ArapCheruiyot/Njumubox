import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, usersCollection, setDoc, doc } from '../firebase';

function SetupProfile({ user }) {
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');  // ← NEW: Phone state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Validate phone number (Kenyan format)
  const validatePhone = (number) => {
    if (!number) return true; // Optional field
    const cleaned = number.replace(/\s/g, '');
    // Kenyan format: 254XXXXXXXXX (12 digits total)
    return /^254\d{9}$/.test(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!storeName.trim()) {
      setError('Please enter a store name');
      return;
    }

    // Validate phone if provided
    if (phone && !validatePhone(phone)) {
      setError('Please enter a valid phone number (e.g., 254712345678)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Clean phone number (remove spaces, +, 0)
      const cleanPhone = phone ? phone.replace(/[\s+]/g, '') : '';
      
      // Save user profile to Firestore
      await setDoc(doc(usersCollection, user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        storeName: storeName.trim(),
        phone: cleanPhone,  // ← NEW: Save phone
        storeDescription: '',
        createdAt: new Date().toISOString(),
        logo: ''
      });

      // Redirect to admin panel
      navigate('/admin');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#0f0f1a',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '20px',
        maxWidth: '500px',
        width: '100%',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h1 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '10px' }}>
          🏪 Welcome, {user?.displayName || 'Vendor'}!
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>
          Please set up your store details to get started.
        </p>

        {error && (
          <div style={{
            background: 'rgba(255,0,0,0.1)',
            color: '#ff6b6b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid rgba(255,0,0,0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: 'white', display: 'block', marginBottom: '8px' }}>
              Store Name *
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g., John's Shoe Store"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          {/* NEW: Phone Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: 'white', display: 'block', marginBottom: '8px' }}>
              📞 Store Phone Number <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>(Optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., 254712345678"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
            <small style={{ color: 'rgba(255,255,255,0.4)', display: 'block', marginTop: '5px' }}>
              Format: 254XXXXXXXXX (Used for WhatsApp & Call buttons)
            </small>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #3498db, #2980b9)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Saving...' : '🚀 Start Selling'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetupProfile;