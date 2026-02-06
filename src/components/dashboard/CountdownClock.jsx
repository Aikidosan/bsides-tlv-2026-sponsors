import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export default function CountdownClock() {
  const EVENT_DATE = new Date('2026-06-01T09:00:00');
  const [timeLeft, setTimeLeft] = useState({});
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('countdownClockExpanded');
    return saved === null ? true : saved === 'true';
  });

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



  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('countdownClockExpanded', String(newState));
  };

  if (!isExpanded) {
    return (
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white overflow-hidden cursor-pointer hover:shadow-lg transition-all">
        <div className="px-4 py-2 flex items-center justify-between" onClick={toggleExpanded}>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-semibold">BSides TLV 2026</span>
            <span className="text-sm opacity-90">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white overflow-hidden">
      <div className="p-8 text-center relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleExpanded}
            className="text-white hover:bg-white/20"
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
        </div>
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
            <Calendar className="w-4 h-4" />
            <p className="text-sm">June 2026 • Tel Aviv</p>
          </div>
        </div>
      </div>
    </Card>
  );
}