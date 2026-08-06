import { useState } from 'react';
import emailjs from '@emailjs/browser';

function Message() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Your phone number (Kenyan format - without leading 0)
  const phoneNumber = '254114932232';
  const whatsappLink = `https://wa.me/${phoneNumber}`;
  const phoneLink = `tel:+${phoneNumber}`;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const serviceId = 'service_3kmj13n';
    const templateId = 'template_ncdvnum';
    const publicKey = 'X7BSr4qW7Kz-HslFz';

    const templateParams = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
    };

    try {
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );
      
      console.log('Email sent successfully:', response);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
      
    } catch (err) {
      console.error('Failed to send email:', err);
      setError('Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="contact" style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.title}>Get in Touch</h2>
        <p style={styles.subtitle}>We'd love to hear from you</p>

        {/* Contact Methods Grid - WhatsApp & Phone */}
        <div style={styles.contactMethods}>
          {/* WhatsApp Card */}
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={styles.contactCard}>
            <div style={styles.contactIcon}>💬</div>
            <h3 style={styles.contactTitle}>WhatsApp Us</h3>
            <p style={styles.contactDetail}>+254 114 932232</p>
            <p style={styles.contactNote}>Click to chat on WhatsApp</p>
          </a>

          {/* Phone Call Card */}
          <a href={phoneLink} style={styles.contactCard}>
            <div style={styles.contactIcon}>📞</div>
            <h3 style={styles.contactTitle}>Call Us</h3>
            <p style={styles.contactDetail}>+254 114 932232</p>
            <p style={styles.contactNote}>Click to call (mobile only)</p>
          </a>
        </div>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerText}>OR</span>
        </div>

        {/* Email Form Title */}
        <h3 style={styles.formTitle}>Send us an email</h3>
        
        {submitted ? (
          <div style={styles.success}>
            ✅ Thank you! We'll contact you soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            {error && (
              <div style={styles.error}>
                ❌ {error}
              </div>
            )}
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={styles.input}
                disabled={isLoading}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
                disabled={isLoading}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                style={styles.textarea}
                disabled={isLoading}
              />
            </div>
            
            <button 
              type="submit" 
              style={isLoading ? styles.buttonDisabled : styles.button}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Email'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: '80px 20px',
    backgroundColor: '#f8f9fa'
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%'
  },
  title: {
    fontSize: '36px',
    textAlign: 'center',
    marginBottom: '12px',
    color: '#1a1a1a',
    fontWeight: '600'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '50px',
    fontSize: '18px'
  },
  contactMethods: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginBottom: '50px',
    flexWrap: 'wrap'
  },
  contactCard: {
    flex: '1',
    minWidth: '240px',
    maxWidth: '280px',
    padding: '30px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    textAlign: 'center',
    textDecoration: 'none',
    color: '#333',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: '1px solid #e0e0e0'
  },
  contactIcon: {
    fontSize: '52px',
    marginBottom: '15px'
  },
  contactTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#1a1a1a'
  },
  contactDetail: {
    fontSize: '16px',
    color: '#25D366',
    marginBottom: '8px',
    fontWeight: '500'
  },
  contactNote: {
    fontSize: '13px',
    color: '#888'
  },
  divider: {
    textAlign: 'center',
    marginBottom: '40px',
    position: 'relative',
    borderTop: '1px solid #e0e0e0',
    marginTop: '10px'
  },
  dividerText: {
    display: 'inline-block',
    backgroundColor: '#f8f9fa',
    padding: '0 20px',
    position: 'relative',
    top: '-12px',
    color: '#999',
    fontSize: '14px'
  },
  formTitle: {
    fontSize: '24px',
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '600',
    color: '#333',
    fontSize: '14px'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease',
    fontFamily: 'inherit',
    outline: 'none'
  },
  textarea: {
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'border-color 0.3s ease',
    outline: 'none'
  },
  button: {
    padding: '14px 28px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    marginTop: '10px'
  },
  buttonDisabled: {
    padding: '14px 28px',
    backgroundColor: '#cccccc',
    color: '#666666',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'not-allowed',
    marginTop: '10px'
  },
  success: {
    padding: '20px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '500'
  },
  error: {
    padding: '12px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '14px'
  }
};

// Add hover effects with media query (will be handled by CSS)
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .contact-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  }
  
  input:focus, textarea:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
  }
  
  button:hover:not(:disabled) {
    background-color: #0056b3;
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    .contact-methods {
      gap: 15px;
    }
    
    .form {
      padding: 25px;
    }
    
    .title {
      font-size: 28px;
    }
  }
  
  @media (max-width: 576px) {
    .contact-card {
      min-width: 100%;
    }
    
    .section {
      padding: 50px 15px;
    }
    
    .form {
      padding: 20px;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Message;