import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ConversionFunnel({ companies }) {
  const statusCounts = companies?.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {}) || {};

  const funnelData = [
    { stage: 'Research', count: statusCounts.research || 0, color: '#94a3b8' },
    { stage: 'Contacted', count: statusCounts.contacted || 0, color: '#60a5fa' },
    { stage: 'Responded', count: statusCounts.responded || 0, color: '#a78bfa' },
    { stage: 'Negotiating', count: statusCounts.negotiating || 0, color: '#fbbf24' },
    { stage: 'Committed', count: statusCounts.committed || 0, color: '#34d399' },
    { stage: 'Closed', count: statusCounts.closed || 0, color: '#10b981' },
  ].filter(item => item.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="stage" width={100} />
            <Tooltip />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}