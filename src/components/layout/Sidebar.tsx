"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { USER_ROLES } from "@/types";
import {
  HomeIcon,
  DocumentTextIcon,
  TableCellsIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
  onClick?: () => void;
}

const Sidebar: React.FC = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  // Ensure user role is available before proceeding
  if (!session.user.role) {
    return null;
  }

  const getDashboardUrl = (): string => {
    if (session.user && session.user.role) {
      switch (session.user.role) {
        case USER_ROLES.ADMIN:
        case USER_ROLES.NATIONAL_OFFICER:
          return "/dashboard/national";
        case USER_ROLES.DISTRICT_OFFICER:
          return `/dashboard/district/${session.user.district || "default"}`;
        default:
          return `/dashboard/facility/${session.user.facilityId || "default"}`;
      }
    }
    return `/dashboard`;
  };

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: getDashboardUrl(),
      icon: <HomeIcon className="w-5 h-5" />,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.NATIONAL_OFFICER,
        USER_ROLES.DISTRICT_OFFICER,
        USER_ROLES.HEALTH_WORKER,
        USER_ROLES.LAB_TECHNICIAN,
      ],
    },
    {
      name: "Report Case",
      href: "/dashboard/report-case",
      icon: <DocumentTextIcon className="w-5 h-5" />,
      roles: [
        USER_ROLES.HEALTH_WORKER,
        USER_ROLES.LAB_TECHNICIAN,
        USER_ROLES.DISTRICT_OFFICER,
        USER_ROLES.NATIONAL_OFFICER,
        USER_ROLES.ADMIN,
      ],
    },
    {
      name: "Cases",
      href: "/dashboard/cases",
      icon: <TableCellsIcon className="w-5 h-5" />,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.NATIONAL_OFFICER,
        USER_ROLES.DISTRICT_OFFICER,
        USER_ROLES.HEALTH_WORKER,
        USER_ROLES.LAB_TECHNICIAN,
      ],
    },
    {
      name: "Patients",
      href: "/dashboard/patient",
      icon: <UserGroupIcon className="w-5 h-5" />,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.NATIONAL_OFFICER,
        USER_ROLES.DISTRICT_OFFICER,
        USER_ROLES.HEALTH_WORKER,
        USER_ROLES.LAB_TECHNICIAN,
      ],
    },
    {
      name: "Validate Cases",
      href: "/dashboard/validation",
      icon: <DocumentTextIcon className="w-5 h-5" />,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.NATIONAL_OFFICER,
        USER_ROLES.DISTRICT_OFFICER,
      ],
    },
    {
      name: "Lab Results",
      href: "/dashboard/validation-hub",
      icon: <DocumentTextIcon className="w-5 h-5" />,
      roles: [
        USER_ROLES.LAB_TECHNICIAN,
      ],
    },
    {
      name: "Users",
      href: "/dashboard/user",
      icon: <UserGroupIcon className="w-5 h-5" />,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.NATIONAL_OFFICER,
        USER_ROLES.DISTRICT_OFFICER,
      ],
    },
    {
      name: "Facilities",
      href: "/dashboard/facility",
      icon: <BuildingOfficeIcon className="w-5 h-5" />,
      roles: [USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER],
    },

    {
      name: "Account",
      href: "/dashboard/account",
      icon: <UserCircleIcon className="w-5 h-5" />,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.NATIONAL_OFFICER,
        USER_ROLES.DISTRICT_OFFICER,
        USER_ROLES.HEALTH_WORKER,
        USER_ROLES.LAB_TECHNICIAN,
      ],
    },
    {
      name: "Administration",
      href: "/dashboard/admin",
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      roles: [USER_ROLES.ADMIN],
    },
    {
      name: "Logout",
      href: "#",
      icon: <ArrowRightStartOnRectangleIcon className="w-5 h-5" />,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.NATIONAL_OFFICER,
        USER_ROLES.DISTRICT_OFFICER,
        USER_ROLES.HEALTH_WORKER,
        USER_ROLES.LAB_TECHNICIAN,
      ],
      onClick: () => signOut({ callbackUrl: "/login" }),
    },
  ];

  // Only filter if session is loaded and user role is available
  const filteredNavItems = session?.user?.role
    ? navItems.filter((item) => item.roles.includes(session.user.role))
    : [];

  return (
    <div className="">
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow hover:bg-gray-50"
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <nav className="h-full flex flex-col">
          <div className="p-5 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">RIDSR</h1>
            <p className="text-xs text-gray-500 mt-1">Rwanda IDSR System</p>
          </div>

          <ul className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  {item.onClick ? (
                    <button
                      onClick={() => {
                        item.onClick?.();
                        setIsOpen(false);
                      }}
                      className={`
                        w-full flex items-center px-4 py-2 rounded-lg transition-colors
                        ${isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                        }
                      `}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.name}</span>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center px-4 py-2 rounded-lg transition-colors
                        ${isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                        }
                      `}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Logged in as:{" "}
              <span className="font-medium">{session.user.name}</span>
            </p>
          </div>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
