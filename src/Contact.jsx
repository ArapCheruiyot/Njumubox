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
              <p>Full-stack inventory management system for small retail shops in Kenya. Helps shop owners track stock, manage staff, and see sales in real-time. 500+ businesses served.</p>
              
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
                <li><strong>Comment extraction</strong> — Captures comments with sentiment analysis</li>
                <li><strong>Action detection</strong> — Automatically categorizes posts</li>
                <li><strong>Custom keywords</strong> — Users can add/remove keywords</li>
                <li><strong>Local storage</strong> — Data saves to CSV files (privacy first)</li>
                <li><strong>Statistics dashboard</strong> — Shows post counts and action breakdowns</li>
              </ul>
              
              <h3>Tech Stack:</h3>
              <ul>
                <li>Backend: Python / Flask</li>
                <li>Extraction: Regex patterns, NLP</li>
                <li>Storage: Local CSV files</li>
                <li>Deployment: Render</li>
              </ul>
            </div>
          )}

          {/* M-Pesa API Playground Story */}
          {storyId === 'mpesa' && (
            <div>
              <h2>💰 M-Pesa API Playground</h2>
              <p><strong>Live Demo:</strong> <a href="https://mpesa-daraja-apis.onrender.com/" target="_blank" rel="noopener noreferrer">mpesa-daraja-apis.onrender.com</a></p>
              <p><strong>GitHub:</strong> <a href="https://github.com/ArapCheruiyot/mpesa-playground" target="_blank" rel="noopener noreferrer">github.com/ArapCheruiyot/mpesa-playground</a></p>
              
              <h3>What it does:</h3>
              <p>Interactive demonstration platform for Safaricom's M-PESA Daraja APIs. Allows users to test STK Push (C2B) and B2C payments in a sandbox environment.</p>
              
              <h3>✨ Features:</h3>
              <ul>
                <li><strong>C2B (STK Push)</strong> — Simulate customer-to-business payments via M-PESA prompt</li>
                <li><strong>B2C (Payouts)</strong> — Test business-to-customer payments and disbursements</li>
                <li><strong>Real-time API status</strong> — Shows connection status and response codes</li>
                <li><strong>Tab-based interface</strong> — Clean UI for testing different payment flows</li>
                <li><strong>Sentry error monitoring</strong> — Production-grade error tracking</li>
              </ul>
              
              <h3>🛠️ Technical Stack:</h3>
              <ul>
                <li><strong>Backend:</strong> Python / Flask</li>
                <li><strong>API:</strong> Safaricom Daraja API (OAuth, STK Push, B2C)</li>
                <li><strong>Monitoring:</strong> Sentry for error tracking</li>
                <li><strong>Frontend:</strong> HTML, CSS, JavaScript</li>
                <li><strong>Deployment:</strong> Render</li>
              </ul>
              
              <h3>📋 How to Use:</h3>
              <ul>
                <li>Open the <strong>C2B tab</strong> — Enter phone number and amount</li>
                <li>Click <strong>"Send STK Push"</strong> — You'll receive a prompt on your M-Pesa app</li>
                <li>Open the <strong>B2C tab</strong> — Test business payouts to customers</li>
                <li>Check <strong>API Status</strong> — Monitor response codes and transaction results</li>
              </ul>
              
              <h3>🎯 What I Learned:</h3>
              <ul>
                <li>Integrating third-party payment APIs (OAuth, callbacks)</li>
                <li>Handling asynchronous transaction responses</li>
                <li>Debugging API integration with ngrok for callbacks</li>
                <li>Production error monitoring with Sentry</li>
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default StoryModal;