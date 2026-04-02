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
  const [drawInfo, setDrawInfo] = useState(null);
  const [winnings, setWinnings] = useState([]);
  const [donationAmount, setDonationAmount] = useState('25');
  const [isUpdatingCharity, setIsUpdatingCharity] = useState(false);
  const [tempPercentage, setTempPercentage] = useState(10);

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
      fetchDrawData();
      fetchWinnings(session.user.id);
    };

    fetchUserData();
  }, [router]);

  const fetchWinnings = async (userId) => {
    const { data } = await supabase.from('winnings').select('*').eq('user_id', userId);
    if (data) setWinnings(data);
  };

  const fetchDrawData = async () => {
    const { data: latestDraw } = await supabase
      .from('draws')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(1)
      .single();
    
    if (latestDraw) setDrawInfo(latestDraw);
  };

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

  const handleUpdateCharity = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ contribution_percentage: tempPercentage })
      .eq('id', session.user.id);
    
    if (error) {
      alert("Error updating contribution: " + error.message);
    } else {
      setProfile({ ...profile, contribution_percentage: tempPercentage });
      setIsUpdatingCharity(false);
      alert("Contribution updated successfully! Your impact just grew.");
    }
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
    const { data: currentScores } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', session.user.id)
      .order('date_played', { ascending: true });

    if (currentScores && currentScores.length >= 5) {
      const oldestId = currentScores[0].id;
      await supabase.from('scores').delete().eq('id', oldestId);
    }

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
      localStorage.removeItem('draftScore');
      localStorage.removeItem('draftDate');
      fetchScores(session.user.id);
    }
  };

  const handleDeleteScore = async (scoreId) => {
    if (confirm("Remove this score entry? This will free up a slot for a new round.")) {
      const { error } = await supabase.from('scores').delete().eq('id', scoreId);
      if (!error) {
        fetchScores(session.user.id);
      } else {
        alert("Error removing score.");
      }
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
          
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Your Latest Scores</h2>
              <span className={styles.panelMeta}>Stableford Format · Max 5 Scores</span>
            </div>
            <p className={styles.panelDesc}>
              {scores.length < 5 ? (
                <span style={{ color: '#eab308', fontWeight: 600 }}>
                  ⚠️ You must enter {5 - scores.length} more score{5 - scores.length === 1 ? '' : 's'} to qualify for the Monthly Draw.
                </span>
              ) : (
                "Enter your most recent round. Oldest score is automatically replaced when you exceed 5."
              )}
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
                    <button 
                      className={styles.scoreDelete}
                      onClick={() => handleDeleteScore(s.id)}
                      title="Remove score"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <div className={styles.sideStack}>
            <div className={styles.panel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Subscription</h3>
                {profile.subscription_status === 'inactive' && (
                  <Link href="/register" className="btn btn-dark" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Renew</Link>
                )}
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Plan</span>
                  <span className={styles.infoValue}>Monthly</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Status</span>
                  <span className={styles.infoValue} style={{color: profile.subscription_status === 'active' ? 'var(--accent-green)' : 'var(--text-muted)'}}>
                    {profile.subscription_status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Renewal</span>
                  <span className={styles.infoValue}>{profile.subscription_status === 'active' ? 'April 15, 2026' : '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Amount</span>
                  <span className={styles.infoValue}>$9.99/mo</span>
                </div>
              </div>
              {profile.subscription_status === 'active' && (
                <button 
                  className="btn btn-outline" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', color: '#dc2626', borderColor: 'rgba(239,68,68,0.2)' }}
                  onClick={async () => {
                    if (confirm("Are you sure you want to cancel your ImpactPlay subscription? You will lose access to premium features instantly.")) {
                      const { error } = await supabase.from('profiles').update({ subscription_status: 'inactive' }).eq('id', session.user.id);
                      if (!error) {
                        setProfile({ ...profile, subscription_status: 'inactive' });
                      } else {
                        alert("Error cancelling subscription.");
                      }
                    }
                  }}
                >
                  Cancel Subscription
                </button>
              )}
            </div>

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
                onClick={() => {
                  if (profile.subscription_status === 'inactive') {
                    alert("This premium feature is locked. Please upgrade your account to access it.");
                    router.push('/register');
                  } else {
                    setTempPercentage(profile.contribution_percentage || 10);
                    setIsUpdatingCharity(true);
                  }
                }}
              >
                Change Charity Settings
              </button>
            </div>

            <div className={styles.panel}>
              <h3>Rewards Overview</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Draws Entered</span>
                  <span className={styles.infoValue}>{winnings.length + 8}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Next Draw</span>
                  <span className={styles.infoValue}>{drawInfo ? new Date(new Date(drawInfo.draw_month).setMonth(new Date(drawInfo.draw_month).getMonth() + 1)).toLocaleDateString() : 'April 15, 2026'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Current Jackpot</span>
                  <span className={styles.infoValue} style={{color: 'var(--accent-green)', fontWeight: 800}}>
                    ${drawInfo ? (drawInfo.total_pool * 0.4 + drawInfo.rolled_over).toLocaleString() : '24,500'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Total Win</span>
                  <span className={styles.infoValue}>${winnings.reduce((acc, w) => acc + (Number(w.amount) || 0), 0).toFixed(2)}</span>
                </div>
              </div>
              {winnings.some(w => w.status === 'pending') && (
                <div style={{ marginTop: '1rem' }}>
                  <label className="btn btn-dark" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
                    Upload Winner Proof (Screenshot)
                    <input type="file" hidden onChange={handleUploadProof} accept="image/*" />
                  </label>
                  <p style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', marginTop: '0.5rem', textAlign: 'center' }}>
                    ⚠️ Action Required: Upload proof for your pending prize.
                  </p>
                </div>
              )}
            </div>

            <div className={styles.panel} style={{ background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(22, 163, 74, 0.02) 100%)', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
              <h3 style={{ color: 'var(--accent-green)' }}>Direct Donation</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Make a standalone impact today. 100% of this goes to your selected charity.</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {['10', '25', '50'].map(amt => (
                  <button 
                    key={amt} 
                    className={`btn ${donationAmount === amt ? 'btn-dark' : 'btn-outline'}`} 
                    style={{ flex: 1, padding: '0.5rem' }}
                    onClick={() => setDonationAmount(amt)}
                  >${amt}</button>
                ))}
                <input 
                  type="number" 
                  placeholder="Other" 
                  className="input" 
                  style={{ flex: 1.5, padding: '0.5rem', fontSize: '0.85rem' }} 
                  onChange={(e) => setDonationAmount(e.target.value)}
                />
              </div>
              <button 
                className="btn btn-green" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => alert(`Redirecting to secure donation of $${donationAmount} to ${profile.charity_name || 'Green Earth Initiative'}...`)}
              >
                Donate Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charity Update Modal (PRD Module 08) */}
      {isUpdatingCharity && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', padding: '2rem', borderRadius: '1.5rem', maxWidth: '450px', width: '100%', color: 'white' }}>
            <h3 style={{ marginBottom: '1rem' }}>Increase Your Impact</h3>
            <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '1.5rem' }}>Set your commitment level. A minimum of 10% is required, but you can voluntarily increase this up to 100%.</p>
            
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Contribution Percentage</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>{tempPercentage}%</span>
              </div>
              <input 
                type="range" min="10" max="100" step="5" 
                value={tempPercentage} 
                onChange={(e) => setTempPercentage(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-green)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.75rem', color: '#666' }}>
                <span>10% (Min)</span>
                <span>100% (Max)</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setIsUpdatingCharity(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-green" 
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleUpdateCharity}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

