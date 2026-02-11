// src/app/(admin)/admin/users/page.tsx
import { auth } from '@/lib/auth';
import { ROLES } from '@/lib/utils/auth';
import { redirect } from 'next/navigation';
import Card from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

const AdminUsersPage = async () => {
  const session = await auth();
  
  if (!session || session.user?.role !== ROLES.ADMIN) {
    redirect('/login');
  }

  // Mock data for users - in a real app, this would come from the database
  const users = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@ridsr.rw',
      role: 'admin',
      facility: 'Ministry of Health',
      status: 'active',
      lastLogin: '2024-02-10',
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john.doe@ridsr.rw',
      role: 'health_worker',
      facility: 'Kigali Central Hospital',
      status: 'active',
      lastLogin: '2024-02-09',
    },
    {
      id: '3',
      name: 'Jane Smith',
      email: 'jane.smith@ridsr.rw',
      role: 'district_officer',
      facility: 'Northern Province Health Office',
      status: 'active',
      lastLogin: '2024-02-08',
    },
    {
      id: '4',
      name: 'Robert Johnson',
      email: 'robert.j@ridsr.rw',
      role: 'lab_technician',
      facility: 'National Reference Lab',
      status: 'inactive',
      lastLogin: '2024-01-15',
    },
  ];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'health_worker': return 'Health Worker';
      case 'district_officer': return 'District Officer';
      case 'lab_technician': return 'Lab Technician';
      case 'national_officer': return 'National Officer';
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'warning';
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage users and their roles in the RIDSR platform</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>User</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Facility</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Last Login</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.facility}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(user.status)}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button className="text-blue-700 hover:text-blue-900 text-sm font-medium">
                        Edit
                      </button>
                      <button className="text-red-700 hover:text-red-900 text-sm font-medium">
                        Disable
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="mt-8 flex justify-end">
        <button className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">
          Add New User
        </button>
      </div>
    </div>
  );
};

export default AdminUsersPage;