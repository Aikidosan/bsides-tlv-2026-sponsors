import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle, XCircle, ArrowLeft, Mail, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function PendingVerification() {
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allUsers, isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list('-created_date'),
  });

  const approveUserMutation = useMutation({
    mutationFn: async (userId) => {
      const user = allUsers?.find(u => u.id === userId);
      await base44.asServiceRole.entities.User.update(userId, {
        data: { 
          ...user?.data,
          linkedin_verified: true 
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      queryClient.invalidateQueries(['user']);
    },
  });

  const rejectUserMutation = useMutation({
    mutationFn: async (userId) => {
      await base44.asServiceRole.entities.User.delete(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      queryClient.invalidateQueries(['user']);
    },
  });

  if (currentUser?.role !== 'admin') {
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

  const pendingUsers = allUsers?.filter(u => !u.data?.linkedin_verified) || [];
  const verifiedUsers = allUsers?.filter(u => u.data?.linkedin_verified) || [];

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
              <h1 className="text-3xl font-bold text-gray-900">Pending LinkedIn Verification</h1>
              <p className="text-gray-600 mt-1">Approve or reject users awaiting LinkedIn verification</p>
            </div>
          </div>
        </div>

        {/* Pending Users */}
        {!isLoading && pendingUsers.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-3" />
              <p className="text-gray-600 font-medium">No pending verifications</p>
              <p className="text-sm text-gray-500 mt-1">All users have been verified</p>
            </CardContent>
          </Card>
        )}

        {pendingUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Pending Verification
                <Badge className="bg-red-100 text-red-700">{pendingUsers.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingUsers.map(user => (
                  <div key={user.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{user.full_name || 'No name provided'}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        {user.data?.linkedin_profile && (
                          <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
                            <UserIcon className="w-4 h-4" />
                            LinkedIn: {user.data.linkedin_profile}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Registered: {format(new Date(user.created_date), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => approveUserMutation.mutate(user.id)}
                          disabled={approveUserMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm(`Delete user ${user.email}? This cannot be undone.`)) {
                              rejectUserMutation.mutate(user.id);
                            }
                          }}
                          disabled={rejectUserMutation.isPending}
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

        {/* Verified Users */}
        {verifiedUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Verified Users ({verifiedUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verifiedUsers.map(user => (
                  <div key={user.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{user.full_name || 'No name provided'}</h3>
                          <Badge className="bg-green-100 text-green-700">Verified</Badge>
                          {user.role === 'admin' && (
                            <Badge className="bg-blue-100 text-blue-700">Admin</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                        {user.data?.linkedin_profile && (
                          <p className="text-xs text-gray-500 mt-1">LinkedIn: {user.data.linkedin_profile}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">Loading users...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}