"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import styles from './page.module.css';

const FILTERS = ['All', 'Environment', 'Education', 'Health', 'Sports', 'Wellness'];

export default function CharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharities = async () => {
      const { data } = await supabase.from('charities').select('*');
      if (data) setCharities(data);
      setLoading(false);
    };
    fetchCharities();
  }, []);

  const filtered = charities.filter(c => {
    // In our DB 'focus' isn't a column name but we'll use name/desc for simplicity or assume matching logic
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div>
      <section 
        className={styles.charityHero}
        style={{ 
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#2c3e2d',
          minHeight: '350px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Image 
          src="https://images.pexels.com/photos/209982/pexels-photo-209982.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Charity background"
          fill
          priority
          style={{ objectFit: 'cover', zIndex: 0 }}
        />
        <div 
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.35)',
            zIndex: 1
          }}
        />
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2, width: '100%' }}>
          <h1 style={{ color: 'white', marginBottom: '1rem' }}>Supported Charities</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Every subscription directly supports the causes below. Browse our partners and choose where your impact goes.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.controls}>
            <input
              type="text"
              placeholder="Search charities..."
              className="input"
              style={{ maxWidth: '350px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className={styles.filterGroup}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                  onClick={() => setFilter(f)}
                >{f}</button>
              ))}
            </div>
          </div>

          <div className={styles.charityGrid}>
            {filtered.map(charity => (
              <div
                key={charity.id}
                className={styles.charityCard}
                style={{ backgroundImage: `url(${charity.image_url})` }}
              >
                <div className={styles.charityOverlay}>
                  <div className={styles.charityHeader}>
                    <h3>{charity.name}</h3>
                    <span className="badge">Partner</span>
                  </div>
                  <p className={styles.charityDesc}>{charity.description}</p>
                  <div className={styles.charityFooter}>
                    <div>
                      <span className={styles.raisedLabel}>Total Raised</span>
                      <span className={styles.raisedAmount}>${charity.total_raised?.toLocaleString()}</span>
                    </div>
                    <Link href="/register" className="btn btn-dark">Select Charity</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>No charities match your search.</p>
          )}
        </div>
      </section>
    </div>
  );
}
