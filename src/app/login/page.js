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

  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError('');

    const creds = role === 'admin'
      ? { email: 'admin@impactplay.com', password: 'password123', full_name: 'Admin Coordinator', sub_status: 'admin' }
      : { email: 'user@impactplay.com', password: 'password123', full_name: 'Demo Golfer', sub_status: 'active' };

    // 1. Attempt Sign In
    let { data, error: authError } = await supabase.auth.signInWithPassword({
      email: creds.email, password: creds.password
    });

    // 2. Ensure Profile exists with the CORRECT role (The Fix)
    if (!authError && data?.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: creds.full_name,
        subscription_status: creds.sub_status,
        charity_name: 'ImpactPlay Default Charity',
        contribution_percentage: 15
      });

      if (profileError) {
        console.error("Profile sync error:", profileError.message);
      }
    }

    // 3. Fallback Sign Up (if user doesn't exist)
    if (authError && authError.message.includes('Invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: creds.email, password: creds.password
      });

      if (!signUpError && signUpData?.user) {
        await supabase.from('profiles').insert([{
          id: signUpData.user.id,
          full_name: creds.full_name,
          subscription_status: creds.sub_status,
          charity_name: 'ImpactPlay Default Charity',
          contribution_percentage: 15
        }]);

        const retry = await supabase.auth.signInWithPassword({ email: creds.email, password: creds.password });
        data = retry.data; authError = retry.error;
      }
    }

    if (authError) {
      setError(authError.message + " (Please ensure 'Email Confirmations' are disabled in Supabase)");
      setLoading(false);
    } else {
      // 4. ROLE-BASED REDIRECTION (The Fix)
      // We fetch the profile one last time to be absolute
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', data.user.id)
        .single();

      if (profile?.subscription_status === 'admin') {
        window.location.href = '/admin'; // Force hard reload to reset UI state
      } else {
        window.location.href = '/dashboard';
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

          <div className={styles.authDivider}><span>Professional Demo Access</span></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <button onClick={() => handleDemoLogin('user')} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              Sign in as Player
            </button>
            <button onClick={() => handleDemoLogin('admin')} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              Sign in as Admin
            </button>
          </div>

          <p className={styles.authSwitch}>
            Don&apos;t have an account? <Link href="/register" className={styles.authLink}>Subscribe here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
