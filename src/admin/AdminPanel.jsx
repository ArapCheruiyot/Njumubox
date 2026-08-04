import { useState, useEffect, useRef } from 'react';
import { 
  shoesCollection, 
  usersCollection,
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc,
  setDoc
} from '../firebase';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // 🆕 New: Track form submission
  
  // Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [storePhone, setStorePhone] = useState(userProfile?.phone || '');
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [locationCity, setLocationCity] = useState(userProfile?.location?.city || '');
  const [locationArea, setLocationArea] = useState(userProfile?.location?.area || '');
  const [locationStreet, setLocationStreet] = useState(userProfile?.location?.street || '');
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    if (user) {
      loadUserShoes();
    }
  }, [user]);

  // Cleanup camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const loadUserShoes = async () => {
    try {
      const q = query(shoesCollection, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const loadedShoes = [];
      querySnapshot.forEach((doc) => {
        loadedShoes.push({ id: doc.id, ...doc.data() });
      });
      setUserShoes(loadedShoes);
    } catch (error) {
      console.error('Error loading user shoes:', error);
    }
  };

  const filteredShoes = userShoes.filter(shoe => {
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase().trim();
    
    if (shoe.name?.toLowerCase().includes(term)) return true;
    if (shoe.brand?.toLowerCase().includes(term)) return true;
    if (shoe.category?.toLowerCase().includes(term)) return true;
    if (shoe.price?.toString().includes(term)) return true;
    if (shoe.storeName?.toLowerCase().includes(term)) return true;
    
    return false;
  });

  // Check if all fields are filled and images are uploaded
  const isFormComplete = () => {
    return shoeData.name.trim() !== '' && 
           shoeData.brand.trim() !== '' && 
           shoeData.price.trim() !== '' && 
           shoeData.images.length > 0;
  };

  // Open camera
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
        setIsCameraOpen(true);
        setMessage('📸 Camera opened - Click "Capture" to take photo');
      }
    } catch (error) {
      console.error('Camera error:', error);
      setMessage('❌ Cannot access camera. Please allow camera permissions or use file upload.');
    }
  };

  // Close camera
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setMessage('❌ Failed to capture image');
        return;
      }

      const file = new File([blob], `shoe-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      await uploadSingleImage(file);
      setMessage(`📸 Captured! Take more photos or close camera.`);
      
    }, 'image/jpeg', 0.92);
  };

  // Upload single image to Cloudinary
  const uploadSingleImage = async (file) => {
    setUploading(true);
    
    const shoeFolder = shoeData.name 
      ? `ndulabox/shoes/${shoeData.name.toLowerCase().replace(/ /g, '-')}`
      : 'ndulabox/shoes/temp';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', shoeFolder);
    formData.append('public_id', `capture-${Date.now()}`);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      
      if (data.secure_url) {
        setShoeData(prev => ({ 
          ...prev, 
          images: [...prev.images, data.secure_url] 
        }));
        setMessage(`📸 Image uploaded! (${shoeData.images.length + 1} total)`);
      } else {
        setMessage('❌ Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('❌ Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Remove image from the list
  const removeImage = (index) => {
    setShoeData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleUpdatePhone = async () => {
    if (!storePhone.trim()) {
      setMessage('❌ Please enter a phone number');
      return;
    }

    const cleanPhone = storePhone.replace(/[\s+]/g, '');
    if (!/^254\d{9}$/.test(cleanPhone)) {
      setMessage('❌ Invalid format. Use: 254712345678');
      return;
    }

    try {
      await updateDoc(doc(usersCollection, user.uid), {
        phone: cleanPhone
      });
      setMessage('✅ Phone number updated successfully!');
      setIsEditingPhone(false);
      userProfile.phone = cleanPhone;
    } catch (error) {
      console.error('Error updating phone:', error);
      setMessage('❌ Failed to update phone number');
    }
  };

  const handleUpdateLocation = async () => {
    if (!locationCity.trim()) {
      setMessage('❌ Please enter a city/town');
      return;
    }

    try {
      const fullAddress = `${locationCity.trim()}${locationArea ? `, ${locationArea.trim()}` : ''}${locationStreet ? `, ${locationStreet.trim()}` : ''}`;
      
      await updateDoc(doc(usersCollection, user.uid), {
        location: {
          city: locationCity.trim(),
          area: locationArea.trim() || '',
          street: locationStreet.trim() || '',
          fullAddress: fullAddress
        }
      });
      setMessage('✅ Location updated successfully!');
      setIsEditingLocation(false);
      userProfile.location = {
        city: locationCity.trim(),
        area: locationArea.trim() || '',
        street: locationStreet.trim() || '',
        fullAddress: fullAddress
      };
    } catch (error) {
      console.error('Error updating location:', error);
      setMessage('❌ Failed to update location');
    }
  };

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

    setShoeData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    setUploading(false);
    setMessage(`✅ ${uploadedUrls.length} images uploaded! Now click "Add to Catalogue" to save.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all fields are filled
    if (!shoeData.name.trim()) {
      setMessage('❌ Please enter a shoe name');
      return;
    }
    if (!shoeData.brand.trim()) {
      setMessage('❌ Please enter a brand');
      return;
    }
    if (!shoeData.price.trim()) {
      setMessage('❌ Please enter a price');
      return;
    }
    if (shoeData.images.length === 0) {
      setMessage('❌ Please upload at least one image');
      return;
    }

    setIsSubmitting(true);
    setMessage('💾 Saving shoe to your catalogue...');

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
      setMessage(`✅ "${shoeData.name}" added to ${userProfile?.storeName}! 🎉`);
      
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
      loadUserShoes();
    } catch (error) {
      console.error('❌ Save error:', error);
      setMessage('❌ Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Get the store link
  const storeLink = `${window.location.origin}/store/${user?.uid}`;

  // Determine submit button state
  const isButtonDisabled = uploading || isSubmitting || !isFormComplete();

  return (
    <div className="admin-panel">
      <h1>👟 {userProfile?.storeName || 'NdulaBox'}</h1>
      <p className="admin-subtitle">
        Welcome, {userProfile?.displayName || user?.email}
      </p>
      
      {/* Phone Section */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        padding: '15px 20px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <strong style={{ color: 'white' }}>📞 Store Phone:</strong>
            {userProfile?.phone ? (
              <span style={{ color: '#2ecc71', marginLeft: '10px' }}>
                {userProfile.phone}
              </span>
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '10px' }}>
                Not set
              </span>
            )}
          </div>
          <button
            onClick={() => setIsEditingPhone(!isEditingPhone)}
            style={{
              padding: '6px 16px',
              background: isEditingPhone ? '#e74c3c' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            {isEditingPhone ? 'Cancel' : '✏️ Edit'}
          </button>
        </div>

        {isEditingPhone && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="tel"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
              placeholder="e.g., 254712345678"
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: '#1a1a2e',
                color: '#ffffff',
                fontSize: '1rem',
                minWidth: '200px',
                outline: 'none'
              }}
              autoFocus
            />
            <button
              onClick={handleUpdatePhone}
              style={{
                padding: '10px 24px',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              💾 Save
            </button>
          </div>
        )}
        <small style={{ color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '5px' }}>
          Used for WhatsApp and Call buttons on your store page
        </small>
      </div>

      {/* Location Section */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        padding: '15px 20px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <strong style={{ color: 'white' }}>📍 Store Location:</strong>
            {userProfile?.location?.fullAddress ? (
              <span style={{ color: '#3498db', marginLeft: '10px' }}>
                {userProfile.location.fullAddress}
              </span>
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '10px' }}>
                Not set
              </span>
            )}
          </div>
          <button
            onClick={() => setIsEditingLocation(!isEditingLocation)}
            style={{
              padding: '6px 16px',
              background: isEditingLocation ? '#e74c3c' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            {isEditingLocation ? 'Cancel' : '✏️ Edit'}
          </button>
        </div>

        {isEditingLocation && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              placeholder="City/Town * (e.g., Nairobi)"
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: '#1a1a2e',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <input
              type="text"
              value={locationArea}
              onChange={(e) => setLocationArea(e.target.value)}
              placeholder="Estate/Area (e.g., Langata)"
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: '#1a1a2e',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <input
              type="text"
              value={locationStreet}
              onChange={(e) => setLocationStreet(e.target.value)}
              placeholder="Street/Shop (e.g., Moi Avenue)"
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: '#1a1a2e',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <button
              onClick={handleUpdateLocation}
              style={{
                padding: '10px 24px',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                alignSelf: 'flex-start'
              }}
            >
              💾 Save Location
            </button>
          </div>
        )}
        <small style={{ color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '5px' }}>
          Location builds trust - customers know where you're based
        </small>
      </div>

      {/* 🔗 STORE LINK SECTION */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        padding: '15px 20px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid rgba(46, 204, 113, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <strong style={{ color: 'white' }}>🔗 Your Store Link:</strong>
            <div style={{ 
              marginTop: '5px',
              background: 'rgba(0,0,0,0.3)',
              padding: '8px 12px',
              borderRadius: '6px',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: '#2ecc71'
            }}>
              {storeLink}
            </div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(storeLink);
              setMessage('✅ Store link copied to clipboard!');
              setTimeout(() => setMessage(''), 3000);
            }}
            style={{
              padding: '8px 20px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            📋 Copy Link
          </button>
        </div>

        <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              const text = `👟 Check out my shoe store: ${storeLink}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            style={{
              padding: '8px 18px',
              background: '#25D366',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
          >
            📱 WhatsApp
          </button>
          
          <button
            onClick={() => {
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeLink)}`, '_blank');
            }}
            style={{
              padding: '8px 18px',
              background: '#1877F2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
          >
            📢 Facebook
          </button>

          <button
            onClick={() => {
              const text = `👟 Check out my shoe store: ${storeLink}`;
              navigator.clipboard.writeText(text);
              setMessage('✅ Full message copied! Paste it anywhere.');
              setTimeout(() => setMessage(''), 3000);
            }}
            style={{
              padding: '8px 18px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
          >
            📋 Copy Message
          </button>
        </div>

        <small style={{ color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '10px' }}>
          Share this link with customers. They'll see only your products!
        </small>
      </div>

      <p style={{ color: '#888', fontSize: '0.9rem' }}>
        📦 {userShoes.length} shoes in your catalogue
      </p>

      {message && (
        <div className={`admin-message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
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

        <div className="form-group">
          <label>Upload Shoe Images *</label>
          
          {/* Camera + Upload Buttons */}
          <div className="upload-options">
            <button
              type="button"
              onClick={openCamera}
              className="camera-btn"
              disabled={isCameraOpen || uploading}
            >
              📸 Take Photos
            </button>
            <span className="upload-divider">or</span>
            <div className="upload-area-wrapper">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading || isCameraOpen}
                className="file-input-hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="upload-label">
                📁 Choose from Gallery
              </label>
            </div>
          </div>

          {/* Camera View */}
          {isCameraOpen && (
            <div className="camera-container">
              <div className="camera-view">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="camera-video"
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
              <div className="camera-controls">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="capture-btn"
                  disabled={uploading}
                >
                  📷 Capture
                </button>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="close-camera-btn"
                >
                  ❌ Close Camera
                </button>
              </div>
              <small className="camera-hint">
                Take multiple photos of your shoe from different angles
              </small>
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
              <span className="progress-text">{Math.round(uploadProgress)}%</span>
            </div>
          )}

          {/* Image previews with remove option */}
          {shoeData.images.length > 0 && (
            <div className="uploaded-images">
              <p className="upload-success">
                ✅ {shoeData.images.length} images uploaded
                {shoeData.images.length >= 1 && (
                  <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '8px' }}>
                    ✓ Ready to add to catalogue
                  </span>
                )}
              </p>
              <div className="image-previews">
                {shoeData.images.map((url, i) => (
                  <div key={i} className="preview-item">
                    <img src={url} alt={`Shoe ${i+1}`} className="preview-thumb" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="remove-image-btn"
                      title="Remove this image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 🆕 Step indicator - Shows what's completed */}
        <div className="form-progress-indicator">
          <span className={`step ${shoeData.name.trim() ? 'completed' : 'pending'}`}>
            {shoeData.name.trim() ? '✅' : '⬜'} Name
          </span>
          <span className={`step ${shoeData.brand.trim() ? 'completed' : 'pending'}`}>
            {shoeData.brand.trim() ? '✅' : '⬜'} Brand
          </span>
          <span className={`step ${shoeData.price.trim() ? 'completed' : 'pending'}`}>
            {shoeData.price.trim() ? '✅' : '⬜'} Price
          </span>
          <span className={`step ${shoeData.images.length > 0 ? 'completed' : 'pending'}`}>
            {shoeData.images.length > 0 ? '✅' : '⬜'} Images ({shoeData.images.length})
          </span>
        </div>

        {/* 🆕 Submit Button with clearer state */}
        <button 
          type="submit" 
          className={`submit-btn ${isFormComplete() ? 'ready' : 'incomplete'}`}
          disabled={isButtonDisabled}
        >
          {isSubmitting ? (
            '⏳ Saving to Catalogue...'
          ) : uploading ? (
            '⏳ Uploading Images...'
          ) : !isFormComplete() ? (
            '⬜ Fill All Fields & Upload Images First'
          ) : (
            '✅ Add Shoe to Catalogue'
          )}
        </button>
        {!isFormComplete() && (
          <small className="form-hint">
            {!shoeData.name.trim() && '• Enter a shoe name '}
            {!shoeData.brand.trim() && '• Enter a brand '}
            {!shoeData.price.trim() && '• Enter a price '}
            {shoeData.images.length === 0 && '• Upload at least one image'}
          </small>
        )}
      </form>

      {/* Your Shoes Section */}
      <div className="view-shoes">
        <div className="shoe-grid-header">
          <div>
            <h3>📚 Your Shoes</h3>
            <span className="shoe-count-badge">
              {filteredShoes.length} of {userShoes.length}
            </span>
          </div>
          
          <div className="shoe-search">
            <input
              type="text"
              className="shoe-search-input"
              placeholder="🔍 Search by name, brand, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="shoe-search-clear"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="shoe-grid">
          {filteredShoes.length > 0 ? (
            filteredShoes.map((shoe) => (
              <div key={shoe.id} className="shoe-card">
                {shoe.thumbnail && (
                  <img 
                    src={shoe.thumbnail} 
                    alt={shoe.name} 
                    className="shoe-thumb" 
                    loading="lazy"
                  />
                )}
                <div className="shoe-name" title={shoe.name}>{shoe.name}</div>
                <div className="shoe-brand">{shoe.brand}</div>
                <div className="shoe-price">Ksh {shoe.price}</div>
                <div className="shoe-sizes">
                  {shoe.sizes?.length > 0 ? `Sizes: ${shoe.sizes.join(', ')}` : 'No sizes'}
                </div>
                {shoe.category && (
                  <span className="shoe-category">{shoe.category}</span>
                )}
                <div className="shoe-actions">
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteShoe(shoe.id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-shoes">
              <span className="empty-icon">🔍</span>
              {searchTerm ? (
                <>
                  No shoes match "<strong>{searchTerm}</strong>"
                  <br />
                  <button 
                    onClick={() => setSearchTerm('')}
                    style={{
                      marginTop: '10px',
                      padding: '6px 16px',
                      background: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                'No shoes added yet. Add your first shoe above!'
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;