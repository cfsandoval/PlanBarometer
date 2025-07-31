import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ArrowLeft, 
  Crown, 
  Shield, 
  User as UserIcon,
  Grid3X3,
  Eye,
  Calendar
} from 'lucide-react';
import { Link } from 'wouter';
import { format } from 'date-fns';

interface HeatmapData {
  groups: Array<{
    id: number;
    name: string;
    code: string;
    memberCount: number;
    coordinatorName: string;
  }>;
  users: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    groupMemberships: Array<{
      groupId: number;
      joinedAt: string;
      isCoordinator: boolean;
    }>;
  }>;
  matrix: Array<Array<{
    isMember: boolean;
    isCoordinator: boolean;
    joinedAt?: string;
  }>>;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return <Crown className="h-3 w-3 text-yellow-500" />;
    case 'coordinator':
      return <Shield className="h-3 w-3 text-blue-500" />;
    default:
      return <UserIcon className="h-3 w-3 text-gray-500" />;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'coordinator':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getMembershipColor = (cell: { isMember: boolean; isCoordinator: boolean }) => {
  if (!cell.isMember) return 'bg-gray-50 border-gray-200';
  if (cell.isCoordinator) return 'bg-blue-500 border-blue-600';
  return 'bg-green-500 border-green-600';
};

const getMembershipLabel = (cell: { isMember: boolean; isCoordinator: boolean }) => {
  if (!cell.isMember) return 'No member';
  if (cell.isCoordinator) return 'Coordinator';
  return 'Member';
};

export default function MembershipHeatmap() {
  const { user } = useAuth();

  const { data: heatmapData, isLoading } = useQuery({
    queryKey: ['/api/delphi/membership-heatmap'],
  }) as { data: HeatmapData | undefined; isLoading: boolean };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!heatmapData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Data Available
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No groups or members found to display the heatmap.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/delphi">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <Grid3X3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Group Membership Heatmap
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Visual overview of user memberships across groups
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                {heatmapData.groups.length} Groups
              </Badge>
              <Badge variant="outline" className="text-sm">
                {heatmapData.users.length} Users
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                Legend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Not a member</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 border border-green-600 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Group member</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Group coordinator</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">System admin</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Heatmap Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Membership Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  {/* Header with group names */}
                  <div className="flex mb-2">
                    <div className="w-48 flex-shrink-0"></div>
                    {heatmapData.groups.map((group) => (
                      <div 
                        key={group.id} 
                        className="w-20 flex-shrink-0 text-center px-1"
                      >
                        <div className="transform -rotate-45 origin-center">
                          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                            {group.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {group.code}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Matrix rows */}
                  {heatmapData.users.map((user, userIndex) => (
                    <div key={user.id} className="flex items-center mb-1">
                      {/* User info */}
                      <div className="w-48 flex-shrink-0 pr-4">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRoleColor(user.role)}`}
                          >
                            {user.role}
                          </Badge>
                        </div>
                      </div>

                      {/* Membership cells */}
                      {heatmapData.matrix[userIndex].map((cell, groupIndex) => (
                        <div 
                          key={groupIndex}
                          className="w-20 flex-shrink-0 px-1"
                        >
                          <div 
                            className={`
                              w-full h-8 rounded border-2 flex items-center justify-center
                              ${getMembershipColor(cell)}
                              transition-all duration-200 hover:scale-105
                              cursor-pointer
                            `}
                            title={`
                              ${user.name} - ${heatmapData.groups[groupIndex].name}
                              Status: ${getMembershipLabel(cell)}
                              ${cell.joinedAt ? `Joined: ${format(new Date(cell.joinedAt), 'MMM dd, yyyy')}` : ''}
                            `}
                          >
                            {cell.isMember && (
                              <div className="text-white">
                                {cell.isCoordinator ? (
                                  <Shield className="h-3 w-3" />
                                ) : (
                                  <Users className="h-3 w-3" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {heatmapData.users.length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Total Users
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Grid3X3 className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {heatmapData.groups.length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Active Groups
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {heatmapData.users.filter(u => u.role === 'coordinator').length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Coordinators
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {heatmapData.matrix.flat().filter(cell => cell.isMember).length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Total Memberships
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Group Details */}
          <Card>
            <CardHeader>
              <CardTitle>Group Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {heatmapData.groups.map((group) => (
                  <div key={group.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {group.name}
                      </h3>
                      <Badge variant="secondary">{group.code}</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Members:</span>
                        <span className="font-medium">{group.memberCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coordinator:</span>
                        <span className="font-medium">{group.coordinatorName}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link href={`/delphi/groups/${group.id}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}