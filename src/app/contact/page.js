"use client";
import { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would POST to an API route
    setSubmitted(true);
  };

  return (
    <div>
      <section 
        className={styles.contactHero}
        style={{ 
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#1a1a1a', 
          minHeight: '450px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Image
          src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=1600&auto=format&fit=crop"
          alt="Golf background"
          fill
          priority
          style={{ objectFit: 'cover', zIndex: 0 }}
        />
        {/* Dark Overlay Layer */}
        <div 
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.45))',
            zIndex: 1
          }}
        />
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2, width: '100%' }}>
          <h1 style={{ color: 'white', marginBottom: '1.2rem', fontSize: '4.5rem', textShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>Contact Us</h1>
          <p style={{ color: 'white', fontSize: '1.4rem', maxWidth: '700px', margin: '0 auto', fontWeight: 600, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            Have a question, feedback, or partnership enquiry? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.contactGrid}>
            {/* Left — Info Cards */}
            <div className={styles.infoColumn}>
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>📧</div>
                <h3>Email Us</h3>
                <p>support@impactplay.com</p>
                <span className={styles.infoMeta}>We reply within 24 hours</span>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>📍</div>
                <h3>Our Office</h3>
                <p>123 Fairway Drive, Suite 400</p>
                <span className={styles.infoMeta}>London, United Kingdom</span>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>📱</div>
                <h3>Call Us</h3>
                <p>+44 (0) 207 123 4567</p>
                <span className={styles.infoMeta}>Mon — Fri, 9am – 5pm GMT</span>
              </div>
            </div>

            {/* Right — Contact Form */}
            <div className="card">
              {submitted ? (
                <div className={styles.success}>
                  <div className={styles.successIcon}>✓</div>
                  <h2>Message Sent!</h2>
                  <p>Thank you for reaching out, {formData.name.split(' ')[0]}. Our team will get back to you within 24 hours.</p>
                  <button className="btn btn-dark" onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.contactForm}>
                  <h2 style={{ marginBottom: '0.5rem' }}>Send a Message</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Fill out the form below and we&apos;ll get back to you shortly.
                  </p>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>Full Name</label>
                      <input type="text" name="name" className="input" placeholder="Alex Johnson" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className={styles.field}>
                      <label>Email Address</label>
                      <input type="email" name="email" className="input" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Subject</label>
                    <select name="subject" className="input" value={formData.subject} onChange={handleChange} required style={{ cursor: 'pointer' }}>
                      <option value="">Select a topic...</option>
                      <option value="General Enquiry">General Enquiry</option>
                      <option value="Subscription Support">Subscription Support</option>
                      <option value="Charity Partnership">Charity Partnership</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Press & Media">Press & Media</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Message</label>
                    <textarea name="message" className="input" rows="5" placeholder="Tell us how we can help..." value={formData.message} onChange={handleChange} required style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                  </div>
                  <button type="submit" className="btn btn-dark" style={{ width: '100%', justifyContent: 'center' }}>
                    Send Message →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
