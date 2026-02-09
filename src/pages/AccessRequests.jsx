import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle, XCircle, ArrowLeft, Mail, Linkedin } from 'lucide-react';
import { format } from 'date-fns';

export default function AccessRequests() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: requests, isLoading } = useQuery({
    queryKey: ['accessRequests'],
    queryFn: () => base44.entities.AccessRequest.list('-created_date'),
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, status }) => 
      base44.entities.AccessRequest.update(id, {
        status,
        reviewed_by: user?.email,
        reviewed_date: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['accessRequests']);
      queryClient.invalidateQueries(['pendingAccessRequests']);
    },
  });

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];
  const reviewedRequests = requests?.filter(r => r.status !== 'pending') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Access Requests</h1>
              <p className="text-gray-600 mt-1">Review and approve user access requests</p>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Pending Requests
                <Badge className="bg-red-100 text-red-700">{pendingRequests.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map(request => (
                  <div key={request.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{request.full_name || 'No name provided'}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Mail className="w-4 h-4" />
                          {request.email}
                        </div>
                        {request.linkedin_profile && (
                          <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
                            <Linkedin className="w-4 h-4" />
                            <a href={request.linkedin_profile} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {request.linkedin_profile}
                            </a>
                          </div>
                        )}
                        {request.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">{request.notes}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Requested: {format(new Date(request.created_date), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => updateRequestMutation.mutate({ id: request.id, status: 'approved' })}
                          disabled={updateRequestMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => updateRequestMutation.mutate({ id: request.id, status: 'rejected' })}
                          disabled={updateRequestMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviewed Requests */}
        {reviewedRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reviewed Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reviewedRequests.map(request => (
                  <div key={request.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{request.full_name || 'No name provided'}</h3>
                          <Badge className={request.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{request.email}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Reviewed by {request.reviewed_by} on {format(new Date(request.reviewed_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading requests...</p>
          </div>
        )}

        {!isLoading && requests?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">No access requests yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}