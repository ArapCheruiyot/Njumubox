function About() {
  return (
    <section id="about" style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.title}>Who We Are</h2>
        <div style={styles.content}>
          <p style={styles.text}>
            I'm <strong>Moses</strong> — a self-taught developer with a background in analytical chemistry. 
            I started building tools because I saw small businesses in Kenya struggling with manual processes.
          </p>
          <p style={styles.text}>
            Today, I've built inventory systems, data extraction tools, and payment integrations that actually work. 
            I partner with <strong>Victor</strong>, who handles business and client relationships.
          </p>
          <p style={styles.text}>
            <strong>Our promise:</strong> We don't just imagine the future. We build it, line by line — 
            and we stand behind our work.
          </p>
          <div style={styles.stats}>
            <div style={styles.stat}>
              <span style={styles.statNumber}>500+</span>
              <span style={styles.statLabel}>Businesses Served</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>5+</span>
              <span style={styles.statLabel}>Projects Built</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>100%</span>
              <span style={styles.statLabel}>Client Focus</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: '60px 20px',
    backgroundColor: '#f8f9fa'
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto'
  },
  title: {
    fontSize: '32px',
    textAlign: 'center',
    marginBottom: '30px',
    color: '#1a1a1a'
  },
  content: {
    textAlign: 'center'
  },
  text: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#555',
    marginBottom: '20px'
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    marginTop: '40px',
    flexWrap: 'wrap'
  },
  stat: {
    textAlign: 'center'
  },
  statNumber: {
    display: 'block',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#007bff'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666'
  }
};

export default About;