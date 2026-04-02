"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import styles from './page.module.css';

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState({});
  const [scores, setScores] = useState([]);
  const [newScore, setNewScore] = useState('');
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Load from cache on mount
  useEffect(() => {
    const cachedScore = localStorage.getItem('draftScore');
    const cachedDate = localStorage.getItem('draftDate');
    if (cachedScore) setNewScore(cachedScore);
    if (cachedDate) setNewDate(cachedDate);
  }, []);

  // Save to cache on change
  useEffect(() => {
    localStorage.setItem('draftScore', newScore);
    localStorage.setItem('draftDate', newDate);
  }, [newScore, newDate]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setSession(session);

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // Fetch Scores
      fetchScores(session.user.id);
    };

    fetchUserData();
  }, [router]);

  const fetchScores = async (userId) => {
    const { data: scoreData } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('date_played', { ascending: false })
      .limit(5);
    
    if (scoreData) setScores(scoreData);
    setLoading(false);
  };

  const handleAddScore = async (e) => {
    e.preventDefault();
    if (profile.subscription_status === 'inactive') {
      alert("This premium feature is locked. Please upgrade your account to access it.");
      router.push('/register');
      return;
    }
    if (!session) return;
    
    const val = parseInt(newScore);
    if (!val || val < 1 || val > 45) return alert("Score must be between 1 and 45 (Stableford format)");
    if (!newDate) return alert("Please select a date for this score.");

    // PRD Section 05: Rolling Logic (Keep only latest 5)
    // 1. Get current count
    const { data: currentScores } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', session.user.id)
      .order('date_played', { ascending: true });

    if (currentScores && currentScores.length >= 5) {
      // 2. Delete the oldest one (the first in our ascending list)
      const oldestId = currentScores[0].id;
      await supabase.from('scores').delete().eq('id', oldestId);
    }

    // 3. Insert new score
    const { error } = await supabase.from('scores').insert({
      user_id: session.user.id,
      score: val,
      date_played: newDate
    });

    if (error) {
      alert("Error adding score: " + error.message);
    } else {
      setNewScore('');
      setNewDate('');
      // Clear cache on success
      localStorage.removeItem('draftScore');
      localStorage.removeItem('draftDate');
      fetchScores(session.user.id); // Refresh grid
    }
  };

  const handleUploadProof = async (e) => {
    if (profile.subscription_status === 'inactive') {
      e.target.value = ''; // clear input
      alert("This premium feature is locked. Please upgrade your account to access it.");
      router.push('/register');
      return;
    }
    const file = e.target.files[0];
    if (!file) return;

    alert("Simulating Upload: In a production environment, this would upload " + file.name + " to Supabase Storage Bucket 'winner-proofs' and update the winnings entry.");
  };

  if (loading) return <div style={{padding:'4rem', textAlign:'center'}}>Loading Dashboard...</div>;

  return (
    <div className={styles.page}>
      <div className={`container ${styles.dashboard}`}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.greeting}>Welcome back, {profile.full_name?.split(' ')[0] || 'Golfer'}</h1>
            <p className={styles.headerSub}>Manage your scores, track your draws, and see your impact.</p>
          </div>
          <div className={styles.statusBadge}>
            ● {profile.subscription_status === 'active' ? 'Active Subscription' : 'Inactive Subscription'}
          </div>
        </header>

        <div className={styles.grid} style={{ position: 'relative' }}>
          
          {/* ===== LEFT: Scores ===== */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Your Latest Scores</h2>
              <span className={styles.panelMeta}>Stableford Format · Max 5 Scores</span>
            </div>
            <p className={styles.panelDesc}>
              Enter your most recent round. Oldest score is automatically replaced when you exceed 5.
            </p>

            <form className={styles.scoreForm} onSubmit={handleAddScore}>
              <input
                type="number" min="1" max="45"
                placeholder="Score (1–45)"
                className="input"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                required
              />
              <input
                type="date"
                className="input"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-dark">Add Score</button>
            </form>

            <div className={styles.scoreList}>
              {scores.length === 0 ? (
                <p style={{color:'var(--text-muted)', fontStyle:'italic', marginTop:'1rem'}}>No scores logged yet. Add your first score above!</p>
              ) : (
                scores.map((s, idx) => (
                  <div key={s.id} className={styles.scoreRow}>
                    <div className={styles.scoreRank}>#{idx + 1}</div>
                    <div className={styles.scoreValue}>{s.score} <span>pts</span></div>
                    <div className={styles.scoreDate}>{new Date(s.date_played).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ===== RIGHT: Side panels ===== */}
          <div className={styles.sideStack}>
            {/* Subscription */}
            <div className={styles.panel}>
              <h3>Subscription</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Plan</span>
                  <span className={styles.infoValue}>Monthly</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Status</span>
                  <span className={styles.infoValue} style={{color: 'var(--accent-green)'}}>Active</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Renewal</span>
                  <span className={styles.infoValue}>April 15, 2026</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Amount</span>
                  <span className={styles.infoValue}>$9.99/mo</span>
                </div>
              </div>
            </div>

            {/* Charity */}
            <div className={styles.panel}>
              <h3>Charity Contribution</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Supporting</span>
                  <span className={styles.infoValue}>{profile.charity_name || 'Green Earth Initiative'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Contribution</span>
                  <span className={styles.infoValue}>{profile.contribution_percentage || 10}%</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Total Given</span>
                  <span className={styles.infoValue} style={{color: 'var(--accent-green)'}}>$42.50</span>
                </div>
              </div>
              <button 
                className="btn btn-outline" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                onClick={(e) => {
                  if (profile.subscription_status === 'inactive') {
                    alert("This premium feature is locked. Please upgrade your account to access it.");
                    router.push('/register');
                  }
                }}
              >
                Change Charity Settings
              </button>
            </div>

            {/* Draw & Rewards */}
            <div className={styles.panel}>
              <h3>Rewards Overview</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Draws Entered</span>
                  <span className={styles.infoValue}>8</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Next Draw</span>
                  <span className={styles.infoValue}>Apr 1, 2026</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Total Winnings</span>
                  <span className={styles.infoValue} style={{color: 'var(--accent-green)', fontWeight: 800}}>$120.00</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Payout Status</span>
                  <span className={styles.infoValue}>Paid</span>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label className="btn btn-dark" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
                  Upload Winner Proof (PNG/JPG)
                  <input type="file" hidden onChange={handleUploadProof} accept="image/*" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
