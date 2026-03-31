"use client";
import { useState } from 'react';
import styles from './page.module.css';

const MOCK_USERS = [
  { id: 1, name: 'Alex Johnson', email: 'alex@example.com', plan: 'Monthly', status: 'Active', scores: [32,28,36,30,34] },
  { id: 2, name: 'Sarah Williams', email: 'sarah@example.com', plan: 'Yearly', status: 'Active', scores: [40,22,18,35,29] },
  { id: 3, name: 'Mike Chen', email: 'mike@example.com', plan: 'Monthly', status: 'Lapsed', scores: [25,31,27,33,19] },
  { id: 4, name: 'Emily Davis', email: 'emily@example.com', plan: 'Yearly', status: 'Active', scores: [38,42,15,28,37] },
  { id: 5, name: 'Tom Harris', email: 'tom@example.com', plan: 'Monthly', status: 'Active', scores: [20,26,44,31,23] },
];

const MOCK_CHARITIES = [
  { id: 1, name: 'Green Earth Initiative', raised: '$34,200', subs: 420 },
  { id: 2, name: 'Youth Tech Fund', raised: '$28,100', subs: 310 },
  { id: 3, name: 'Clean Water Access', raised: '$42,800', subs: 580 },
];

const MOCK_WINNERS = [
  { id: 1, user: 'Sarah Williams', month: 'March 2026', match: 4, amount: '$680', proofStatus: 'Pending' },
  { id: 2, user: 'Emily Davis', month: 'February 2026', match: 5, amount: '$4,200', proofStatus: 'Approved' },
  { id: 3, user: 'Tom Harris', month: 'February 2026', match: 3, amount: '$120', proofStatus: 'Approved' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [drawLogic, setDrawLogic] = useState('random');
  const [isSimulating, setIsSimulating] = useState(false);
  const [drawResult, setDrawResult] = useState(null);

  const simulateDraw = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const nums = Array.from({ length: 5 }, () => Math.floor(Math.random() * 45) + 1);
      setDrawResult({
        numbers: [...new Set(nums)].slice(0, 5),
        match5: 0, match4: Math.floor(Math.random() * 5) + 1, match3: Math.floor(Math.random() * 80) + 30,
        pool: '$24,500',
      });
      // Pad to ensure 5 unique numbers
      while (drawResult === null) break;
      setIsSimulating(false);
    }, 1500);
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
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3>Admin Console</h3>
        </div>
        <nav className={styles.sidebarNav}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.sidebarLink} ${activeTab === tab.id ? styles.sidebarActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className={styles.content}>
        {/* ===== OVERVIEW ===== */}
        {activeTab === 'overview' && (
          <>
            <div className={styles.adminHeader}>
              <h1 className={styles.pageTitle}>Platform Overview</h1>
              <p>Real-time analytics and management for the ImpactPlay community.</p>
            </div>
            <div className={styles.statGrid}>
              <div className={styles.statCard}><div className={styles.statLabel}>Active Subscribers</div><div className={styles.statValue}>1,245</div></div>
              <div className={styles.statCard}><div className={styles.statLabel}>Total Charity Donations</div><div className={styles.statValue}>$185,400</div></div>
              <div className={styles.statCard}><div className={styles.statLabel}>Current Prize Pool</div><div className={styles.statValue}>$24,500</div></div>
              <div className={styles.statCard}><div className={styles.statLabel}>Next Draw</div><div className={styles.statValue}>Apr 1</div></div>
            </div>

            <div className={styles.panel}>
              <h2>Recent Activity</h2>
              <div className={styles.activityList}>
                <div className={styles.activityItem}><span>🟢</span> Sarah Williams uploaded winner proof — <strong>Pending review</strong></div>
                <div className={styles.activityItem}><span>🔵</span> 12 new subscribers this week</div>
                <div className={styles.activityItem}><span>🟠</span> March 2026 draw results published</div>
                <div className={styles.activityItem}><span>🟢</span> Emily Davis payout marked as <strong>Completed</strong></div>
              </div>
            </div>
          </>
        )}

        {/* ===== USERS ===== */}
        {activeTab === 'users' && (
          <>
            <div className={styles.adminHeader}>
              <h1 className={styles.pageTitle}>Users & Subscriptions</h1>
              <p>Manage member accounts, track subscription health, and verify scores.</p>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Plan</th><th>Status</th><th>Scores</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_USERS.map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.plan}</td>
                      <td><span className={`badge ${u.status === 'Active' ? '' : 'badge-blue'}`}>{u.status}</span></td>
                      <td>{u.scores.join(', ')}</td>
                      <td><button className="btn btn-outline" style={{padding:'0.4rem 0.8rem', fontSize:'0.8rem'}}>Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== DRAW ENGINE ===== */}
        {activeTab === 'draws' && (
          <>
            <div className={styles.adminHeader}>
              <h1 className={styles.pageTitle}>Draw Engine</h1>
              <p>Secure, transparent, and fair prize draw generation tools.</p>
            </div>
            <div className={styles.panel}>
              <h2>Monthly Draw Simulator</h2>
              <p style={{color:'var(--text-secondary)', marginBottom:'1.5rem'}}>
                Test draw logic before publishing official results. Choose between random or algorithm-weighted generation.
              </p>
              <div style={{display:'flex', gap:'1rem', marginBottom:'2rem', flexWrap:'wrap'}}>
                <select className="select" style={{maxWidth:'250px'}} value={drawLogic} onChange={(e) => setDrawLogic(e.target.value)}>
                  <option value="random">Random Generation</option>
                  <option value="algorithm">Algorithmic (Weighted by Frequency)</option>
                </select>
                <button className="btn btn-dark" onClick={simulateDraw} disabled={isSimulating}>
                  {isSimulating ? 'Simulating...' : 'Run Simulation'}
                </button>
              </div>

              {drawResult && (
                <div className={styles.drawResultBox}>
                  <h3>Simulation Results</h3>
                  <div className={styles.drawnBalls}>
                    {drawResult.numbers.map((n, i) => (
                      <div key={i} className={styles.ball}>{n}</div>
                    ))}
                  </div>
                  <div className={styles.matchResults}>
                    <div><strong>5-Match:</strong> {drawResult.match5} winners {drawResult.match5 === 0 ? '(Jackpot Rolls Over)' : ''}</div>
                    <div><strong>4-Match:</strong> {drawResult.match4} winners</div>
                    <div><strong>3-Match:</strong> {drawResult.match3} winners</div>
                    <div><strong>Pool:</strong> {drawResult.pool}</div>
                  </div>
                  <div style={{display:'flex', gap:'0.75rem', marginTop:'1.5rem'}}>
                    <button className="btn btn-green">Publish Results</button>
                    <button className="btn btn-outline" onClick={simulateDraw}>Re-run Simulation</button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== CHARITIES ===== */}
        {activeTab === 'charities' && (
          <>
            <div className={styles.adminHeader}>
              <h1 className={styles.pageTitle}>Charity Management</h1>
              <p>Onboard new partners and monitor community impact across all charities.</p>
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'1rem'}}>
              <button className="btn btn-dark">+ Add Charity</button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr><th>Charity Name</th><th>Total Raised</th><th>Subscribers</th><th>Actions</th></tr></thead>
                <tbody>
                  {MOCK_CHARITIES.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td style={{color:'var(--accent-green)', fontWeight:700}}>{c.raised}</td>
                      <td>{c.subs}</td>
                      <td>
                        <button className="btn btn-outline" style={{padding:'0.4rem 0.8rem', fontSize:'0.8rem', marginRight:'0.5rem'}}>Edit</button>
                        <button className="btn btn-outline" style={{padding:'0.4rem 0.8rem', fontSize:'0.8rem', color:'#ef4444', borderColor:'#ef4444'}}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== WINNERS ===== */}
        {activeTab === 'winners' && (
          <>
            <div className={styles.adminHeader}>
              <h1 className={styles.pageTitle}>Winner Verification</h1>
              <p>Review proof of handicap and score verification for all prize winners.</p>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr><th>User</th><th>Month</th><th>Match</th><th>Amount</th><th>Proof</th><th>Action</th></tr></thead>
                <tbody>
                  {MOCK_WINNERS.map(w => (
                    <tr key={w.id}>
                      <td><strong>{w.user}</strong></td>
                      <td>{w.month}</td>
                      <td>{w.match}-Number</td>
                      <td style={{fontWeight:700}}>{w.amount}</td>
                      <td><span className={`badge ${w.proofStatus === 'Pending' ? 'badge-blue' : ''}`}>{w.proofStatus}</span></td>
                      <td>
                        {w.proofStatus === 'Pending' ? (
                          <div style={{display:'flex', gap:'0.5rem'}}>
                            <button className="btn btn-green" style={{padding:'0.4rem 0.8rem', fontSize:'0.8rem'}}>Approve</button>
                            <button className="btn btn-outline" style={{padding:'0.4rem 0.8rem', fontSize:'0.8rem', color:'#ef4444', borderColor:'#ef4444'}}>Reject</button>
                          </div>
                        ) : (
                          <button className="btn btn-outline" style={{padding:'0.4rem 0.8rem', fontSize:'0.8rem'}}>Mark Paid</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
