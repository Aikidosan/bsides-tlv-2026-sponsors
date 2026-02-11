import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, Users } from 'lucide-react';

export default function TeamCalendlyLinks() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const usersWithCalendly = users?.filter(u => u.calendly_url) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Team Calendly Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (usersWithCalendly.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Team Calendly Links
          </CardTitle>
          <CardDescription>
            No team members have set up Calendly links yet
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Team Calendly Links
        </CardTitle>
        <CardDescription>
          Schedule meetings with team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {usersWithCalendly.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {user.full_name || user.email}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <a
                href={user.calendly_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="gap-1">
                  <Calendar className="w-3 h-3" />
                  Book
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}