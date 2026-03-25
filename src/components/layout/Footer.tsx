// src/components/layout/Footer.tsx
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import RIDSRLogo from '../ui/RIDSRLogo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About RIDSR', href: '/about' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Academy', href: '/academy' },
  ];

  const internalPortal = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Report Case', href: '/dashboard/report-case' },
    { name: 'Case Management', href: '/dashboard/cases' },
    { name: 'Alerts', href: '/dashboard/alert' },
    { name: 'Reports', href: '/dashboard/reports' },
  ];

  const externalPortal = [
    { name: 'RBC Portal', href: 'https://www.rbc.gov.rw' },
    { name: 'Ministry of Health', href: '#' },
    { name: 'WHO Rwanda', href: '#' },
    { name: 'Rwanda Health', href: '#' },
  ];

  return (
    <footer className="bg-[#032f3d]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <RIDSRLogo size={44} showText={true} textSize={20} textColor="#FFFFFF" color="#4EA8DE" />
            <p className="text-gray-400 text-sm mt-4 leading-relaxed">
              Rwanda National Integrated Disease Surveillance and Response Platform
            </p>
            <p className="text-gray-500 text-xs mt-3">
              Republic of Rwanda | Ministry of Health
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-white mb-5 uppercase tracking-[0.15em]">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="flex items-center text-gray-400 hover:text-white text-sm transition-colors">
                    <ChevronRightIcon className="h-3 w-3 text-[#4EA8DE] mr-2 shrink-0" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Internal Portal */}
          <div>
            <h3 className="text-xs font-semibold text-white mb-5 uppercase tracking-[0.15em]">Internal Portal</h3>
            <ul className="space-y-3">
              {internalPortal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="flex items-center text-gray-400 hover:text-white text-sm transition-colors">
                    <ChevronRightIcon className="h-3 w-3 text-[#4EA8DE] mr-2 shrink-0" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-white mb-5 uppercase tracking-[0.15em]">Contact Us</h3>
            <address className="not-italic text-gray-400 text-sm space-y-2.5 leading-relaxed">
              <p>Rwanda Biomedical Centre (RBC)</p>
              <p>P.O. Box 7162, Kigali, Rwanda</p>
              <p>KG 644 St, Kimihurura</p>
            </address>
            <div className="mt-5 space-y-2.5 text-sm text-gray-400">
              <p>
                <span className="text-gray-500 text-xs block mb-0.5">Toll-Free Call Center</span>
                114
              </p>
              <p>
                <span className="text-gray-500 text-xs block mb-0.5">Toll-Free Ambulance</span>
                912
              </p>
              <p>
                <span className="text-gray-500 text-xs block mb-0.5">Phone (Direct)</span>
                +250 788 202 080
              </p>
              <p>
                <span className="text-gray-500 text-xs block mb-0.5">Email</span>
                info@rbc.gov.rw
              </p>
            </div>
          </div>
        </div>

        {/* External Portal Links */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <h3 className="text-xs font-semibold text-white mb-4 uppercase tracking-[0.15em]">External Portal</h3>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {externalPortal.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-400 hover:text-white text-sm transition-colors"
              >
                <ChevronRightIcon className="h-3 w-3 text-[#4EA8DE] mr-2 shrink-0" />
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-xs">
            &copy; {currentYear} Rwanda National Integrated Disease Surveillance and Response Platform. All rights reserved.
          </p>
          <div className="mt-3 md:mt-0 flex space-x-6">
            <Link href="/privacy-policy" className="text-gray-500 hover:text-white text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-white text-xs transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
