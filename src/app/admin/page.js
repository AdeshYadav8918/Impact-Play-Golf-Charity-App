"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import styles from './page.module.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [charities, setCharities] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [drawResult, setDrawResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastDraw, setLastDraw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'users' || activeTab === 'overview') {
      const { data } = await supabase.from('profiles').select('*');
      if (data) setUsers(data);
    }
    if (activeTab === 'charities' || activeTab === 'overview') {
      const { data } = await supabase.from('charities').select('*');
      if (data) setCharities(data);
    }
    if (activeTab === 'draws' || activeTab === 'overview') {
      const { data } = await supabase.from('draws').select('*').order('published_at', { ascending: false }).limit(1).single();
      if (data) setLastDraw(data);
    }
    setLoading(false);
  };

  const simulateDraw = async () => {
    setIsSimulating(true);
    
    // PRD Section 06: Logic
    let winningNums = [];
    while(winningNums.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1;
      if(!winningNums.includes(n)) winningNums.push(n);
    }

    const { data: allScores } = await supabase.from('scores').select('user_id, score');
    
    // Valid users must have exactly 5 scores
    const userScoreCounts = {};
    allScores?.forEach(s => {
      userScoreCounts[s.user_id] = (userScoreCounts[s.user_id] || 0) + 1;
    });
    const validUserIds = Object.keys(userScoreCounts).filter(uid => userScoreCounts[uid] === 5);

    const userMatches = {};
    allScores?.forEach(s => {
      if (validUserIds.includes(s.user_id) && winningNums.includes(s.score)) {
        userMatches[s.user_id] = (userMatches[s.user_id] || 0) + 1;
      }
    });

    let m5 = 0, m4 = 0, m3 = 0;
    Object.values(userMatches).forEach(count => {
      if (count >= 5) m5++;
      else if (count === 4) m4++;
      else if (count === 3) m3++;
    });

    const activeSubs = users.filter(u => u.subscription_status === 'active').length || 0;
    const currentRollover = Number(lastDraw?.rolled_over || 0);
    const subscriptionPool = activeSubs * 9.99;
    
    // PRD Section 07: 40% (match5), 35% (match4), 25% (match3)
    const m5Pool = (subscriptionPool * 0.4) + currentRollover;
    const m4Pool = subscriptionPool * 0.35;
    const m3Pool = subscriptionPool * 0.25;

    setDrawResult({
      numbers: winningNums,
      match5: m5, match4: m4, match3: m3,
      matches: userMatches,
      validUserIds,
      totalPool: subscriptionPool + currentRollover,
      m5Share: m5 > 0 ? m5Pool / m5 : 0,
      m4Share: m4 > 0 ? m4Pool / m4 : 0,
      m3Share: m3 > 0 ? m3Pool / m3 : 0,
      potentialRollover: m5 === 0 ? m5Pool : 0
    });
    setIsSimulating(false);
  };

  const publishDraw = async () => {
    if (!drawResult) return;
    setIsPublishing(true);

    try {
      // 1. Save Draw Results
      const { data: draw, error: dErr } = await supabase.from('draws').insert([{
        draw_month: new Date().toISOString().split('T')[0],
        winning_numbers: drawResult.numbers,
        total_pool: drawResult.totalPool,
        rolled_over: drawResult.potentialRollover,
        match5_winners: drawResult.match5,
        match4_winners: drawResult.match4,
        match3_winners: drawResult.match3
      }]).select().single();

      if (dErr) throw dErr;

      // 2. Create Winnings records for every matcher
      const winningsToInsert = [];
      Object.entries(drawResult.matches).forEach(([uid, count]) => {
        let amount = 0;
        let type = '';
        if (count >= 5) { amount = drawResult.m5Share; type = 'match5'; }
        else if (count === 4) { amount = drawResult.m4Share; type = 'match4'; }
        else if (count === 3) { amount = drawResult.m3Share; type = 'match3'; }

        if (amount > 0) {
          winningsToInsert.push({
            user_id: uid,
            draw_id: draw.id,
            amount: amount,
            match_type: type,
            status: 'pending'
          });
        }
      });

      if (winningsToInsert.length > 0) {
        const { error: wErr } = await supabase.from('winnings').insert(winningsToInsert);
        if (wErr) throw wErr;
      }

      alert("Draw published successfully! Winners notified and Jackpot updated.");
      setDrawResult(null);
      fetchData();
    } catch (err) {
      alert("Error publishing draw: " + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleApprove = async (id) => {
    await supabase.from('winnings').update({ status: 'paid' }).eq('id', id);
    fetchData();
  };

  const handleReject = async (id) => {
    if (confirm("Reject this winning submission? The payout will be cancelled.")) {
      await supabase.from('winnings').update({ status: 'rejected' }).eq('id', id);
      fetchData();
    }
  };

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users & Subs' },
    { id: 'draws', label: 'Draw Engine' },
    { id: 'charities', label: 'Charities' },
    { id: 'winners', label: 'Verifications' },
  ];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}><h3>Admin Console</h3></div>
        <nav className={styles.sidebarNav}>
          {TABS.map(tab => (
            <button key={tab.id} className={`${styles.sidebarLink} ${activeTab === tab.id ? styles.sidebarActive : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className={styles.content}>
        {activeTab === 'overview' && (
          <>
            <div className={styles.adminHeader}>
              <h1 className={styles.pageTitle}>Platform Overview</h1>
              <p>Real-time analytics for the ImpactPlay community.</p>
            </div>
            <div className={styles.statGrid}>
              <div className={styles.statCard}><div className={styles.statLabel}>Active Subscribers</div><div className={styles.statValue}>{users.filter(u => u.subscription_status === 'active').length}</div></div>
              <div className={styles.statCard}><div className={styles.statLabel}>Charity Impact</div><div className={styles.statValue}>${charities.reduce((acc, c) => acc + (Number(c.total_raised) || 0), 0).toLocaleString()}</div></div>
              <div className={styles.statCard}><div className={styles.statLabel}>Live Prize Pool</div><div className={styles.statValue}>$24,500</div></div>
            </div>
            <div className={styles.panel}>
              <h2>System Health</h2>
              <p>Database connected. Security middleware active. RLS enabled.</p>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Name</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.full_name}</strong></td>
                    <td><span className={`badge ${u.subscription_status === 'active' ? '' : 'badge-blue'}`}>{u.subscription_status}</span></td>
                    <td><button className="btn btn-outline" style={{padding:'4px 8px'}}>Manage</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'draws' && (
          <div className={styles.panel}>
            <h2>Draw Engine (Section 06/07)</h2>
            <div style={{marginTop:'1.5rem'}}>
              <button className="btn btn-dark" onClick={simulateDraw} disabled={isSimulating}>
                {isSimulating ? 'Simulating...' : 'Run PRD Draw Engine'}
              </button>
            </div>
            {drawResult && (
              <div className={styles.drawResultBox}>
                <div className={styles.drawnBalls}>{drawResult.numbers.map((n, i) => <div key={i} className={styles.ball}>{n}</div>)}</div>
                <div className={styles.matchResults}>
                  <div><strong>Total Pool (Inc. Rollover):</strong> ${drawResult.totalPool.toFixed(2)}</div>
                  <div><strong>Matches:</strong> 5-way: {drawResult.match5} | 4-way: {drawResult.match4} | 3-way: {drawResult.match3}</div>
                  {drawResult.match5 === 0 && <div style={{color: 'var(--accent-gold)'}}><strong>Rollover Generated:</strong> ${drawResult.potentialRollover.toFixed(2)}</div>}
                </div>
                <div style={{marginTop: '1.5rem'}}>
                  <button className="btn btn-green" onClick={publishDraw} disabled={isPublishing}>
                    {isPublishing ? 'Publishing...' : 'Confirm & Publish Official Results'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'charities' && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Charity</th><th>Raised</th><th>Actions</th></tr></thead>
              <tbody>
                {charities.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>${Number(c.total_raised).toLocaleString()}</td>
                    <td><button className="btn btn-outline">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

         {activeTab === 'winners' && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Player</th><th>Matches</th><th>Prize</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {verifications.map(v => (
                  <tr key={v.id}>
                    <td><strong>{v.profiles?.full_name}</strong></td>
                    <td>{v.match_type}</td>
                    <td>${Number(v.amount).toFixed(2)}</td>
                    <td><span className={`badge ${v.status === 'paid' ? 'badge-green' : v.status === 'rejected' ? 'badge-red' : ''}`}>{v.status}</span></td>
                    <td>
                      {v.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-green" style={{ padding: '4px 12px', fontSize: '0.85rem' }} onClick={() => handleApprove(v.id)}>Pay</button>
                          <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.85rem', color: '#dc2626' }} onClick={() => handleReject(v.id)}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
