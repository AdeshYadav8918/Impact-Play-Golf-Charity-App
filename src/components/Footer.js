import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div 
        className={styles.ctaBanner}
        style={{ 
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#2c3e2d',
          minHeight: '300px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Image
          src="/img3.jpg"
          alt="Golf Course Panorama"
          fill
          style={{ objectFit: 'cover', zIndex: 0, objectPosition: 'center 40%' }}
        />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.3)', zIndex: 1 }} />
        
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2, width: '100%' }}>
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>Ready to Make an Impact?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Subscribe today. Track your scores. Win rewards. Fund what matters.
          </p>
          <Link href="/register" className={styles.ctaBtn}>
            Start playing with purpose →
          </Link>
        </div>
      </div>

      <div className={`container ${styles.footerContent}`}>
        <div className={styles.footerGrid}>
          <div>
            <div className={styles.footerLogo}>Impact<span style={{ color: 'var(--accent-green)' }}>Play</span></div>
            <p className={styles.footerDesc}>Where golf performance meets charitable giving. A platform that turns every swing into an opportunity to give back.</p>
          </div>
          <div>
            <h4 className={styles.footerHeading}>Platform</h4>
            <Link href="/" className={styles.footerLink}>Home</Link>
            <Link href="/#how-it-works" className={styles.footerLink}>How it Works</Link>
            <Link href="/charities" className={styles.footerLink}>Charities</Link>
            <Link href="/draws" className={styles.footerLink}>Monthly Draws</Link>
            <Link href="/#pricing" className={styles.footerLink}>Pricing</Link>
            <Link href="/contact" className={styles.footerLink}>Contact Us</Link>
          </div>
          <div>
            <h4 className={styles.footerHeading}>Account</h4>
            <Link href="/register" className={styles.footerLink}>Create Account</Link>
            <Link href="/login" className={styles.footerLink}>Sign In</Link>
            <Link href="/dashboard" className={styles.footerLink}>Dashboard</Link>
          </div>
          <div>
            <h4 className={styles.footerHeading}>Legal</h4>
            <span className={styles.footerLink}>Privacy Policy</span>
            <span className={styles.footerLink}>Terms of Service</span>
            <span className={styles.footerLink}>Cookie Policy</span>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 ImpactPlay. All rights reserved.</span>
          <span>Built with ❤️ for charity</span>
        </div>
      </div>
    </footer>
  );
}
