// src/lib/services/user-service.ts
import { auth } from '@/lib/auth';
import { ROLES } from '@/lib/utils/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  facility?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: string;
  facility?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: string;
  facility?: string;
}

class UserService {
  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const session = await auth();
    if (!session) {
      return null;
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Check if current user has admin privileges
   */
  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === ROLES.ADMIN;
  }

  /**
   * Check if current user has a specific role
   */
  async hasRole(role: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    // In a real application, this would fetch from the database
    // For now, returning a mock user
    if (id === '1') {
      return {
        id: '1',
        name: 'Admin User',
        email: 'admin@ridsr.rw',
        role: ROLES.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return null;
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    // In a real application, this would fetch from the database
    // For now, returning mock users
    return [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@ridsr.rw',
        role: ROLES.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Health Worker',
        email: 'worker@ridsr.rw',
        role: ROLES.HEALTH_WORKER,
        facility: 'Kigali Central Hospital',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  /**
   * Create a new user (admin only)
   */
  async createUser(userData: CreateUserInput): Promise<User> {
    // In a real application, this would save to the database
    // For now, returning a mock user
    return {
      id: `user_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      facility: userData.facility,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Update user (admin only or self-update)
   */
  async updateUser(id: string, userData: UpdateUserInput): Promise<User | null> {
    // In a real application, this would update the database
    // For now, returning a mock updated user
    return {
      id,
      name: userData.name || 'Updated User',
      email: userData.email || 'updated@example.com',
      role: userData.role || ROLES.HEALTH_WORKER,
      facility: userData.facility,
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      updatedAt: new Date(),
    };
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(id: string): Promise<boolean> {
    // In a real application, this would delete from the database
    // For now, returning true to indicate success
    return true;
  }
}

export const userService = new UserService();