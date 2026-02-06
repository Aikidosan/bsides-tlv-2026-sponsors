import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function OutreachEffectiveness({ touches }) {
  const effectivenessData = touches?.reduce((acc, t) => {
    const existing = acc.find(item => item.type === t.touch_type);
    if (existing) {
      existing.total++;
      if (t.response_received) existing.responses++;
    } else {
      acc.push({
        type: t.touch_type,
        total: 1,
        responses: t.response_received ? 1 : 0,
      });
    }
    return acc;
  }, []) || [];

  const chartData = effectivenessData.map(item => ({
    type: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    'Response Rate': ((item.responses / item.total) * 100).toFixed(1),
    'Total Touches': item.total,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Outreach Effectiveness</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Response Rate" fill="#8b5cf6" />
            <Bar dataKey="Total Touches" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}