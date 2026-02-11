// src/components/layout/Footer.tsx
import Link from 'next/link';
import RIDSRLogo from '../ui/RIDSRLogo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About RIDSR', href: '/about' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
    { name: 'Academy', href: '/academy' },
  ];

  const resources = [
    { name: 'Documentation', href: '/docs' },
    { name: 'API Reference', href: '/api' },
    { name: 'Guidelines', href: '/guidelines' },
    { name: 'Training Materials', href: '/training' },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <RIDSRLogo size={50} showText={true} textSize={24} textColor="#1f2937" />
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Rwanda National Integrated Disease Surveillance and Response Platform
            </p>
            <p className="text-gray-600 text-sm">
              Republic of Rwanda | Ministry of Health
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-blue-700 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <Link
                    href={resource.href}
                    className="text-gray-600 hover:text-blue-700 text-sm transition-colors"
                  >
                    {resource.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
            <address className="not-italic text-gray-600 text-sm space-y-2">
              <p>Rwanda Biomedical Center</p>
              <p>Kigali, Rwanda</p>
              <p>Email: info@rbc.gov.rw</p>
              <p>Phone: +250 788 123 456</p>
            </address>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            &copy; {currentYear} Rwanda National Integrated Disease Surveillance and Response Platform. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/privacy-policy" className="text-gray-600 hover:text-blue-700 text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-blue-700 text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;