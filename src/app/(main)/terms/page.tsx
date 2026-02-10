// src/app/(main)/terms/page.tsx
import Card from '@/components/ui/Card';

const TermsPage = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing and using the Rwanda National Integrated Disease Surveillance and Response (RIDSR) Platform,
            you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Description of Service</h2>
          <p className="text-gray-700 mb-4">
            RIDSR provides a digital platform for disease surveillance and response in Rwanda. The service is designed
            for health professionals and authorized personnel to report, track, and manage disease cases.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">User Responsibilities</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Provide accurate and timely information when reporting cases</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Use the platform solely for its intended purpose</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Data Privacy</h2>
          <p className="text-gray-700 mb-4">
            All data entered into the RIDSR platform is handled in accordance with Rwanda's data protection laws
            and international standards for health data privacy. We implement appropriate security measures to
            protect your information.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Limitation of Liability</h2>
          <p className="text-gray-700">
            The RIDSR Platform and its operators shall not be liable for any indirect, incidental, special,
            consequential or punitive damages resulting from your access to or use of the service.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default TermsPage;