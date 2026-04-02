"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import styles from "./page.module.css";

const IMAGES = {
  hero: 'https://img.freepik.com/free-photo/person-aiming-golf-flag_23-2149305774.jpg?w=1480',
  golfer: 'https://img.freepik.com/free-photo/professional-golf-player_654080-2040.jpg?w=1480',
  friends: 'https://img.freepik.com/free-photo/professional-golf-player_654080-2041.jpg?w=1480',
  couple: 'https://img.freepik.com/free-photo/beautiful-couple-playing-golf-golf-course_1157-23213.jpg?w=1480',
  volunteers: 'https://img.freepik.com/free-photo/two-volunteers-expressing-unity-support_1262-21089.jpg?w=1480',
  course: 'https://img.freepik.com/free-photo/professional-golf-player_654080-2041.jpg?w=1480',
};

const STEPS = [
  {
    id: 'subscribe',
    title: 'Subscribe & Join',
    headline: 'One subscription. Triple impact.',
    desc: 'Choose a monthly or yearly plan. Your subscription fuels the prize pool, supports charities, and gets you into monthly draws — all in one step.',
    items: [
      'Choose monthly or yearly plan',
      'Select your preferred charity',
      'Set your charity contribution (min 10%)',
      'Secure payment via Stripe',
      'Instant access to the full platform',
    ],
    highlight: 'Every subscription directly helps a cause you care about.',
  },
  {
    id: 'score',
    title: 'Log Your Scores',
    headline: 'Your game. Your numbers.',
    desc: 'Enter your latest Stableford scores after each round. The platform tracks your last 5 scores, which automatically become your draw entries for the month.',
    items: [
      'Enter scores in Stableford format (1–45)',
      'Rolling history of your 5 most recent scores',
      'Oldest score auto-replaced by new entry',
      'Scores displayed in reverse chronological order',
      'Date-stamped for verification',
    ],
    highlight: 'Your real scores are your lottery numbers. No randomness — just play.',
  },
  {
    id: 'draw',
    title: 'Monthly Draw',
    headline: 'Match to win. Big.',
    desc: 'Each month, the platform generates a set of 5 winning numbers. Match 3, 4, or all 5 of your scores to win a share of the prize pool.',
    items: [
      '5-Number Match → 40% of pool (Jackpot)',
      '4-Number Match → 35% of pool',
      '3-Number Match → 25% of pool',
      'Jackpot rolls over if unclaimed',
      'Random or algorithm-weighted draw logic',
    ],
    highlight: 'Unclaimed jackpots keep growing. The longer it rolls, the bigger the win.',
  },
  {
    id: 'impact',
    title: 'Charity Impact',
    headline: 'Give while you play.',
    desc: 'A portion of every subscription goes directly to verified charities. You choose where your contribution goes, and you can increase it anytime.',
    items: [
      'Minimum 10% of subscription to charity',
      'Choose from vetted charity partners',
      'Increase your contribution voluntarily',
      'Make standalone donations anytime',
      'Track total community impact live',
    ],
    highlight: 'This isn\'t an add-on. Giving is built into the DNA of the platform.',
  },
];

const FAQ_ITEMS = [
  { q: 'What is ImpactPlay?', a: 'ImpactPlay is a subscription-based golf platform that lets you track your Stableford scores, enter monthly prize draws based on your real scores, and support charities — all through one membership.' },
  { q: 'How does the monthly draw work?', a: 'Every month, 5 winning numbers (1–45) are drawn. If 3, 4, or all 5 of your latest scores match, you win a share of the prize pool. The 5-number jackpot rolls over if unclaimed.' },
  { q: 'What is Stableford scoring?', a: 'Stableford is a golf scoring system where points are awarded based on the number of strokes taken at each hole relative to par. Scores typically range from 0 to 45 points per round.' },
  { q: 'How are charities selected?', a: 'We partner with verified charitable organizations across multiple sectors. When you subscribe, you choose which charity receives your contribution (minimum 10% of your subscription fee).' },
  { q: 'Can I change my charity or increase my contribution?', a: 'Absolutely. You can switch your selected charity or increase your contribution percentage at any time from your dashboard settings.' },
  { q: 'What happens to the prize pool if nobody wins the jackpot?', a: 'The 5-number match jackpot rolls over to the next month\'s draw, growing the prize until someone wins it. The 3 and 4-match pools do not roll over.' },
];

const CHARITIES_LIST = [
  { name: 'Green Earth Initiative', focus: 'Environment', desc: 'Planting trees and cleaning oceans to combat climate change globally.' },
  { name: 'Youth Tech Fund', focus: 'Education', desc: 'Providing laptops and coding classes to underprivileged students.' },
  { name: 'Clean Water Access', focus: 'Global Health', desc: 'Building sustainable water and sanitization systems in developing regions.' },
  { name: 'Golf4Good Foundation', focus: 'Community Sports', desc: 'Making golf accessible to youth and using the sport for community building.' },
  { name: 'Mental Health First', focus: 'Wellness', desc: 'Funding free therapy sessions and breaking the stigma around mental health.' }
];

