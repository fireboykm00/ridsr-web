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
  MapPinIcon,
  BellIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import RIDSRLogo from "../ui/RIDSRLogo";

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
      name: "Reports",
      href: "/dashboard/reports",
      icon: <ChartBarIcon className="w-5 h-5" />,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.NATIONAL_OFFICER,
        USER_ROLES.DISTRICT_OFFICER,
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
      roles: [USER_ROLES.LAB_TECHNICIAN],
    },
    {
      name: "Districts",
      href: "/dashboard/district",
      icon: <MapPinIcon className="w-5 h-5" />,
      roles: [USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER],
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
      name: "Alerts",
      href: "/dashboard/alert",
      icon: <BellIcon className="w-5 h-5" />,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.NATIONAL_OFFICER,
        USER_ROLES.DISTRICT_OFFICER,
        USER_ROLES.HEALTH_WORKER,
        USER_ROLES.LAB_TECHNICIAN,
      ],
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
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-card border border-border rounded-md hover:bg-muted"
        aria-label="Toggle sidebar"
      >
        {!isOpen ? <svg
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
        </svg> : <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" y1="4" x2="20" y2="20" />
          <line x1="20" y1="4" x2="4" y2="20" />
        </svg>}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-[#032f3d]
          transform transition-transform duration-300 ease-in-out
          z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <nav className="h-full flex flex-col">
          <div className="p-4 border-b border-white/10">
            <RIDSRLogo size={50} textSize={30} textColor="#FFFFFF" color="#4EA8DE" />
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
                        w-full flex items-center px-4 py-2 rounded-md transition-colors text-sm
                        ${isActive
                          ? "bg-white/10 text-white font-medium"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
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
                        flex items-center px-4 py-2 rounded-md transition-colors text-sm
                        ${isActive
                          ? "bg-white/10 text-white font-medium"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
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

          <div className="p-4 border-t border-white/10">
            <p className="text-xs text-gray-500">
              Logged in as:{" "}
              <span className="font-medium text-gray-300">{session.user.name}</span>
            </p>
          </div>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
