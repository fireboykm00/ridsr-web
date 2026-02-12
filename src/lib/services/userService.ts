import { USER_ROLES, User, UserRole, CreateUserInput, UpdateUserInput, ExtendedSession } from '@/types';

type UserRecord = Partial<User> & { _id?: string; id?: string };

function mapUser(record: UserRecord): User {
  return {
    ...record,
    id: record._id || record.id || '',
  } as User;
}

class UserService {
  // Removed getCurrentUser as it depended on server-only auth()
  // The caller should provide the user from useSession (client) or auth() (server)

  isAdmin(user?: User | ExtendedSession['user']): boolean {
    return user?.role === USER_ROLES.ADMIN;
  }

  hasRole(user: User | ExtendedSession['user'] | undefined, role: UserRole): boolean {
    return user?.role === role;
  }

  async getUserById(id: string): Promise<User | null> {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) return null;
    const responseData = await res.json();
    const user = responseData.data || responseData;
    return user ? { ...user, id: user._id || user.id } : null;
  }

  async getAllUsers(): Promise<User[]> {
    const res = await fetch('/api/users');
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch users');
    }
    const responseData = await res.json();
    const users = responseData.data || responseData;
    return Array.isArray(users) ? users.map((u) => mapUser(u as UserRecord)) : [];
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const res = await fetch(`/api/users?role=${role}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch users');
    }
    const responseData = await res.json();
    const users = responseData.data || responseData;
    return Array.isArray(users) ? users.map((u) => mapUser(u as UserRecord)) : [];
  }

  async getUsersByFacility(facilityId: string): Promise<User[]> {
    const res = await fetch(`/api/users?facilityId=${facilityId}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch users');
    }
    const responseData = await res.json();
    const users = responseData.data || responseData;
    return Array.isArray(users) ? users.map((u) => mapUser(u as UserRecord)) : [];
  }

  async getUsersByDistrict(district: string): Promise<User[]> {
    const res = await fetch(`/api/users?district=${district}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch users');
    }
    const responseData = await res.json();
    const users = responseData.data || responseData;
    return Array.isArray(users) ? users.map((u) => mapUser(u as UserRecord)) : [];
  }

  async searchUsers(query: string): Promise<User[]> {
    const res = await fetch(`/api/users?search=${encodeURIComponent(query)}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to search users');
    }
    const responseData = await res.json();
    const users = responseData.data || responseData;
    return Array.isArray(users) ? users.map((u) => mapUser(u as UserRecord)) : [];
  }

  async createUser(userData: CreateUserInput): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create user');
    }

    const responseData = await res.json();
    const user = responseData.data || responseData;
    return { ...user, id: user._id || user.id };
  }

  async updateUser(id: string, userData: UpdateUserInput): Promise<User | null> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update user');
    }

    const responseData = await res.json();
    const user = responseData.data || responseData;
    return user ? { ...user, id: user._id || user.id } : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to delete user');
    }

    return true;
  }

  async deactivateUser(id: string): Promise<User | null> {
    return this.updateUser(id, { isActive: false });
  }

  async activateUser(id: string): Promise<User | null> {
    return this.updateUser(id, { isActive: true });
  }
}

export const userService = new UserService();
