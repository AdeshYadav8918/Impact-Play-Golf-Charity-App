"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabase';
import styles from '../login/page.module.css';
import regStyles from './page.module.css';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [charityPercent, setCharityPercent] = useState(10);
  const [existingUser, setExistingUser] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setExistingUser(true);
        setStep(2);
      }
    };
    checkUser();
  }, []);
  
  // Registration form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCharity, setSelectedCharity] = useState('Green Earth Initiative');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFreeAccount = async () => {
    if (!email || !password || !fullName) {
      setError("Please fill in all account details.");
      return;
    }
    setLoading(true);
    setError('');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData?.user) {
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: authData.user.id,
        full_name: fullName,
        charity_name: selectedCharity,
        contribution_percentage: charityPercent,
        subscription_status: 'inactive'
      }]);

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }

    router.push('/dashboard');
  };

  const handleProceedToCheckout = () => {
    setError('');

    if (!email || !password || !fullName) {
      setError("Please fill in all account details in Step 1.");
      setStep(1);
      return;
    }

    // Save pending registration data to session storage
    const pendingData = {
      fullName,
      email,
      password,
      selectedCharity,
      charityPercent
    };
    
    sessionStorage.setItem('pendingRegistration', JSON.stringify(pendingData));
    
    // Redirect to the professional checkout interface
    router.push('/checkout');
  };

  return (
    <div className={styles.authSplit}>
      {/* Left: Branding & Visual */}
      <div className={styles.visualSide} style={{ backgroundImage: "url('/img1.jpg')" }}>
        <div className={styles.visualOverlay} />
        <div className={styles.visualContent}>
          <Link href="/" className={styles.logo}>
            Impact<span className={styles.logoAccent}>Play</span>
          </Link>
          <p className={styles.visualTagline}>Join the community. Change the game.</p>
        </div>
      </div>

      {/* Right: Registration Form */}
      <div className={styles.formSide}>
        <div className={styles.authCard} style={{ maxWidth: '540px' }}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <Link href="/" className={styles.authLink} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
              ← Back to Home
            </Link>
          </div>
          
          {/* Progress Steps */}
          <div className={regStyles.progress}>
            <div className={`${regStyles.progressStep} ${step >= 1 ? regStyles.progressActive : ''}`}>
              <div className={regStyles.progressDot}>1</div>
              <span>{existingUser ? 'Account details valid' : 'Account'}</span>
            </div>
            <div className={regStyles.progressLine} />
            <div className={`${regStyles.progressStep} ${step >= 2 ? regStyles.progressActive : ''}`}>
              <div className={regStyles.progressDot}>2</div>
              <span>Charity</span>
            </div>
            <div className={regStyles.progressLine} />
            <div className={`${regStyles.progressStep} ${step >= 3 ? regStyles.progressActive : ''}`}>
              <div className={regStyles.progressDot}>3</div>
              <span>Payment</span>
            </div>
          </div>

          {error && (
            <div className="animate-in" style={{ 
              background: error.includes('Success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
              color: error.includes('Success') ? '#059669' : '#dc2626', 
              padding: '1rem', 
              borderRadius: 'var(--radius-md)', 
              fontSize: '0.9rem', 
              marginBottom: '1.5rem',
              border: error.includes('Success') ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
              textAlign: 'center',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="animate-in">
              <h1 className={styles.authTitle}>Get Started</h1>
              <p className={styles.authSubtitle}>Create your player profile to enter monthly draws and support global causes.</p>
              <form className={styles.authForm} onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <div className={styles.field}>
                  <label className={styles.label}>Full Name</label>
                  <input type="text" placeholder="Alex Johnson" className="input" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email Address</label>
                  <input type="email" placeholder="you@example.com" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Password</label>
                  <input type="password" placeholder="Min 6 characters" className="input" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-dark" style={{ width: '100%', justifyContent: 'center' }}>
                    Continue to Subscription →
                  </button>
                  <button type="button" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={handleFreeAccount} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Free Account (Skip Subscription)'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in">
              <h1 className={styles.authTitle}>Support a Cause</h1>
              <p className={styles.authSubtitle}>Direct a portion of your subscription to a charity you care about.</p>
              <form className={styles.authForm} onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                <div className={styles.field}>
                  <label className={styles.label}>Select Charity Partner</label>
                  <select className="select" value={selectedCharity} onChange={e => setSelectedCharity(e.target.value)}>
                    <option value="Green Earth Initiative">Green Earth Initiative</option>
                    <option value="Youth Tech Fund">Youth Tech Fund</option>
                    <option value="Clean Water Access">Clean Water Access</option>
                    <option value="Golf4Good Foundation">Golf4Good Foundation</option>
                    <option value="Mental Health First">Mental Health First</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Contribution: <strong>{charityPercent}%</strong> of subscription
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={charityPercent}
                    onChange={(e) => setCharityPercent(e.target.value)}
                    className={regStyles.slider}
                  />
                  <div className={regStyles.sliderLabels}>
                    <span>10% min</span>
                    <span>100% max</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  {!existingUser && (
                    <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>← Back</button>
                  )}
                  <button type="submit" className="btn btn-dark" style={{ flex: 2, justifyContent: 'center' }}>Continue to Payment →</button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in">
              <h1 className={styles.authTitle}>Subscription</h1>
              <p className={styles.authSubtitle}>Review your player plan and finalize your impact.</p>

              <div className={regStyles.reviewBox}>
                <div className={regStyles.reviewRow}>
                  <span>Plan</span><strong>Monthly — $9.99/mo</strong>
                </div>
                <div className={regStyles.reviewRow}>
                  <span>Charity</span><strong>{selectedCharity}</strong>
                </div>
                <div className={regStyles.reviewRow}>
                  <span>Contribution</span><strong>{charityPercent}%</strong>
                </div>
              </div>

              <div className={regStyles.stripeBox}>
                <div className={regStyles.stripeLogo}>💳 Secure Checkout via Stripe</div>
                <small style={{ color: 'var(--text-muted)' }}>Safe, encrypted payment processing.</small>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(2)}>← Back</button>
                <button type="button" className="btn btn-green" style={{ flex: 2, justifyContent: 'center' }} onClick={handleProceedToCheckout}>
                  Proceed to Secure Checkout →
                </button>
              </div>
            </div>
          )}

          <p className={styles.authSwitch} style={{ marginTop: '2rem' }}>
            Already have an account? <Link href="/login" className={styles.authLink}>Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}