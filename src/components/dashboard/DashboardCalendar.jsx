import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';

export default function DashboardCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list(),
  });

  const { data: outreachTouches } = useQuery({
    queryKey: ['outreachTouches'],
    queryFn: () => base44.entities.OutreachTouch.list(),
  });

  // Get all events for the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const events = [];

    // Task deadlines
    tasks?.forEach(task => {
      if (task.deadline && isSameDay(new Date(task.deadline), date)) {
        events.push({
          type: 'task',
          title: task.title,
          status: task.status,
          priority: task.priority
        });
      }
    });

    // Outreach touches
    outreachTouches?.forEach(touch => {
      if (touch.touch_date && isSameDay(new Date(touch.touch_date), date)) {
        events.push({
          type: 'outreach',
          title: `${touch.touch_type} - ${touch.contact_name || 'Contact'}`,
          touchType: touch.touch_type
        });
      }
      if (touch.next_touch_date && isSameDay(new Date(touch.next_touch_date), date)) {
        events.push({
          type: 'next_touch',
          title: `Scheduled: ${touch.next_touch_type}`,
          touchType: touch.next_touch_type
        });
      }
    });

    return events;
  };

  // Get starting day of week (0 = Sunday)
  const startDay = monthStart.getDay();
  const emptyDays = Array(startDay).fill(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            Team Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-semibold text-sm min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}

          {/* Empty days before month starts */}
          {emptyDays.map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square p-1"></div>
          ))}

          {/* Days of the month */}
          {daysInMonth.map(date => {
            const events = getEventsForDate(date);
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isTodayDate = isToday(date);

            return (
              <div
                key={date.toISOString()}
                className={`aspect-square p-1 border border-gray-200 rounded-lg ${
                  !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                } ${isTodayDate ? 'ring-2 ring-indigo-500' : ''}`}
              >
                <div className="h-full flex flex-col">
                  <div className={`text-xs font-medium text-center mb-1 ${
                    isTodayDate ? 'text-indigo-600 font-bold' : 'text-gray-700'
                  }`}>
                    {format(date, 'd')}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {events.slice(0, 2).map((event, idx) => (
                      <div
                        key={idx}
                        className={`text-[10px] px-1 py-0.5 rounded mb-0.5 truncate ${
                          event.type === 'task' 
                            ? event.priority === 'high' || event.priority === 'urgent'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                            : event.type === 'outreach'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-purple-100 text-purple-700'
                        }`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-[10px] text-gray-500 text-center">
                        +{events.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span className="text-gray-600">Tasks</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 rounded"></div>
            <span className="text-gray-600">High Priority</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span className="text-gray-600">Outreach</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-100 rounded"></div>
            <span className="text-gray-600">Scheduled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}