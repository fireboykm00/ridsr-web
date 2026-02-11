import { auth } from '@/lib/auth';
import { USER_ROLES, User, UserRole, CreateUserInput, UpdateUserInput } from '@/types';

class UserService {
  async getCurrentUser(): Promise<User | null> {
    const session = await auth();
    if (!session?.user) return null;

    return {
      id: session.user.id,
      workerId: session.user.workerId ,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      facilityId: session.user.facilityId,
      district: session.user.district,
      province: session.user.province,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === USER_ROLES.ADMIN;
  }

  async hasRole(role: UserRole): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === role;
  }

  async getUserById(id: string): Promise<User | null> {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) return null;
    return res.json();
  }

  async getAllUsers(): Promise<User[]> {
    const session = await auth();
    if (!session || session.user?.role !== USER_ROLES.ADMIN) {
      throw new Error('Only administrators can view all users');
    }

    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const session = await auth();
    if (!session || session.user?.role !== USER_ROLES.ADMIN) {
      throw new Error('Only administrators can view users by role');
    }

    const res = await fetch(`/api/users?role=${role}`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  }

  async getUsersByFacility(facilityId: string): Promise<User[]> {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');

    if (session.user?.role && ![USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER, USER_ROLES.DISTRICT_OFFICER].includes(session.user.role)) {
      throw new Error('Insufficient permissions');
    }

    const res = await fetch(`/api/users?facilityId=${facilityId}`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  }

  async getUsersByDistrict(district: string): Promise<User[]> {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');

    if (session.user?.role && ![USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER, USER_ROLES.DISTRICT_OFFICER].includes(session.user.role)) {
      throw new Error('Insufficient permissions');
    }

    if (session.user?.role === USER_ROLES.DISTRICT_OFFICER && session.user.district !== district) {
      throw new Error('Insufficient permissions to access users from this district');
    }

    const res = await fetch(`/api/users?district=${district}`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  }

  async createUser(userData: CreateUserInput): Promise<User> {
    const session = await auth();
    if (!session || session.user?.role !== USER_ROLES.ADMIN) {
      throw new Error('Only administrators can create users');
    }

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
  }

  async updateUser(id: string, userData: UpdateUserInput): Promise<User | null> {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');

    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!res.ok) return null;
    return res.json();
  }

  async deleteUser(id: string): Promise<boolean> {
    const session = await auth();
    if (!session || session.user?.role !== USER_ROLES.ADMIN) {
      throw new Error('Only administrators can delete users');
    }

    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    return res.ok;
  }
}

export const userService = new UserService();
