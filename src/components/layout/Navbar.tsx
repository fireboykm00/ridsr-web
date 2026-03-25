// src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import RIDSRLogo from "../ui/RIDSRLogo";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publicNavLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Features", href: "/features" },
    { name: "Academy", href: "/academy" },
    { name: "Directory", href: "/directory" },
    { name: "FAQ", href: "/faq" },
  ];

  const authenticatedNavLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Report Case", href: "/dashboard/report-case" },
    { name: "Cases", href: "/dashboard/cases" },
    { name: "About", href: "/about" },
    { name: "FAQ", href: "/faq" },
  ];

  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-50 bg-background">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-5">
          <Link href="/" className="flex items-center shrink-0">
            <RIDSRLogo
              size={44}
              showText={true}
              textSize={18}
              textColor="#111827"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {(status === "authenticated"
              ? authenticatedNavLinks
              : publicNavLinks
            ).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[13px] text-foreground/70 hover:text-primary font-medium tracking-wide transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {status === "authenticated" ? (
              <>
                <button
                  onClick={() => signOut()}
                  className="text-[13px] text-foreground/60 hover:text-foreground font-medium transition-colors"
                >
                  Logout
                </button>
                <Link
                  href="/dashboard/account"
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold"
                >
                  {userInitial}
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 text-[13px] font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-foreground/70 hover:text-foreground p-1"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-6 border-t border-border/50 pt-4">
            <div className="flex flex-col gap-1">
              {(status === "authenticated"
                ? authenticatedNavLinks
                : publicNavLinks
              ).map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-foreground/70 hover:text-primary font-medium py-2.5 px-2 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-2 px-2">
                {status === "authenticated" ? (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {userInitial}
                      </div>
                      <span className="text-sm text-foreground font-medium">
                        {session?.user?.name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="text-sm text-destructive font-medium text-left py-1"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-center text-sm font-semibold text-primary-foreground bg-primary rounded-md py-2.5 hover:bg-primary/90"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
