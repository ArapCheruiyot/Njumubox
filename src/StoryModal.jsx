import './StoryModal.css';

function StoryModal({ storyId, onClose }) {
  if (!storyId) {
    return null;
  }

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <span className="close-modal" onClick={onClose}>&times;</span>
        <div id="modal-story-content">
          
          {/* Superkeeper Story */}
          {storyId === 'superkeeper' && (
            <div>
              <h2>📦 Superkeeper — Inventory & POS System</h2>
              <p><strong>Live Demo:</strong> <a href="https://superkeeperapp-6isv.onrender.com/" target="_blank" rel="noopener noreferrer">superkeeperapp-6isv.onrender.com</a></p>
              
              <h3>What it does:</h3>
              <p>Full-stack inventory management system for small retail shops in Kenya. Helps shop owners track stock, manage staff, and see sales in real-time. Ready for first customers.</p>
              
              <h3>Key Features:</h3>
              <ul>
                <li>FIFO cost tracking for batches</li>
                <li>Bilingual interface (English/Swahili)</li>
                <li>Real-time sales tracking</li>
                <li>Multi-shop support</li>
                <li>Role-based access control for staff</li>
              </ul>
              
              <h3>Tech Stack:</h3>
              <ul>
                <li>Backend: Python / Flask</li>
                <li>Frontend: JavaScript, HTML/CSS</li>
                <li>Database: Firebase / Firestore</li>
                <li>Deployment: Render</li>
              </ul>
            </div>
          )}

          {/* Facebook Data Collector Story */}
          {storyId === 'facebook' && (
            <div>
              <h2>📊 Facebook Data Collector</h2>
              <p><strong>Live Demo:</strong> <a href="https://facebook-data-collector.onrender.com/" target="_blank" rel="noopener noreferrer">facebook-data-collector.onrender.com</a></p>
              
              <h3>What it does:</h3>
              <p>A web application that extracts structured data from Facebook posts — including dates, locations, mentioned people, action types, and comments. Saves data directly to the user's computer with no server storage.</p>
              
              <h3>✨ Features:</h3>
              <ul>
                <li><strong>Paste any Facebook post</strong> — Extracts date, location, people mentioned, and key quotes</li>
                <li><strong>Comment extraction</strong> — Captures comments with sentiment analysis (positive/neutral/negative)</li>
                <li><strong>Action detection</strong> — Automatically categorizes posts (roads, water, funeral, church, fundraising, etc.)</li>
                <li><strong>Custom keywords</strong> — Users can add/remove keywords to customize action detection</li>
                <li><strong>Local storage</strong> — Data saves to CSV files on your own computer (privacy first)</li>
                <li><strong>Export to CSV</strong> — Download your data as CSV files</li>
                <li><strong>Statistics dashboard</strong> — Shows post counts and action breakdowns</li>
              </ul>
              
              <h3>🚀 How to Use:</h3>
              <ul>
                <li>Select a folder — Choose where to save your data</li>
                <li>Paste a Facebook post — Copy any Facebook post and paste it into the text area</li>
                <li>Click Save — The app extracts data and saves it to CSV files</li>
                <li>Manage keywords — Add or remove keywords to control what actions are detected</li>
                <li>Export data — Download your posts and comments as CSV files</li>
              </ul>
              
              <h3>📁 File Structure:</h3>
              <p>When you save posts, two CSV files are created in your selected folder:</p>
              <ul>
                <li><code>raymond_posts.csv</code> — All extracted post data</li>
                <li><code>raymond_comments.csv</code> — All extracted comments</li>
              </ul>
              
              <h3>🔒 Privacy Focus:</h3>
              <ul>
                <li>No server storage — Your data never leaves your computer</li>
                <li>Each user's data is private — Different users save to different folders</li>
                <li>You control everything — You choose where to save your data</li>
              </ul>
              
              <h3>🛠️ Tech Stack:</h3>
              <ul>
                <li>Backend: Python / Flask</li>
                <li>Frontend: HTML, CSS, JavaScript</li>
                <li>Extraction: Regex patterns, NLP</li>
                <li>Storage: Local CSV files (user's computer)</li>
                <li>Deployment: Render</li>
              </ul>
              
              <p><strong>👨‍💻 Author:</strong> Moses Kipkorir Cheruiyot</p>
              <p><strong>📄 License:</strong> MIT</p>
            </div>
          )}

          {/* M-Pesa API Playground Story */}
          {storyId === 'mpesa' && (
            <div>
              <h2>💰 M-Pesa API Playground</h2>
              <p><strong>Live Demo:</strong> <a href="https://mpesa-daraja-apis.onrender.com/" target="_blank" rel="noopener noreferrer">mpesa-daraja-apis.onrender.com</a></p>
              <p><strong>GitHub:</strong> <a href="https://github.com/ArapCheruiyot/Darajaplay" target="_blank" rel="noopener noreferrer">github.com/ArapCheruiyot/Darajaplay</a></p>
              
              <h3>What it does:</h3>
              <p>Interactive web-based demonstration platform for Safaricom's M-Pesa Daraja API. Implements STK Push (C2B) and B2C payment flows in a sandbox environment.</p>
              
              <h3>Key Features:</h3>
              <ul>
                <li>STK Push (C2B) payment flow</li>
                <li>B2C payment flow</li>
                <li>Real-time API status monitoring</li>
                <li>Production-grade error tracking with Sentry</li>
                <li>Tab-based interface for testing different payment flows</li>
              </ul>
              
              <h3>Tech Stack:</h3>
              <ul>
                <li>Backend: Python / Flask</li>
                <li>Frontend: JavaScript</li>
                <li>Integration: Daraja API, Sentry</li>
                <li>Deployment: Render</li>
              </ul>
            </div>
          )}

          {/* Urban MoveHomes Story */}
          {storyId === 'urban-movehomes' && (
            <div>
              <h2>🚚 Urban MoveHomes — Moving Company Website</h2>
              <p><strong>Live Demo:</strong> <a href="https://urbanmoveshomes.onrender.com/" target="_blank" rel="noopener noreferrer">urbanmoveshomes.onrender.com</a></p>
              
              <h3>What it does:</h3>
              <p>Fully responsive, modern website for a professional moving company in Kenya. Features a clean user interface with an admin dashboard, quote request form, and WhatsApp integration.</p>
              
              <h3>Key Features:</h3>
              <ul>
                <li>📱 Fully responsive — works on desktop, tablet, and mobile</li>
                <li>🧭 React Router navigation — smooth page transitions</li>
                <li>🏠 Homepage — hero section with call-to-action buttons</li>
                <li>📄 About page — company story, mission, and values</li>
                <li>📦 Services page — detailed service descriptions with images</li>
                <li>📞 Quote page — custom quote request form with location pinning</li>
                <li>📊 Admin Dashboard — view, filter, update status, and delete quote requests</li>
                <li>💬 WhatsApp integration — instant contact for customers</li>
                <li>🔥 Firebase Firestore — stores all quote requests in real-time</li>
              </ul>
              
              <h3>Tech Stack:</h3>
              <ul>
                <li>Frontend: React 19 + Vite</li>
                <li>Routing: React Router DOM v7</li>
                <li>Styling: CSS (modular, component-specific)</li>
                <li>Backend / Database: Firebase Firestore (NoSQL)</li>
                <li>Hosting: Render (Static Site)</li>
                <li>Version Control: Git + GitHub</li>
              </ul>
            </div>
          )}

          {/* SayIt Story */}
          {storyId === 'sayit' && (
            <div>
              <h2>📖 SayIt — Reading Helper for Kids</h2>
              <p><strong>Live Demo:</strong> <a href="https://sayit-yq89.onrender.com/" target="_blank" rel="noopener noreferrer">sayit-yq89.onrender.com</a></p>
              
              <h3>What it does:</h3>
              <p>Simple, kid-friendly web app that helps children read independently. When a child gets stuck on a word, they point their phone at it, tap the word, and hear it pronounced. No typing, no menus – just point and listen.</p>
              
              <h3>✨ Features:</h3>
              <ul>
                <li>📷 Auto-start camera — camera turns on automatically</li>
                <li>📦 Resizable focus box — adjust the detection area</li>
                <li>🔍 Multi-word detection — detects all words in the box</li>
                <li>🔊 Tap any word to hear it — uses text-to-speech</li>
                <li>⏱️ Auto-detect — runs every 2 seconds</li>
                <li>💯 Confidence scores — shows how sure the app is</li>
                <li>📱 Mobile-first design — works on phones</li>
              </ul>
              
              <h3>How It Works:</h3>
              <ul>
                <li>Open app → Camera turns on automatically</li>
                <li>Place paper under the focus box</li>
                <li>App detects ALL words in the box</li>
                <li>Words appear as clickable chips</li>
                <li>Tap any word → Hear it pronounced</li>
                <li>Kid repeats it and continues reading</li>
              </ul>
              
              <h3>Tech Stack:</h3>
              <ul>
                <li>Frontend: React</li>
                <li>OCR: Tesseract.js</li>
                <li>Text-to-Speech: Web Speech API</li>
                <li>Styling: CSS (mobile-first)</li>
                <li>Hosting: Render</li>
              </ul>
            </div>
          )}

          {/* 🆕 NdulaBox Story */}
          {storyId === 'ndulabox' && (
            <div>
              <h2>👟 NdulaBox — Kenyan Shoe Marketplace</h2>
              <p><strong>Live Demo:</strong> <a href="https://njumubox.onrender.com/" target="_blank" rel="noopener noreferrer">njumubox.onrender.com</a></p>
              <p><strong>GitHub:</strong> <a href="https://github.com/ArapCheruiyot/ndulabox" target="_blank" rel="noopener noreferrer">github.com/ArapCheruiyot/ndulabox</a></p>
              
              <h3>What it does:</h3>
              <p>An e-commerce marketplace connecting Kenyan shoe vendors directly with customers. Each vendor gets their own unique store link to share with customers. Built for the Kenyan market with a focus on simplicity and accessibility.</p>
              
              <h3>✨ Key Features:</h3>
              <ul>
                <li><strong>Vendor Store Links</strong> — Each vendor gets a unique shareable link (e.g., njumubox.com/store/vendor-id)</li>
                <li><strong>Camera Upload</strong> — Vendors can take photos directly from their phone camera or upload from gallery</li>
                <li><strong>Multi-Image Upload</strong> — Upload multiple shoe images for 360° viewing</li>
                <li><strong>Real-time Search</strong> — Instant search by name, brand, category, or price</li>
                <li><strong>Store Management</strong> — Vendors manage products, phone, and location</li>
                <li><strong>WhatsApp & Facebook Sharing</strong> — One-click sharing of store links</li>
                <li><strong>Mobile-First Design</strong> — Optimized for phone users in Kenya</li>
                <li><strong>Cloudinary Integration</strong> — Automated image upload and storage</li>
                <li><strong>Try-On Feature</strong> — Coming soon (AI-powered virtual try-on)</li>
              </ul>
              
              <h3>🛠️ Tech Stack:</h3>
              <ul>
                <li><strong>Frontend:</strong> React + Vite</li>
                <li><strong>Backend/Database:</strong> Firebase / Firestore</li>
                <li><strong>Image Upload:</strong> Cloudinary API</li>
                <li><strong>Authentication:</strong> Firebase Auth (Google)</li>
                <li><strong>Camera:</strong> MediaDevices API</li>
                <li><strong>Styling:</strong> CSS (custom, responsive)</li>
                <li><strong>Hosting:</strong> Render</li>
              </ul>
              
              <h3>🏆 Challenges Solved:</h3>
              <ul>
                <li><strong>Camera Integration</strong> — Enabled direct camera capture for vendors without gallery navigation</li>
                <li><strong>Image Management</strong> — Built multi-image upload with Cloudinary for efficient storage</li>
                <li><strong>Vendor Discovery</strong> — Created unique store links so vendors can self-promote</li>
                <li><strong>Search Performance</strong> — Implemented client-side filtering for instant results</li>
                <li><strong>Mobile Experience</strong> — Designed for Kenya's mobile-first internet usage</li>
              </ul>
              
              <h3>📊 Impact:</h3>
              <ul>
                <li>Empowers local Kenyan shoe vendors to sell online</li>
                <li>No technical skills required — vendors just share their link</li>
                <li>Direct connection between vendors and customers (no middlemen)</li>
                <li>Built for the Kenyan market with local context</li>
              </ul>
              
              <p><strong>👨‍💻 Author:</strong> Moses Kipkorir Cheruiyot</p>
              <p><strong>📄 License:</strong> MIT</p>
              <p><strong>🔄 Status:</strong> Version 1.0 — Live and accepting vendors</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default StoryModal;