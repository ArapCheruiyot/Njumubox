import { useState } from 'react';
import '../css/admin.css';

function AdminPanel() {
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

  // Your Cloudinary config
  const CLOUD_NAME = 'decckqobb';
  const UPLOAD_PRESET = 'ndulabox_uploads';

  // Check if shoe name already exists
  const checkDuplicateShoe = (name) => {
    const existingShoes = JSON.parse(localStorage.getItem('ndulabox_shoes') || '[]');
    const normalizedName = name.toLowerCase().trim();
    return existingShoes.some(shoe => shoe.name.toLowerCase().trim() === normalizedName);
  };

  // Handle image upload to Cloudinary - WITH DYNAMIC FOLDERS
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check for duplicates BEFORE uploading
    if (checkDuplicateShoe(shoeData.name)) {
      setMessage(`❌ A shoe named "${shoeData.name}" already exists! Please use a different name.`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage('📤 Uploading images...');

    const uploadedUrls = [];
    
    // Create a unique folder name based on shoe name
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
          {
            method: 'POST',
            body: formData
          }
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

    setShoeData(prev => ({
      ...prev,
      images: uploadedUrls
    }));

    setUploading(false);
    setMessage(`✅ ${uploadedUrls.length} images uploaded successfully to ${shoeFolder}!`);
  };

  // Handle form submission - Save shoe with ALL images
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!shoeData.name || !shoeData.price || shoeData.images.length === 0) {
      setMessage('❌ Please fill all fields and upload images!');
      return;
    }

    // Check for duplicates BEFORE saving
    if (checkDuplicateShoe(shoeData.name)) {
      setMessage(`❌ A shoe named "${shoeData.name}" already exists! Please use a different name.`);
      return;
    }

    // Format sizes
    const sizesArray = shoeData.sizes.split(',').map(s => s.trim());
    
    // Create shoe object
    const newShoe = {
      id: Date.now(),
      name: shoeData.name,
      brand: shoeData.brand,
      price: parseInt(shoeData.price),
      category: shoeData.category,
      sizes: sizesArray.map(Number),
      images: shoeData.images,
      thumbnail: shoeData.images[0]
    };

    console.log('📦 New Shoe Added:', newShoe);
    
    // Save to localStorage
    const existingShoes = JSON.parse(localStorage.getItem('ndulabox_shoes') || '[]');
    existingShoes.push(newShoe);
    localStorage.setItem('ndulabox_shoes', JSON.stringify(existingShoes));
    
    const folderName = shoeData.name.toLowerCase().replace(/ /g, '-');
    setMessage(`✅ Shoe "${shoeData.name}" added successfully! Images saved in: ndulabox/shoes/${folderName}/`);
    
    // Reset form
    setShoeData({
      name: '',
      brand: '',
      price: '',
      category: 'Gents',
      sizes: '',
      images: []
    });
    setUploadProgress(0);
  };

  return (
    <div className="admin-panel">
      <h1>👟 NdulaBox - Admin Panel</h1>
      <p className="admin-subtitle">Add new shoes to your catalogue</p>

      {/* Upload Status */}
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
            onChange={(e) => {
              const newName = e.target.value;
              setShoeData({...shoeData, name: newName});
              
              // Check duplicate in real-time
              if (newName && checkDuplicateShoe(newName)) {
                setMessage(`⚠️ A shoe named "${newName}" already exists!`);
              } else if (message.includes('already exists')) {
                setMessage('');
              }
            }}
            placeholder="e.g., Air Zoom Pulse"
            required
          />
          <small style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px' }}>
            📁 Folder will be: ndulabox/shoes/{shoeData.name ? shoeData.name.toLowerCase().replace(/ /g, '-') : 'shoe-name'}/
          </small>
          {shoeData.name && checkDuplicateShoe(shoeData.name) && (
            <small style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '4px' }}>
              ⚠️ This shoe name already exists! Please use a different name.
            </small>
          )}
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
              disabled={uploading || checkDuplicateShoe(shoeData.name)}
              className="file-input"
            />
            <div className="upload-hint">
              <span>📁 Click to select multiple images</span>
              <span className="hint-text">Select 8-12 images for 360° rotation (Hold Ctrl/Cmd to select multiple)</span>
            </div>
          </div>
          
          {uploading && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="progress-text">{Math.round(uploadProgress)}%</span>
            </div>
          )}

          {shoeData.images.length > 0 && (
            <div className="uploaded-images">
              <p className="upload-success">✅ {shoeData.images.length} images uploaded</p>
              <div className="image-previews">
                {shoeData.images.map((url, i) => (
                  <img 
                    key={i} 
                    src={url} 
                    alt={`Angle ${i+1}`} 
                    className="preview-thumb"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={uploading || checkDuplicateShoe(shoeData.name) || shoeData.images.length === 0}
        >
          {uploading ? '⏳ Uploading...' : '➕ Add Shoe to Catalogue'}
        </button>

        {/* Show warning if duplicate exists */}
        {shoeData.name && checkDuplicateShoe(shoeData.name) && (
          <p style={{ color: '#e74c3c', textAlign: 'center', marginTop: '10px', fontWeight: '600' }}>
            ⚠️ Cannot add - a shoe with this name already exists!
          </p>
        )}
      </form>

      {/* View All Shoes */}
      <div className="view-shoes">
        <h3>📚 All Shoes in Catalogue</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="view-btn"
            onClick={() => {
              const shoes = JSON.parse(localStorage.getItem('ndulabox_shoes') || '[]');
              console.log('📚 All Shoes:', shoes);
              alert(`Total shoes: ${shoes.length}\nCheck console for details!`);
            }}
          >
            View All Shoes ({JSON.parse(localStorage.getItem('ndulabox_shoes') || '[]').length})
          </button>
          
          {/* Delete All Button */}
          <button 
            className="delete-all-btn"
            onClick={() => {
              if (confirm('⚠️ Are you sure you want to delete ALL shoes? This cannot be undone!')) {
                localStorage.removeItem('ndulabox_shoes');
                setMessage('✅ All shoes have been deleted!');
                setTimeout(() => window.location.reload(), 1000);
              }
            }}
          >
            🗑️ Delete All
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;