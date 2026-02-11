// src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import RIDSRLogo from '../ui/RIDSRLogo';

const Navbar = () => {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publicNavLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Features', href: '/features' },
    { name: 'Academy', href: '/academy' },
    { name: 'Directory', href: '/directory' },
    { name: 'FAQ', href: '/faq' },
  ];

  const authenticatedNavLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Report Case', href: '/report-case' },
    { name: 'Cases', href: '/cases' },
    { name: 'About', href: '/about' },
    { name: 'FAQ', href: '/faq' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Branding */}
          <div className="flex items-center">
            <div>
              <RIDSRLogo size={50} showText={true} textSize={20} textColor="#1f2937" />

            </div>
            <span className="ml-4 text-sm text-gray-600 hidden lg:block">
              Republic of Rwanda | Ministry of Health
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {status === "authenticated"
              ? authenticatedNavLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-blue-700 font-medium transition-colors"
                >
                  {link.name}
                </Link>
              ))
              : publicNavLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-blue-700 font-medium transition-colors"
                >
                  {link.name}
                </Link>
              ))
            }

            {status === "authenticated" ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 hidden md:block">
                  Welcome, {session?.user?.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="ml-4 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-700 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3 px-4">
              {(status === "authenticated" ? authenticatedNavLinks : publicNavLinks).map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-blue-700 font-medium py-2 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {status === "authenticated" ? (
                <div className="pt-4 flex flex-col space-y-3">
                  <span className="text-sm text-gray-600">
                    Welcome, {session?.user?.name}
                  </span>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-center text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 flex flex-col space-y-3">
                  <Link
                    href="/login"
                    className="w-full px-4 py-2 text-center text-sm font-medium text-blue-700 border border-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="w-full px-4 py-2 text-center text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;