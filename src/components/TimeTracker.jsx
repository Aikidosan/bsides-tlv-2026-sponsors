import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function TimeTracker({ user, currentPageName }) {
  const location = useLocation();
  const sessionRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const startSession = async () => {
      startTimeRef.current = new Date().toISOString();
      
      try {
        const session = await base44.entities.TimeTracking.create({
          user_email: user.email,
          user_name: user.full_name || user.email,
          page_name: currentPageName,
          session_start: startTimeRef.current
        });
        sessionRef.current = session.id;
      } catch (error) {
        console.error('Failed to start tracking session:', error);
      }
    };

    const endSession = async () => {
      if (!sessionRef.current || !startTimeRef.current) return;

      const endTime = new Date().toISOString();
      const duration = Math.round(
        (new Date(endTime) - new Date(startTimeRef.current)) / 1000
      );

      try {
        await base44.entities.TimeTracking.update(sessionRef.current, {
          session_end: endTime,
          duration_seconds: duration
        });
      } catch (error) {
        console.error('Failed to end tracking session:', error);
      }

      sessionRef.current = null;
      startTimeRef.current = null;
    };

    startSession();

    return () => {
      endSession();
    };
  }, [currentPageName, user, location.pathname]);

  // Track page visibility changes (user switching tabs)
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // User switched away - end current session
        if (sessionRef.current && startTimeRef.current) {
          const endTime = new Date().toISOString();
          const duration = Math.round(
            (new Date(endTime) - new Date(startTimeRef.current)) / 1000
          );

          try {
            await base44.entities.TimeTracking.update(sessionRef.current, {
              session_end: endTime,
              duration_seconds: duration
            });
          } catch (error) {
            console.error('Failed to update tracking on visibility change:', error);
          }
        }
      } else {
        // User came back - start new session
        startTimeRef.current = new Date().toISOString();
        try {
          const session = await base44.entities.TimeTracking.create({
            user_email: user.email,
            user_name: user.full_name || user.email,
            page_name: currentPageName,
            session_start: startTimeRef.current
          });
          sessionRef.current = session.id;
        } catch (error) {
          console.error('Failed to restart tracking on visibility change:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentPageName, user]);

  return null;
}