export default function Home() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSession(session);
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) setProfile(data);
      }
    };
    checkUser();
  }, []);

  return (
    <div>
      {/* ========= HERO ========= */}
      <section className={styles.hero}>
        <Image
          src="https://images.pexels.com/photos/209982/pexels-photo-209982.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Golf Course Hero"
          fill
          priority
          style={{ objectFit: 'cover', zIndex: 0 }}
        />
        <div className={styles.heroOverlay} style={{ background: 'rgba(0, 0, 0, 0.3)', zIndex: 1 }} />
        
        <div className={`container ${styles.heroContent}`} style={{ position: 'relative', zIndex: 2 }}>
          <div className={`animate-in ${styles.heroBadge}`}>
            <span className={styles.badgeDot} /> New — Monthly draws are live
          </div>
          <h1 className={`animate-in delay-1 ${styles.heroTitle} text-shadow`}>
            Play. Give. Win.
          </h1>
          <p className={`animate-in delay-2 ${styles.heroSub}`}>
            A subscription platform where your golf scores power monthly prize draws and fund charities you care about. No luck needed — just your game.
          </p>
          <div className={`animate-in delay-3 ${styles.heroCta}`}>
            {session ? (
              <>
                {profile?.subscription_status === 'admin' ? (
                  <Link href="/admin" className="btn btn-dark btn-lg">Access Admin Console →</Link>
                ) : (
                  <Link href="/dashboard" className="btn btn-dark btn-lg">Go to My Dashboard →</Link>
                )}
              </>
            ) : (
              <>
                <Link href="/register" className="btn btn-dark btn-lg">Subscribe & Play →</Link>
                <Link href="#how-it-works" className="btn btn-white btn-lg">See how it works</Link>
              </>
            )}
          </div>
        </div>

        <div className={`animate-in delay-4 ${styles.heroStats}`} style={{ zIndex: 2 }}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>$24,500</div>
            <div className={styles.statLabel}>Current Prize Pool</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>$185K+</div>
            <div className={styles.statLabel}>Donated to Charity</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>2,400+</div>
            <div className={styles.statLabel}>Active Subscribers</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>40%</div>
            <div className={styles.statLabel}>Jackpot Allocation</div>
          </div>
        </div>
      </section>

      {/* ========= EDITORIAL IMAGE SHOWCASE ========= */}
      <section className={styles.editorialSection}>
        <div className="container">
          <div className={styles.editorialGrid}>
            <div className={styles.editorialCard}>
              <Image src={IMAGES.golfer} alt="Professional golfer in action" width={600} height={400} className={styles.editorialImg} />
              <div className={styles.editorialOverlay}>
                <span className="label-upper">The Game</span>
                <h3>Your scores tell the story.</h3>
              </div>
            </div>
            <div className={styles.editorialCard}>
              <Image src={IMAGES.volunteers} alt="Volunteers supporting charity" width={600} height={400} className={styles.editorialImg} />
              <div className={styles.editorialOverlay}>
                <span className="label-upper">The Impact</span>
                <h3>Every subscription funds what matters.</h3>
              </div>
            </div>
            <div className={styles.editorialCardWide}>
              <Image src={IMAGES.friends} alt="Friends playing golf together" width={1200} height={400} className={styles.editorialImg} />
              <div className={styles.editorialOverlay}>
                <span className="label-upper">The Community</span>
                <h3>Built by golfers, for golfers who give back.</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========= HOW IT WORKS ========= */}
      <section id="how-it-works" className={`section ${styles.howSection}`} style={{ position: 'relative', overflow: 'hidden' }}>
        <Image src="https://images.pexels.com/photos/8454632/pexels-photo-8454632.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="How it Works Background" fill style={{ objectFit: 'cover', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.3)', zIndex: 1 }} />
        <div className={`container ${styles.howContainer}`} style={{ position: 'relative', zIndex: 2 }}>
          <h2 className="section-title">How ImpactPlay Works</h2>
          <p className="section-subtitle" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Four simple steps from signup to impact.</p>
          <div className={styles.featureShowcase}>
            <div className={styles.featureIntro}>
              <div className={styles.featureNav}>
                {STEPS.map((step, i) => (
                  <button key={step.id} className={`${styles.featureNavItem} ${activeStep === i ? styles.featureNavActive : ''}`} onClick={() => setActiveStep(i)}>• {step.title}</button>
                ))}
              </div>
            </div>
            <div className={styles.featureDetail}>
              <h3 className={styles.featureHeadline}>{STEPS[activeStep].headline}</h3>
              <p className={styles.featureDesc}>{STEPS[activeStep].desc}</p>
              <div className={styles.featureSteps}>
                <p className={styles.stepsLabel}>WHAT ACTUALLY HAPPENS:</p>
                {STEPS[activeStep].items.map((item, i) => (
                  <div key={i} className={styles.stepRow}><span className={styles.stepNum}>{activeStep + 1}.{i + 1}</span><span>{item}</span></div>
                ))}
              </div>
              <div className={styles.featureHighlight}>✨ {STEPS[activeStep].highlight}</div>
              {!session && <Link href="/register" className="btn btn-dark" style={{ marginTop: '1.5rem' }}>Get started now</Link>}
            </div>
          </div>
        </div>
      </section>

      {/* ========= PRIZE POOL BREAKDOWN ========= */}
      <section className={`section ${styles.poolSection}`}>
        <div className="container">
          <h2 className="section-title">Prize Pool Breakdown</h2>
          <p className="section-subtitle">A fixed portion of every subscription funds the monthly prize pool.</p>
          <div className={styles.poolGrid}>
            <div className={`card ${styles.poolCard}`}><div className={styles.poolTier}>🏆 5-Number Match</div><div className={styles.poolPercent}>40%</div><div className={styles.poolMeta}>Jackpot — rolls over if unclaimed</div></div>
            <div className={`card ${styles.poolCard}`}><div className={styles.poolTier}>⭐ 4-Number Match</div><div className={styles.poolPercent}>35%</div><div className={styles.poolMeta}>Split equally among winners</div></div>
            <div className={`card ${styles.poolCard}`}><div className={styles.poolTier}>🎯 3-Number Match</div><div className={styles.poolPercent}>25%</div><div className={styles.poolMeta}>Split equally among winners</div></div>
          </div>
        </div>
      </section>

      {/* ========= CHARITIES ROW ========= */}
      <section id="charities" className="section" style={{ backgroundColor: 'var(--bg-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Our Charity Partners</h2>
            <p className="section-subtitle">When you subscribe, you choose exactly where your automated contributions go. Explore the vetted organizations driving real change.</p>
          </div>
          <div className={styles.poolGrid} style={{ gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {CHARITIES_LIST.map((charity, i) => (
              <div key={i} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-green)', letterSpacing: '0.5px' }}>
                  {charity.focus}
                </span>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', margin: 0 }}>{charity.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                  {charity.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========= PRICING ========= */}
      <section id="pricing" className={`section ${styles.pricingSection}`} style={{ position: 'relative', overflow: 'hidden' }}>
        <Image src="https://images.pexels.com/photos/33904920/pexels-photo-33904920.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Pricing Background" fill style={{ objectFit: 'cover', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.35)', zIndex: 1 }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h2 className="section-title" style={{ color: 'white' }}>Pricing</h2>
          <div className={styles.billingToggle}>
            <button className={`${styles.toggleBtn} ${billingCycle === 'monthly' ? styles.toggleActive : ''}`} onClick={() => setBillingCycle('monthly')}>Monthly</button>
            <button className={`${styles.toggleBtn} ${billingCycle === 'yearly' ? styles.toggleActive : ''}`} onClick={() => setBillingCycle('yearly')}>Yearly <span className={styles.saveBadge}>Save 20%</span></button>
          </div>
          <div className={styles.pricingGrid}>
            <div className={styles.pricingCard}>
              <div className={styles.planHeader}><span className={styles.planName}>Monthly</span></div>
              <div className={styles.planPrice}>{billingCycle === 'monthly' ? '$9.99' : '$7.99'}<span className={styles.planPer}>/month</span></div>
              {!session && <Link href="/register" className="btn btn-dark" style={{ width: '100%' }}>Get Started</Link>}
            </div>
            <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
              <div className={styles.planHeader}><span className={styles.planName}>Yearly</span><span className={styles.planBadge}>Best Value</span></div>
              <div className={styles.planPrice}>{billingCycle === 'monthly' ? '$99.99' : '$95.88'}<span className={styles.planPer}>/year</span></div>
              {!session && <Link href="/register" className="btn btn-dark" style={{ width: '100%' }}>Get Started</Link>}
            </div>
          </div>
        </div>
      </section>

      {/* ========= FAQ ========= */}
      <section id="faq" className="section">
        <div className="container">
          <h2 className="section-title">FAQs</h2>
          <div className={styles.faqList}>
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className={styles.faqItem}>
                <button className={styles.faqQuestion} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{item.q}</span>
                  <span className={styles.faqIcon}>{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className={styles.faqAnswer}>{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
