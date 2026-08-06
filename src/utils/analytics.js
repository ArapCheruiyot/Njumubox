import ReactGA from 'react-ga4';

// ⚠️ REPLACE with your actual Measurement ID from GA4
const GA_MEASUREMENT_ID = 'G-ERCQY00XRX'; // 👈 Replace this!

export const initGA = () => {
  ReactGA.initialize(GA_MEASUREMENT_ID);
  console.log('✅ Google Analytics initialized');
};

export const trackPageView = (path) => {
  ReactGA.send({ 
    hitType: 'pageview', 
    page: path 
  });
};

export const trackEvent = (category, action, label = null, value = null) => {
  ReactGA.event({
    category: category,
    action: action,
    label: label,
    value: value
  });
};

// NdulaBox specific events
export const trackAppEvents = {
  // Home page events
  viewStore: (storeName) => {
    trackEvent('Store', 'view_store', storeName);
  },
  tryOnClick: () => {
    trackEvent('Feature', 'try_on_click', 'Coming Soon');
  },
  categorySelect: (category) => {
    trackEvent('Category', 'select', category);
  },
  
  // Store page events
  viewShoe: (shoeName, storeName) => {
    trackEvent('Shoe', 'view', `${shoeName} - ${storeName}`);
  },
  whatsappClick: (storeName) => {
    trackEvent('Contact', 'whatsapp_click', storeName);
  },
  callClick: (storeName) => {
    trackEvent('Contact', 'call_click', storeName);
  },
  
  // Admin events
  addShoe: (shoeName) => {
    trackEvent('Admin', 'add_shoe', shoeName);
  },
  deleteShoe: (shoeName) => {
    trackEvent('Admin', 'delete_shoe', shoeName);
  },
  updatePhone: () => {
    trackEvent('Admin', 'update_phone');
  },
  updateLocation: () => {
    trackEvent('Admin', 'update_location');
  },
  
  // User events
  userLogin: (method) => {
    trackEvent('User', 'login', method);
  },
  userLogout: () => {
    trackEvent('User', 'logout');
  },
  modeSwitch: (mode) => {
    trackEvent('User', 'mode_switch', mode);
  }
};

export default { initGA, trackPageView, trackEvent, trackAppEvents };