import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfWeek, parseISO } from 'date-fns';

export default function TimelineTrends({ companies, touches }) {
  // Group touches by week
  const weeklyActivity = touches?.reduce((acc, t) => {
    const weekStart = format(startOfWeek(parseISO(t.touch_date)), 'MMM d');
    const existing = acc.find(item => item.week === weekStart);
    if (existing) {
      existing.touches++;
      if (t.response_received) existing.responses++;
    } else {
      acc.push({
        week: weekStart,
        touches: 1,
        responses: t.response_received ? 1 : 0,
      });
    }
    return acc;
  }, []) || [];

  // Sort by date
  const sortedData = weeklyActivity.sort((a, b) => {
    return new Date(a.week) - new Date(b.week);
  });

  // Take last 8 weeks
  const chartData = sortedData.slice(-8);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="touches" stroke="#8b5cf6" strokeWidth={2} name="Outreach Touches" />
            <Line type="monotone" dataKey="responses" stroke="#10b981" strokeWidth={2} name="Responses" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}