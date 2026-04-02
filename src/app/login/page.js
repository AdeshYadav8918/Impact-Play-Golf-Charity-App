"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import styles from './page.module.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      // PRD Section 03: Smart Redirect based on role
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', data.user.id)
        .single();
      
      if (profile?.subscription_status === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  };



  return (
    <div className={styles.authSplit}>
      {/* Left: Branding & Visual */}
      <div className={styles.visualSide}>
        <div className={styles.visualOverlay} />
        <div className={styles.visualContent}>
          <Link href="/" className={styles.logo}>
            Impact<span className={styles.logoAccent}>Play</span>
          </Link>
          <p className={styles.visualTagline}>Where every score powers a better world.</p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className={styles.formSide}>
        <div className={styles.authCard}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <Link href="/" className={styles.authLink} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
              ← Back to Home
            </Link>
          </div>
          <h1 className={styles.authTitle}>Sign in to ImpactPlay</h1>
          <p className={styles.authSubtitle}>Access your player dashboard and track your contributions.</p>

          <form className={styles.authForm} onSubmit={handleLogin}>
            {error && <div style={{ color: 'red', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-dark" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>


          <p className={styles.authSwitch}>
            Don&apos;t have an account? <Link href="/register" className={styles.authLink}>Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
