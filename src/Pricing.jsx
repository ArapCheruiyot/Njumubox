import { useState } from 'react';

function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

  const packages = [
    {
      name: 'Basic',
      price: { monthly: 5000, yearly: 45000 },
      features: [
        '3 pages (Home, About, Contact)',
        'Mobile responsive design',
        'Contact form (Email/WhatsApp)',
        'Social media links',
        '2 rounds of revisions',
        '1 week delivery'
      ],
      recommended: false,
      buttonText: 'Get Started'
    },
    {
      name: 'Standard',
      price: { monthly: 15000, yearly: 135000 },
      features: [
        '5-7 pages',
        'Mobile responsive design',
        'Contact form + Google Maps',
        'Image gallery',
        'SEO basics',
        '3 rounds of revisions',
        '1 month free maintenance',
        '2 week delivery'
      ],
      recommended: true,
      buttonText: 'Most Popular'
    },
    {
      name: 'Premium',
      price: { monthly: 35000, yearly: 315000 },
      features: [
        '10+ pages',
        'Everything in Standard +',
        'Blog/News section',
        'Booking/Appointment system',
        'Database integration',
        '6 months free maintenance',
        'Training on how to update',
        '3-4 week delivery'
      ],
      recommended: false,
      buttonText: 'Contact Us'
    }
  ];

  return (
    <section id="pricing" style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.title}>Our Pricing</h2>
        <p style={styles.subtitle}>
          Professional websites starting from KES 5,000
        </p>

        {/* Billing Toggle */}
        <div style={styles.toggleContainer}>
          <button
            onClick={() => setBillingCycle('monthly')}
            style={billingCycle === 'monthly' ? styles.toggleActive : styles.toggleInactive}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            style={billingCycle === 'yearly' ? styles.toggleActive : styles.toggleInactive}
          >
            Yearly (Save 15%)
          </button>
        </div>

        {/* Pricing Cards */}
        <div style={styles.pricingGrid}>
          {packages.map((pkg, index) => (
            <div
              key={index}
              style={{
                ...styles.pricingCard,
                ...(pkg.recommended ? styles.recommendedCard : {})
              }}
            >
              {pkg.recommended && (
                <div style={styles.recommendedBadge}>⭐ Most Popular</div>
              )}
              <h3 style={styles.packageName}>{pkg.name}</h3>
              <div style={styles.price}>
                <span style={styles.currency}>KES</span>
                <span style={styles.amount}>
                  {billingCycle === 'monthly' ? pkg.price.monthly.toLocaleString() : pkg.price.yearly.toLocaleString()}
                </span>
                <span style={styles.period}>
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              <ul style={styles.featuresList}>
                {pkg.features.map((feature, idx) => (
                  <li key={idx} style={styles.featureItem}>✅ {feature}</li>
                ))}
              </ul>
              <button
                onClick={() => {
                  const phoneNumber = '254114932232';
                  const message = `Hi, I'm interested in the ${pkg.name} package (${billingCycle} billing). Can we discuss?`;
                  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappLink, '_blank');
                }}
                style={pkg.recommended ? styles.buttonPrimary : styles.buttonSecondary}
              >
                {pkg.buttonText}
              </button>
            </div>
          ))}
        </div>

        <p style={styles.note}>
          * All prices include free hosting on Render. Custom domain costs extra (KES 800-1,500/year).
        </p>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: '80px 20px',
    backgroundColor: '#ffffff'
  },
  container: {
    maxWidth: '1200px',
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
    marginBottom: '40px',
    fontSize: '18px'
  },
  toggleContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '40px'
  },
  toggleActive: {
    padding: '10px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  toggleInactive: {
    padding: '10px 24px',
    backgroundColor: '#f0f0f0',
    color: '#666',
    border: 'none',
    borderRadius: '30px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  pricingGrid: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    flexWrap: 'wrap',
    marginBottom: '30px'
  },
  pricingCard: {
    flex: '1',
    minWidth: '280px',
    maxWidth: '350px',
    padding: '30px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    position: 'relative'
  },
  recommendedCard: {
    border: '2px solid #007bff',
    boxShadow: '0 8px 24px rgba(0,123,255,0.15)',
    transform: 'scale(1.02)'
  },
  recommendedBadge: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#007bff',
    color: 'white',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  packageName: {
    fontSize: '24px',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '20px',
    color: '#1a1a1a'
  },
  price: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  currency: {
    fontSize: '18px',
    verticalAlign: 'top',
    color: '#666'
  },
  amount: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#007bff'
  },
  period: {
    fontSize: '14px',
    color: '#666'
  },
  featuresList: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '30px'
  },
  featureItem: {
    padding: '8px 0',
    fontSize: '14px',
    color: '#555',
    borderBottom: '1px solid #f0f0f0'
  },
  buttonPrimary: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  buttonSecondary: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#fff',
    color: '#007bff',
    border: '2px solid #007bff',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  note: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#888',
    marginTop: '20px'
  }
};

export default Pricing;