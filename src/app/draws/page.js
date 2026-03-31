"use client";
import { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

const PAST_DRAWS = [
  { month: 'March 2026', numbers: [34, 12, 45, 8, 21], match5: 0, match4: 3, match3: 47, pool: '$22,400', jackpotRolled: true },
  { month: 'February 2026', numbers: [18, 29, 7, 36, 41], match5: 1, match4: 8, match3: 89, pool: '$19,800', jackpotRolled: false },
  { month: 'January 2026', numbers: [22, 15, 38, 3, 44], match5: 0, match4: 5, match3: 62, pool: '$18,200', jackpotRolled: true },
];

export default function DrawsPage() {
  const [selectedDraw, setSelectedDraw] = useState(0);

  return (
    <div className={styles.page}>
      <section 
        className={styles.drawHero}
        style={{ 
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#1a1a1a', 
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Image
          src="https://images.pexels.com/photos/33904920/pexels-photo-33904920.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Golf Draws background"
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
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <h1 style={{ color: 'white', marginBottom: '1rem' }}>Monthly Draws</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Every month, 5 winning numbers are drawn. Match your Stableford scores to win from the prize pool.
          </p>

          <div className={styles.nextDraw} style={{ marginBottom: '2rem' }}>
            <span className={styles.nextLabel}>Next Draw:</span>
            <span className={styles.nextDate}>April 1, 2026</span>
          </div>

          <div className={styles.currentPool}>
            <div className={styles.poolAmount}>$24,500</div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Current Prize Pool</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">How the Draw Works</h2>
          <p className="section-subtitle">Your last 5 golf scores are your draw numbers. Match them to win.</p>

          <div className={styles.mechanicsGrid}>
            <div className={styles.mechCard} style={{ backgroundImage: `url(https://images.pexels.com/photos/209982/pexels-photo-209982.jpeg?auto=compress&cs=tinysrgb&w=800)` }}>
              <div className={styles.mechOverlay}>
                <div className={styles.mechIcon}>🎯</div>
                <h3>3-Number Match</h3>
                <div className={styles.mechPercent}>25%</div>
                <p>of the prize pool. Split equally among all 3-match winners.</p>
              </div>
            </div>
            <div className={styles.mechCard} style={{ backgroundImage: `url(https://images.pexels.com/photos/8454632/pexels-photo-8454632.jpeg?auto=compress&cs=tinysrgb&w=800)` }}>
              <div className={styles.mechOverlay}>
                <div className={styles.mechIcon}>⭐</div>
                <h3>4-Number Match</h3>
                <div className={styles.mechPercent}>35%</div>
                <p>of the prize pool. Split equally among all 4-match winners.</p>
              </div>
            </div>
            <div className={styles.mechCard} style={{ backgroundImage: `url(https://images.pexels.com/photos/7758348/pexels-photo-7758348.jpeg?auto=compress&cs=tinysrgb&w=800)` }}>
              <div className={styles.mechOverlay}>
                <div className={styles.mechIcon}>🏆</div>
                <h3>5-Number Match</h3>
                <div className={styles.mechPercent}>40%</div>
                <p>Jackpot! Rolls over to next month if unclaimed.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg-white)' }}>
        <div className="container">
          <h2 className="section-title">Past Draw Results</h2>
          <p className="section-subtitle">View previous draw outcomes and winning statistics.</p>

          <div className={styles.drawTabs}>
            {PAST_DRAWS.map((draw, i) => (
              <button
                key={i}
                className={`${styles.drawTab} ${selectedDraw === i ? styles.drawTabActive : ''}`}
                onClick={() => setSelectedDraw(i)}
              >
                {draw.month}
              </button>
            ))}
          </div>

          <div className={styles.drawResult}>
            <h3 style={{ marginBottom: '1.5rem' }}>Winning Numbers — {PAST_DRAWS[selectedDraw].month}</h3>
            <div className={styles.balls}>
              {PAST_DRAWS[selectedDraw].numbers.map((n, i) => (
                <div key={i} className={styles.ball}>{n}</div>
              ))}
            </div>

            <div className={styles.resultStats}>
              <div className={styles.resultStat}>
                <div className={styles.resultStatValue}>{PAST_DRAWS[selectedDraw].match5}</div>
                <div className={styles.resultStatLabel}>5-Match Winners</div>
                {PAST_DRAWS[selectedDraw].jackpotRolled && <span className="badge">Rolled Over</span>}
              </div>
              <div className={styles.resultStat}>
                <div className={styles.resultStatValue}>{PAST_DRAWS[selectedDraw].match4}</div>
                <div className={styles.resultStatLabel}>4-Match Winners</div>
              </div>
              <div className={styles.resultStat}>
                <div className={styles.resultStatValue}>{PAST_DRAWS[selectedDraw].match3}</div>
                <div className={styles.resultStatLabel}>3-Match Winners</div>
              </div>
              <div className={styles.resultStat}>
                <div className={styles.resultStatValue}>{PAST_DRAWS[selectedDraw].pool}</div>
                <div className={styles.resultStatLabel}>Total Pool</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
