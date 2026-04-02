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
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    const fetchCharities = async () => {
      const { data } = await supabase.from('charities').select('*');
      if (data) setCharities(data);
      setLoading(false);
    };
    fetchCharities();
  }, []);

  const filtered = charities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || c.category === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div style={{padding:'4rem', textAlign:'center'}}>Loading Charities...</div>;

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
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1 }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2, width: '100%' }}>
          <h1 style={{ color: 'white', marginBottom: '1rem' }}>Supported Charities</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Every subscription directly supports the causes below. Browse our partners and choose where your impact goes. 
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.controls} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Search charities..."
              className="input"
              style={{ maxWidth: '350px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className={styles.filterGroup} style={{ display: 'flex', gap: '0.5rem' }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
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
                    <span className="badge">{charity.category || 'Partner'}</span>
                  </div>
                  <p className={styles.charityDesc}>{charity.description}</p>
                  <div className={styles.charityFooter}>
                    <button className="btn btn-white" onClick={() => setSelectedProfile(charity)}>View Profile</button>
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

      {/* Charity Profile Modal (PRD Module 08) */}
      {selectedProfile && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}
          onClick={() => setSelectedProfile(null)}
        >
          <div 
            style={{
              backgroundColor: 'white', maxWidth: '800px', width: '100%',
              borderRadius: '1.5rem', overflow: 'hidden', color: 'black',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}
              onClick={() => setSelectedProfile(null)}
            >✕</button>

            <div style={{ height: '300px', position: 'relative' }}>
              <Image src={selectedProfile.image_url} alt={selectedProfile.name} fill style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', zIndex: 2 }}>
                <span className="badge" style={{ marginBottom: '0.5rem' }}>{selectedProfile.category}</span>
                <h2 style={{ color: 'white', fontSize: '2.5rem', margin: 0 }}>{selectedProfile.name}</h2>
              </div>
            </div>

            <div style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              <div>
                <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>About</h4>
                <p style={{ lineHeight: '1.6', fontSize: '1.05rem' }}>{selectedProfile.description}</p>
                <p style={{ marginTop: '1.5rem', lineHeight: '1.6' }}>
                  As part of the ImpactPlay community, {selectedProfile.name} receives systematic monthly contributions from players to fuel their global mission.
                </p>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '1rem' }}>
                <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Upcoming Events</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ borderLeft: '3px solid var(--accent-green)', paddingLeft: '0.75rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Annual Golf Classic Day</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>June 12, 2026</div>
                  </div>
                  <div style={{ borderLeft: '3px solid var(--accent-green)', paddingLeft: '0.75rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Community Gala Night</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aug 5, 2026</div>
                  </div>
                </div>
                <button className="btn btn-dark" style={{ width: '100%', marginTop: '2rem', justifyContent: 'center' }}>Volunteer Now</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
