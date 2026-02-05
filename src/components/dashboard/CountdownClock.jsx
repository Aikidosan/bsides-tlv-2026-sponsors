import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

export default function CountdownClock() {
  const EVENT_DATE = new Date('2026-06-01T09:00:00');
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = EVENT_DATE - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white overflow-hidden">
      <div className="p-8 text-center relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="w-6 h-6" />
            <h2 className="text-xl font-bold">BSides TLV 2026 Countdown</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-6">
              <div className="text-4xl md:text-6xl font-bold mb-2">
                {String(timeLeft.days || 0).padStart(2, '0')}
              </div>
              <div className="text-sm md:text-base uppercase tracking-wider opacity-90">Days</div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-6">
              <div className="text-4xl md:text-6xl font-bold mb-2">
                {String(timeLeft.hours || 0).padStart(2, '0')}
              </div>
              <div className="text-sm md:text-base uppercase tracking-wider opacity-90">Hours</div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-6">
              <div className="text-4xl md:text-6xl font-bold mb-2">
                {String(timeLeft.minutes || 0).padStart(2, '0')}
              </div>
              <div className="text-sm md:text-base uppercase tracking-wider opacity-90">Minutes</div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-6">
              <div className="text-4xl md:text-6xl font-bold mb-2">
                {String(timeLeft.seconds || 0).padStart(2, '0')}
              </div>
              <div className="text-sm md:text-base uppercase tracking-wider opacity-90">Seconds</div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-white/90">
            <Clock className="w-4 h-4" />
            <p className="text-sm">June 2026 • Tel Aviv</p>
          </div>
        </div>
      </div>
    </Card>
  );
}