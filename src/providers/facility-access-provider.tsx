// src/providers/facility-access-provider.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { USER_ROLES } from '@/types';

interface FacilityAccessContextType {
  userFacilityId: string | null;
  userDistrictId: string | null;
  userRole: string | null;
  canAccessFacility: (facilityId: string) => boolean;
  canAccessDistrict: (districtId: string) => boolean;
  hasRole: (roles: string[]) => boolean;
}

const FacilityAccessContext = createContext<FacilityAccessContextType | undefined>(undefined);

interface AccessState {
  userFacilityId: string | null;
  userDistrictId: string | null;
  userRole: string | null;
}

type AccessAction =
  | { type: 'SET_ACCESS'; payload: { userFacilityId: string | null; userDistrictId: string | null; userRole: string | null } }
  | { type: 'RESET_ACCESS' };

const accessReducer = (state: AccessState, action: AccessAction): AccessState => {
  switch (action.type) {
    case 'SET_ACCESS':
      return {
        userFacilityId: action.payload.userFacilityId,
        userDistrictId: action.payload.userDistrictId,
        userRole: action.payload.userRole,
      };
    case 'RESET_ACCESS':
      return {
        userFacilityId: null,
        userDistrictId: null,
        userRole: null,
      };
    default:
      return state;
  }
};

export const FacilityAccessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [accessState, dispatch] = useReducer(accessReducer, {
    userFacilityId: null,
    userDistrictId: null,
    userRole: null,
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      dispatch({
        type: 'SET_ACCESS',
        payload: {
          userFacilityId: session.user.facilityId || null,
          userDistrictId: session.user.district || null,
          userRole: session.user.role || null,
        }
      });
    } else {
      dispatch({ type: 'RESET_ACCESS' });
    }
  }, [status, session]);

  const canAccessFacility = (facilityId: string): boolean => {
    if (!accessState.userRole || !accessState.userFacilityId) return false;

    // Admins and national officers can access any facility
    if (accessState.userRole === USER_ROLES.ADMIN || accessState.userRole === USER_ROLES.NATIONAL_OFFICER) {
      return true;
    }

    // District officers can access any facility in their district
    if (accessState.userRole === USER_ROLES.DISTRICT_OFFICER) {
      // In a real app, you'd check if the facility belongs to the user's district
      // For now, we'll assume the facility belongs to the user's district if they have district access
      return !!accessState.userDistrictId; // Simplified check
    }

    // Health workers and lab technicians can only access their own facility
    return facilityId === accessState.userFacilityId;
  };

  const canAccessDistrict = (districtId: string): boolean => {
    if (!accessState.userRole || !accessState.userDistrictId) return false;

    // Admins and national officers can access any district
    if (accessState.userRole === USER_ROLES.ADMIN || accessState.userRole === USER_ROLES.NATIONAL_OFFICER) {
      return true;
    }

    // District officers can only access their own district
    if (accessState.userRole === USER_ROLES.DISTRICT_OFFICER) {
      return districtId === accessState.userDistrictId;
    }

    // Health workers and lab technicians can access their district if they're assigned to it
    return districtId === accessState.userDistrictId;
  };

  const hasRole = (roles: string[]): boolean => {
    if (!accessState.userRole) return false;
    return roles.includes(accessState.userRole);
  };

  const value = {
    userFacilityId: accessState.userFacilityId,
    userDistrictId: accessState.userDistrictId,
    userRole: accessState.userRole,
    canAccessFacility,
    canAccessDistrict,
    hasRole,
  };

  return (
    <FacilityAccessContext.Provider value={value}>
      {children}
    </FacilityAccessContext.Provider>
  );
};

export const useFacilityAccess = (): FacilityAccessContextType => {
  const context = useContext(FacilityAccessContext);
  if (context === undefined) {
    throw new Error('useFacilityAccess must be used within a FacilityAccessProvider');
  }
  return context;
};