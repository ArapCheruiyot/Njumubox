import React, { useEffect, useRef, useState } from 'react';

const CloudImage360Viewer = ({ 
  images = [],
  folder = '',
  count = 36,
  autoplay = true,
  autoplaySpeed = 2,
  width = '100%',
  height = '100%',
  filenamePrefix = 'angle-',
  filenameExtension = 'jpg',
  onImageChange = null,
  onReady = null,
  className = ''
}) => {
  const containerRef = useRef(null);
  const viewerInstanceRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Cloudimage 360 script
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="cloudimage.io/360-view"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://cdn.cloudimage.io/360-view/4.10.0/360-view.min.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ Cloudimage 360 loaded');
        initializeViewer();
      };
      script.onerror = () => {
        console.error('❌ Failed to load Cloudimage 360');
      };
      document.body.appendChild(script);
    } else {
      // Script already loaded, initialize
      setTimeout(initializeViewer, 100);
    }

    return () => {
      // Cleanup
      if (viewerInstanceRef.current) {
        try {
          viewerInstanceRef.current.destroy();
        } catch (e) {
          console.warn('Could not destroy viewer:', e);
        }
      }
    };
  }, []);

  // Re-initialize when images change
  useEffect(() => {
    if (isLoaded && images.length > 0) {
      initializeViewer();
    }
  }, [images, count, autoplay, autoplaySpeed]);

  const initializeViewer = () => {
    if (!containerRef.current) return;
    if (typeof window.CI360 === 'undefined') {
      console.warn('⏳ CI360 not available yet, retrying...');
      setTimeout(initializeViewer, 500);
      return;
    }

    // Clear previous instance
    if (viewerInstanceRef.current) {
      try {
        viewerInstanceRef.current.destroy();
      } catch (e) {}
    }

    // Determine folder and images
    let folderUrl = folder;
    let imageCount = count;
    
    // If we have explicit images array, use those URLs
    if (images && images.length > 0) {
      // Try to extract folder from first image URL
      const firstImage = images[0];
      const lastImage = images[images.length - 1];
      
      // Extract folder path
      const urlParts = firstImage.split('/');
      urlParts.pop(); // Remove filename
      folderUrl = urlParts.join('/') + '/';
      
      imageCount = images.length;
      
      // Check if it's a Cloudinary URL and optimize
      if (firstImage.includes('cloudinary.com')) {
        // Use Cloudinary's URL with optimization
        // We'll pass the images directly through Cloudinary
      }
    }

    console.log('🔄 Initializing Cloudimage 360 with:', { folderUrl, imageCount });

    // Create viewer instance
    try {
      // Create wrapper div for Cloudimage
      const wrapper = document.createElement('div');
      wrapper.className = `cloudimage-360 ${className}`;
      wrapper.setAttribute('data-folder', folderUrl);
      wrapper.setAttribute('data-filename-x', `${filenamePrefix}{index}.${filenameExtension}`);
      wrapper.setAttribute('data-amount-x', String(imageCount));
      
      if (autoplay) {
        wrapper.setAttribute('data-autoplay', 'true');
        wrapper.setAttribute('data-autoplay-speed', String(autoplaySpeed));
      }
      
      // If we have explicit images, use data-images
      if (images && images.length > 0) {
        const imageUrls = images.map((url, i) => {
          // If it's a Cloudinary URL, optimize it
          if (url.includes('cloudinary.com')) {
            const parts = url.split('/upload/');
            if (parts.length === 2) {
              return `${parts[0]}/upload/q_auto:eco,f_auto,fl_lossy,w_800/${parts[1]}`;
            }
          }
          return url;
        });
        wrapper.setAttribute('data-images', JSON.stringify(imageUrls));
      }

      // Clear container and append wrapper
      containerRef.current.innerHTML = '';
      containerRef.current.style.width = width;
      containerRef.current.style.height = height;
      containerRef.current.style.position = 'relative';
      containerRef.current.appendChild(wrapper);

      // Initialize viewer
      const viewer = new window.CI360();
      viewer.initAll();

      // Store instance for cleanup
      viewerInstanceRef.current = viewer;
      setIsLoaded(true);

      // Callbacks
      if (onReady) {
        setTimeout(() => onReady(viewer), 100);
      }

      console.log('✅ Cloudimage 360 initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Cloudimage 360:', error);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`cloudimage-360-container ${className}`}
      style={{
        width: width,
        height: height,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Loading state */}
      {!isLoaded && images.length > 0 && (
        <div className="cloudimage-loading">
          <div className="cloudimage-spinner">🔄</div>
        </div>
      )}
    </div>
  );
};

export default CloudImage360Viewer;