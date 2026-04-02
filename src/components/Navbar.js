"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";
import { useState, useEffect } from "react";
import { supabase } from '@/utils/supabase';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // 1. Get initial session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    };
    checkUser();

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          Impact<span className={styles.logoAccent}>Play</span>
        </Link>
        <div className={styles.links}>
          <Link href="/" className={styles.link}>Home</Link>
          <Link href="/#how-it-works" className={styles.link}>How it Works</Link>
          <Link href="/charities" className={styles.link}>Charities</Link>
          <Link href="/draws" className={styles.link}>Monthly Draws</Link>
          <Link href="/#pricing" className={styles.link}>Pricing</Link>
          <Link href="/contact" className={styles.link}>Contact</Link>
        </div>
        <div className={styles.actions}>
          {user && pathname !== '/login' && pathname !== '/register' ? (
            <>
              {profile?.subscription_status === 'admin' ? (
                <Link href="/admin" className="btn btn-outline" style={{ border: '1.5px solid var(--accent-gold)', color: 'var(--accent-gold)' }}>Admin Console</Link>
              ) : (
                <Link href="/dashboard" className="btn btn-green">Dashboard</Link>
              )}
              <button onClick={handleLogout} className="btn btn-dark">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-dark">Sign In</Link>
              <Link href="/register" className="btn btn-dark">Create Account</Link>
            </>
          )}
        </div>
        <button className={styles.mobileToggle} onClick={() => setMobileOpen(true)} aria-label="Open Menu">
          ☰
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ''}`}>
        <div className={styles.mobileMenuHeader}>
          <span className={styles.logo}>Impact<span className={styles.logoAccent}>Play</span></span>
          <button className={styles.mobileClose} onClick={() => setMobileOpen(false)}>✕</button>
        </div>
        <div className={styles.mobileLinks}>
          <Link href="/" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href="/#how-it-works" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>How it Works</Link>
          <Link href="/charities" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Charities</Link>
          <Link href="/draws" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Monthly Draws</Link>
          <Link href="/#pricing" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Pricing</Link>
          <Link href="/contact" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Contact</Link>
          <hr style={{border: 'none', borderTop: '1px solid #e2e8f0', margin: '1rem 0'}} />
          <Link href="/login" className="btn btn-dark" style={{justifyContent:'center'}} onClick={() => setMobileOpen(false)}>Sign In</Link>
          <Link href="/register" className="btn btn-dark" style={{justifyContent:'center'}} onClick={() => setMobileOpen(false)}>Create Account</Link>
        </div>
      </div>
    </>
  );
}
