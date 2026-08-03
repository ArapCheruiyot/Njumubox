import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, usersCollection, setDoc, doc } from '../firebase';

function SetupProfile({ user }) {
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  // NEW: Location states
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [street, setStreet] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Validate phone number (Kenyan format)
  const validatePhone = (number) => {
    if (!number) return true;
    const cleaned = number.replace(/\s/g, '');
    return /^254\d{9}$/.test(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!storeName.trim()) {
      setError('Please enter a store name');
      return;
    }

    if (!city.trim()) {
      setError('Please enter your city/town');
      return;
    }

    if (phone && !validatePhone(phone)) {
      setError('Please enter a valid phone number (e.g., 254712345678)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanPhone = phone ? phone.replace(/[\s+]/g, '') : '';
      
      // Save user profile to Firestore
      await setDoc(doc(usersCollection, user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        storeName: storeName.trim(),
        phone: cleanPhone,
        // NEW: Location fields
        location: {
          city: city.trim(),
          area: area.trim() || '',
          street: street.trim() || '',
          fullAddress: `${city.trim()}${area ? `, ${area.trim()}` : ''}${street ? `, ${street.trim()}` : ''}`
        },
        storeDescription: '',
        createdAt: new Date().toISOString(),
        logo: ''
      });

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
          Set up your store details to get started.
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
          {/* Store Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: 'white', display: 'block', marginBottom: '8px' }}>
              Store Name *
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g., Safari Kick Ke"
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

          {/* NEW: Location Section */}
          <div style={{ 
            marginBottom: '20px',
            padding: '15px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <label style={{ color: 'white', display: 'block', marginBottom: '10px', fontSize: '0.95rem' }}>
              📍 Store Location
            </label>
            
            {/* City/Town - Required */}
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City/Town * (e.g., Nairobi, Mombasa)"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '0.95rem'
                }}
                required
              />
            </div>

            {/* Estate/Area - Optional */}
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Estate/Area (e.g., Langata, Westlands)"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            {/* Street/Shop - Optional */}
            <div>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Street/Shop (e.g., Moi Avenue, Shop 12)"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <small style={{ color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '8px' }}>
              Your location helps customers trust your store
            </small>
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: 'white', display: 'block', marginBottom: '8px' }}>
              📞 Phone Number <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>(Optional)</span>
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