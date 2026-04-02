"use client";
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export default function SessionTimeout() {
  const router = useRouter();
  const timeoutId = useRef(null);

  const resetTimer = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    
    // Only run the timeout if the user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        timeoutId.current = setTimeout(async () => {
          // 1. Audit Log: Log the timeout event to DB
          await supabase.from('audit_logs').insert([{
            user_id: session.user.id,
            action: 'auto_logout',
            details: 'Session expired due to 10 minutes of inactivity'
          }]);

          // 2. Log them out securely
          await supabase.auth.signOut();

          // 3. Inform user and redirect
          alert("Your session has expired due to 10 minutes of inactivity. Don't worry, your typed data was saved locally on this browser!");
          router.push('/login');
        }, TIMEOUT_MS);
      }
    });
  };

  useEffect(() => {
    // Initial start
    resetTimer();

    // Listeners for user activity
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, []);

  return null; // Invisible global wrapper component
}
