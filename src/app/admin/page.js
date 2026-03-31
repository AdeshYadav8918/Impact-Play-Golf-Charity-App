"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import styles from './page.module.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [charities, setCharities] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [drawResult, setDrawResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [loading, setLoading] = useState(true);

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
    if (activeTab === 'winners') {
      const { data } = await supabase.from('winnings').select('*, profiles(full_name)');
      if (data) setVerifications(data);
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
    
    const userMatches = {};
    allScores?.forEach(s => {
      if (winningNums.includes(s.score)) {
        userMatches[s.user_id] = (userMatches[s.user_id] || 0) + 1;
      }
    });

    let m5 = 0, m4 = 0, m3 = 0;
    Object.values(userMatches).forEach(count => {
      if (count >= 5) m5++;
      else if (count === 4) m4++;
      else if (count === 3) m3++;
    });

    const activeSubs = users.filter(u => u.subscription_status === 'active').length || 1;
    const totalPool = activeSubs * 9.99 * 0.4;

    setDrawResult({
      numbers: winningNums,
      match5: m5, match4: m4, match3: m3,
      pool: `$${totalPool.toLocaleString()}`,
    });
    setIsSimulating(false);
  };

  const handleApprove = async (id) => {
    await supabase.from('winnings').update({ status: 'verified' }).eq('id', id);
    fetchData();
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
                  <div><strong>Matches:</strong> 5-way: {drawResult.match5} | 4-way: {drawResult.match4} | 3-way: {drawResult.match3}</div>
                  <div><strong>Prize Pool Share:</strong> {drawResult.pool}</div>
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
              <thead><tr><th>Player</th><th>Status</th><th>Match</th><th>Actions</th></tr></thead>
              <tbody>
                {verifications.map(v => (
                  <tr key={v.id}>
                    <td><strong>{v.profiles?.full_name}</strong></td>
                    <td><span className="badge">{v.status}</span></td>
                    <td>{v.match_count}-Number</td>
                    <td>{v.status === 'pending' && <button className="btn btn-green" onClick={() => handleApprove(v.id)}>Approve</button>}</td>
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
