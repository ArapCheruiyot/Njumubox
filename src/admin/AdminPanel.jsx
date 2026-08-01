import { useState, useEffect } from 'react';
import { shoesCollection, addDoc, getDocs, query, where, deleteDoc, doc } from '../firebase';
import '../css/admin.css';

function AdminPanel({ user, userProfile }) {
  const [shoeData, setShoeData] = useState({
    name: '',
    brand: '',
    price: '',
    category: 'Gents',
    sizes: '',
    images: []
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [userShoes, setUserShoes] = useState([]);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Load user's shoes
  useEffect(() => {
    if (user) {
      loadUserShoes();
    }
  }, [user]);

  const loadUserShoes = async () => {
    try {
      const q = query(shoesCollection, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const loadedShoes = [];
      querySnapshot.forEach((doc) => {
        loadedShoes.push({ id: doc.id, ...doc.data() });
      });
      setUserShoes(loadedShoes);
      console.log('📦 Loaded user shoes:', loadedShoes.length);
    } catch (error) {
      console.error('Error loading user shoes:', error);
    }
  };

  // ✅ HANDLE IMAGE UPLOAD TO CLOUDINARY
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setMessage('📤 Uploading images...');

    const uploadedUrls = [];
    const shoeFolder = shoeData.name 
      ? `ndulabox/shoes/${shoeData.name.toLowerCase().replace(/ /g, '-')}`
      : 'ndulabox/shoes/temp';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', shoeFolder);
      formData.append('public_id', `angle-${i + 1}`);

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        );
        const data = await response.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
          setUploadProgress(((i + 1) / files.length) * 100);
          setMessage(`📤 Uploaded ${i + 1} of ${files.length} images`);
        }
      } catch (error) {
        console.error('❌ Upload error:', error);
        setMessage('❌ Upload failed! Please try again.');
        setUploading(false);
        return;
      }
    }

    setShoeData(prev => ({ ...prev, images: uploadedUrls }));
    setUploading(false);
    setMessage(`✅ ${uploadedUrls.length} images uploaded successfully!`);
  };

  // ✅ SAVE SHOE WITH USER ID AND STORE NAME
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!shoeData.name || !shoeData.price || shoeData.images.length === 0) {
      setMessage('❌ Please fill all fields and upload images!');
      return;
    }

    const sizesArray = shoeData.sizes.split(',').map(s => s.trim());
    
    const newShoe = {
      name: shoeData.name,
      brand: shoeData.brand,
      price: parseInt(shoeData.price),
      category: shoeData.category,
      sizes: sizesArray.map(Number),
      images: shoeData.images,
      thumbnail: shoeData.images[0],
      userId: user.uid,
      userEmail: user.email,
      storeName: userProfile?.storeName || 'Unnamed Store',
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(shoesCollection, newShoe);
      setMessage(`✅ Shoe "${shoeData.name}" added to ${userProfile?.storeName}!`);
      
      setShoeData({
        name: '',
        brand: '',
        price: '',
        category: 'Gents',
        sizes: '',
        images: []
      });
      setUploadProgress(0);
      loadUserShoes();
    } catch (error) {
      console.error('❌ Save error:', error);
      setMessage('❌ Failed to save. Please try again.');
    }
  };

  // ✅ DELETE SHOE
  const handleDeleteShoe = async (shoeId) => {
    if (window.confirm('Are you sure you want to delete this shoe?')) {
      try {
        await deleteDoc(doc(shoesCollection, shoeId));
        setMessage('✅ Shoe deleted successfully!');
        loadUserShoes();
      } catch (error) {
        console.error('Delete error:', error);
        setMessage('❌ Failed to delete.');
      }
    }
  };

  return (
    <div className="admin-panel">
      <h1>👟 {userProfile?.storeName || 'NdulaBox'}</h1>
      <p className="admin-subtitle">
        Welcome, {userProfile?.displayName || user?.email}
      </p>
      <p style={{ color: '#888', fontSize: '0.9rem' }}>
        📦 {userShoes.length} shoes in your catalogue
      </p>

      {message && (
        <div className={`admin-message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        {/* Shoe Name */}
        <div className="form-group">
          <label>Shoe Name *</label>
          <input
            type="text"
            value={shoeData.name}
            onChange={(e) => setShoeData({...shoeData, name: e.target.value})}
            placeholder="e.g., Air Zoom Pulse"
            required
          />
        </div>

        {/* Brand */}
        <div className="form-group">
          <label>Brand *</label>
          <input
            type="text"
            value={shoeData.brand}
            onChange={(e) => setShoeData({...shoeData, brand: e.target.value})}
            placeholder="e.g., Nike, Adidas"
            required
          />
        </div>

        {/* Price */}
        <div className="form-group">
          <label>Price (Ksh) *</label>
          <input
            type="number"
            value={shoeData.price}
            onChange={(e) => setShoeData({...shoeData, price: e.target.value})}
            placeholder="e.g., 15000"
            required
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label>Category *</label>
          <select
            value={shoeData.category}
            onChange={(e) => setShoeData({...shoeData, category: e.target.value})}
            required
          >
            <option value="Gents">Gents</option>
            <option value="Ladies">Ladies</option>
            <option value="Kids">Kids</option>
            <option value="Running">Running</option>
            <option value="Casual">Casual</option>
            <option value="Skate">Skate</option>
          </select>
        </div>

        {/* Sizes */}
        <div className="form-group">
          <label>Sizes (comma separated) *</label>
          <input
            type="text"
            value={shoeData.sizes}
            onChange={(e) => setShoeData({...shoeData, sizes: e.target.value})}
            placeholder="e.g., 6,7,8,9,10"
            required
          />
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>Upload Shoe Images *</label>
          <div className="upload-area">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="file-input"
            />
            <div className="upload-hint">
              <span>📁 Click to select multiple images</span>
              <span className="hint-text">Select 8-12 images for 360° rotation</span>
            </div>
          </div>
          
          {uploading && (
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
              <span className="progress-text">{Math.round(uploadProgress)}%</span>
            </div>
          )}

          {shoeData.images.length > 0 && (
            <div className="uploaded-images">
              <p className="upload-success">✅ {shoeData.images.length} images uploaded</p>
              <div className="image-previews">
                {shoeData.images.map((url, i) => (
                  <img key={i} src={url} alt={`Angle ${i+1}`} className="preview-thumb" />
                ))}
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={uploading}>
          {uploading ? '⏳ Uploading...' : '➕ Add Shoe to Catalogue'}
        </button>
      </form>

      {/* Display User's Shoes */}
      <div className="view-shoes">
        <h3>📚 Your Shoes ({userShoes.length})</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
          {userShoes.map((shoe) => (
            <div key={shoe.id} style={{ 
              background: '#f8f9fa', 
              padding: '10px', 
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              minWidth: '150px'
            }}>
              <strong>{shoe.name}</strong>
              <br />
              <small>{shoe.brand} - Ksh {shoe.price}</small>
              <br />
              <button 
                onClick={() => handleDeleteShoe(shoe.id)}
                style={{ 
                  background: '#e74c3c', 
                  color: 'white', 
                  border: 'none', 
                  padding: '3px 10px',
                  borderRadius: '4px',
                  marginTop: '5px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          ))}
          {userShoes.length === 0 && (
            <p style={{ color: '#888' }}>No shoes added yet. Add your first shoe above!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;