import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function SponsorshipTiers({ companies }) {
  const tierCounts = companies?.filter(c => c.sponsorship_tier).reduce((acc, c) => {
    acc[c.sponsorship_tier] = (acc[c.sponsorship_tier] || 0) + 1;
    return acc;
  }, {}) || {};

  const tierColors = {
    platinum: '#9333ea',
    gold: '#eab308',
    silver: '#94a3b8',
    bronze: '#ea580c',
    supporter: '#3b82f6',
  };

  const chartData = Object.entries(tierCounts).map(([tier, count]) => ({
    name: tier.charAt(0).toUpperCase() + tier.slice(1),
    value: count,
    color: tierColors[tier],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sponsorship Tiers</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}