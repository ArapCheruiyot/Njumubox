function Services() {
  const services = [
    {
      icon: '🌐',
      title: 'Business Websites',
      description: '3-10 page websites for salons, restaurants, hardware shops, and professionals.',
      price: 'From KES 5,000'
    },
    {
      icon: '📊',
      title: 'Data Tools',
      description: 'Extract, clean, and analyze data from social media, PDFs, or spreadsheets.',
      price: 'From KES 3,000'
    },
    {
      icon: '💰',
      title: 'M-Pesa Integration',
      description: 'Add automatic M-Pesa payments to your website or app.',
      price: 'From KES 8,000'
    },
    {
      icon: '📦',
      title: 'Inventory Systems',
      description: 'Track stock, sales, and staff for retail shops and supermarkets.',
      price: 'From KES 10,000'
    },
    {
      icon: '🤖',
      title: 'Automation',
      description: 'Automate repetitive tasks like data entry, email responses, and reports.',
      price: 'From KES 5,000'
    },
    {
      icon: '📱',
      title: 'WhatsApp Integration',
      description: 'Connect your website to WhatsApp for automatic customer messages.',
      price: 'From KES 4,000'
    }
  ];

  return (
    <section id="services" style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.title}>What I Can Build For You</h2>
        <p style={styles.subtitle}>
          Affordable, professional, and delivered fast
        </p>
        <div style={styles.grid}>
          {services.map((service, index) => (
            <div key={index} style={styles.card}>
              <div style={styles.icon}>{service.icon}</div>
              <h3 style={styles.cardTitle}>{service.title}</h3>
              <p style={styles.cardDescription}>{service.description}</p>
              <div style={styles.price}>{service.price}</div>
            </div>
          ))}
        </div>
        <div style={styles.note}>
          <p>📞 Need something custom? <a href="#contact" style={styles.link}>Contact us</a> for a free quote</p>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: '60px 20px',
    backgroundColor: '#ffffff'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    fontSize: '32px',
    textAlign: 'center',
    marginBottom: '10px',
    color: '#1a1a1a'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '40px',
    fontSize: '16px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
    marginBottom: '40px'
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: '25px',
    borderRadius: '12px',
    textAlign: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer'
  },
  icon: {
    fontSize: '48px',
    marginBottom: '15px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333'
  },
  cardDescription: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
    marginBottom: '15px'
  },
  price: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#007bff',
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px'
  },
  note: {
    textAlign: 'center',
    backgroundColor: '#e8f4ff',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '14px'
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};

// Add hover effects
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .service-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }
`;
document.head.appendChild(styleSheet);

export default Services;