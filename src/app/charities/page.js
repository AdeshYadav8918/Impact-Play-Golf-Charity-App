"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

const CHARITIES = [
  { id: 1, name: "Green Earth Initiative", focus: "Environment", desc: "Reforesting ecosystems globally through sustainable planting programs and community education.", raised: "$34,200", img: "https://images.pexels.com/photos/209982/pexels-photo-209982.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  { id: 2, name: "Youth Tech Fund", focus: "Education", desc: "Providing laptops and coding education to underprivileged students worldwide.", raised: "$28,100", img: "https://images.pexels.com/photos/8454632/pexels-photo-8454632.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  { id: 3, name: "Clean Water Access", focus: "Health", desc: "Building sustainable wells and water purification systems in rural areas across Africa.", raised: "$42,800", img: "https://images.pexels.com/photos/9366508/pexels-photo-9366508.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  { id: 4, name: "Golf4Good Foundation", focus: "Sports", desc: "Introducing golf to youth communities as a pathway to scholarships and personal development.", raised: "$18,500", img: "https://images.pexels.com/photos/7758348/pexels-photo-7758348.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  { id: 5, name: "Mental Health First", focus: "Wellness", desc: "Breaking stigma and providing free counselling services to those in need.", raised: "$22,300", img: "https://images.pexels.com/photos/33478/pexels-photo-33478.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  { id: 6, name: "Ocean Guardians", focus: "Environment", desc: "Protecting marine ecosystems through cleanup drives and sustainable fishing advocacy.", raised: "$15,700", img: "https://images.pexels.com/photos/33904920/pexels-photo-33904920.jpeg?auto=compress&cs=tinysrgb&w=1200" },
];

const FILTERS = ['All', 'Environment', 'Education', 'Health', 'Sports', 'Wellness'];

export default function CharitiesPage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = CHARITIES.filter(c => {
    const matchesFilter = filter === 'All' || c.focus === filter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
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
                style={{ backgroundImage: `url(${charity.img})` }}
              >
                <div className={styles.charityOverlay}>
                  <div className={styles.charityHeader}>
                    <h3>{charity.name}</h3>
                    <span className="badge">{charity.focus}</span>
                  </div>
                  <p className={styles.charityDesc}>{charity.desc}</p>
                  <div className={styles.charityFooter}>
                    <div>
                      <span className={styles.raisedLabel}>Total Raised</span>
                      <span className={styles.raisedAmount}>{charity.raised}</span>
                    </div>
                    <Link href="/login" className="btn btn-dark">View Profile</Link>
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
