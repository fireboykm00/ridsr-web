import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/services/db';
import { User as UserModel } from '@/lib/models';
import { Facility as FacilityModel } from '@/lib/models';
import { verifyPassword } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { identifier, password } = await request.json();

    // Find user by email or workerId
    const user = await UserModel.findOne({
      $or: [
        { email: identifier },
        { workerId: identifier }
      ]
    }).lean();

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password using centralized auth utility
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Attempt to get facility name if facilityId exists
    let facilityName = undefined;
    if (user.facilityId) {
      const facility = await FacilityModel.findById(user.facilityId).lean();
      if (facility) {
        facilityName = facility.name;
      }
    }

    // Return user object that matches the User type (without password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      id: userWithoutPassword._id.toString(),
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      role: userWithoutPassword.role,
      facilityId: userWithoutPassword.facilityId?.toString(),
      facilityName,
      district: userWithoutPassword.district,
      province: userWithoutPassword.province,
      workerId: userWithoutPassword.workerId,
      isActive: userWithoutPassword.isActive,
      createdAt: userWithoutPassword.createdAt instanceof Date ? userWithoutPassword.createdAt.toISOString() : userWithoutPassword.createdAt,
      updatedAt: userWithoutPassword.updatedAt instanceof Date ? userWithoutPassword.updatedAt.toISOString() : userWithoutPassword.updatedAt,
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}