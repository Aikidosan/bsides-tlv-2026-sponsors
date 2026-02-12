import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Shield, User, Mail, ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminUsers() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date'),
  });

  const { data: accessRequests } = useQuery({
    queryKey: ['access-requests'],
    queryFn: () => base44.entities.AccessRequest.filter({ status: 'pending' }, '-created_date'),
  });

  useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      return user;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }) => {
      await base44.users.inviteUser(email, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setEmail('');
      setRole('user');
      alert('Invitation sent successfully!');
    },
    onError: (error) => {
      alert('Failed to send invitation: ' + error.message);
    },
  });

  const handleInvite = (e) => {
    e.preventDefault();
    if (!email) return;
    inviteMutation.mutate({ email, role });
  };

  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">Only administrators can access this page.</p>
            <Link to={createPageUrl('Dashboard')}>
              <Button>Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-600">Invite team members to the platform</p>
          </div>
        </div>

        {/* Invite Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Invite New User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                type="submit" 
                disabled={inviteMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        {accessRequests && accessRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Pending Invitations ({accessRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accessRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-100">
                        <Mail className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{request.full_name || 'No name provided'}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {request.email}
                        </p>
                        {request.linkedin_profile && (
                          <p className="text-xs text-gray-500 mt-1">
                            LinkedIn: {request.linkedin_profile}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                        Pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({users?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-500">Loading users...</p>
            ) : users && users.length > 0 ? (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        {user.role === 'admin' ? (
                          <Shield className="w-4 h-4 text-purple-600" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        {user.data?.linkedin_url ? (
                          <a 
                            href={user.data.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:text-blue-600 hover:underline cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {user.full_name || 'No name'}
                          </a>
                        ) : (
                          <p className="font-medium">{user.full_name || 'No name'}</p>
                        )}
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No users yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}