"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabase';
import styles from './page.module.css';

export default function Checkout() {
  const router = useRouter();
  const [regData, setRegData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Retrieve data from registration step
    const data = sessionStorage.getItem('pendingRegistration');
    if (!data) {
      router.push('/register');
      return;
    }
    setRegData(JSON.parse(data));
  }, [router]);

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // Simulate Stripe processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Attempt the actual registration now
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regData.email,
        password: regData.password,
      });

      if (authError) throw authError;

      // Create profile
      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: regData.fullName,
              charity_name: regData.selectedCharity,
              contribution_percentage: parseInt(regData.charityPercent, 10),
              subscription_status: 'active'
            }
          ]);
        
        if (profileError) throw profileError;
      }

      // Success logic
      sessionStorage.removeItem('pendingRegistration');
      
      if (!authData.session) {
        router.push('/login?msg=verify');
      } else {
        router.push('/?status=success');
      }

    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  if (!regData) return null;

  return (
    <div className={styles.checkoutPage}>
      {/* Left: Summary Section */}
      <section className={styles.summarySide}>
        <div className={styles.summaryContent}>
          <Link href="/register" className={styles.backLink}>
            ← Back to ImpactPlay
          </Link>
          <div className={styles.product}>
            <span className={styles.productSub}>Subscribe to</span>
            <h1 className={styles.productName}>ImpactPlay Professional</h1>
            <div className={styles.amount}>$9.99 / month</div>
          </div>

          <div className={styles.charityMeta}>
            <h4>Supporting Charity</h4>
            <p>{regData.selectedCharity}</p>
          </div>

          <div style={{ marginTop: '2.5rem', borderTop: '1px solid #e6e9ef', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#697386', marginBottom: '0.75rem' }}>
              <span>Subtotal</span>
              <span>$9.99</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#111827', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total due today</span>
              <span>$9.99</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right: Payment Interface */}
      <section className={styles.paymentSide}>
        {processing ? (
          <div className={styles.processingBox}>
            <div className={styles.spinner}></div>
            <h2>Processing Payment...</h2>
            <p style={{ color: '#697386', marginTop: '0.5rem' }}>Securing your impact.</p>
          </div>
        ) : (
          <div className={styles.paymentForm}>
            <div className={styles.stripeHeader}>
              <h2>Pay with Secure Checkout</h2>
            </div>

            {error && <div className={styles.error}><strong>Payment Issue:</strong> {error}</div>}

            <form onSubmit={handlePay}>
              {/* Card Information */}
              <div className={styles.section}>
                <label className={styles.label}>Card information</label>
                <div className={styles.cardContainer}>
                  <div className={styles.cardRow}>
                    <input type="text" className={styles.cardField} placeholder="1234 5678 1234 5678" required />
                  </div>
                  <div className={styles.cardRow}>
                    <input type="text" className={styles.cardField} placeholder="MM / YY" required maxLength={7} />
                    <input type="text" className={`${styles.cardField} ${styles.cvcField}`} placeholder="CVC" required maxLength={4} />
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className={styles.section}>
                <label className={styles.label}>Country or region</label>
                <select className={styles.cardContainer} style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e6e9ef', fontSize: '1rem' }}>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>India</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
              </div>

              <button type="submit" className={styles.payButton}>
                Pay & Subscribe ✓
              </button>
            </form>

            <div className={styles.security}>
              <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor"><path d="M11.5 6H13a1 1 0 011 1v7a1 1 0 01-1 1H1a1 1 0 01-1-1V7a1 1 0 011-1h1.5V4.5a4.5 4.5 0 019 0V6zM10 6V4.5a3 3 0 10-6 0V6h6zM7 11a1 1 0 100-2 1 1 0 000 2z"/></svg>
              Powered by <strong>Stripe</strong>
            </div>
            
            <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: '#a3acb9' }}>
              By confirming your subscription, you allow ImpactPlay to charge your card for this and future payments in accordance with their terms.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
