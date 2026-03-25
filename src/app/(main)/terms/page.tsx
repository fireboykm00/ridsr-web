// src/app/(main)/terms/page.tsx
import { Card } from '@/components/ui/Card';

const TermsPage = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: 2024</p>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Acceptance of Terms</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            By accessing and using the Rwanda National Integrated Disease Surveillance and Response (RIDSR) Platform,
            you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6 mb-3">Description of Service</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            RIDSR provides a digital platform for disease surveillance and response in Rwanda. The service is designed
            for health professionals and authorized personnel to report, track, and manage disease cases.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6 mb-3">User Responsibilities</h2>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2 mb-4">
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Provide accurate and timely information when reporting cases</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Use the platform solely for its intended purpose</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-6 mb-3">Data Privacy</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            All data entered into the RIDSR platform is handled in accordance with Rwanda&apos;s data protection laws
            and international standards for health data privacy. We implement appropriate security measures to
            protect your information.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6 mb-3">Limitation of Liability</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The RIDSR Platform and its operators shall not be liable for any indirect, incidental, special,
            consequential or punitive damages resulting from your access to or use of the service.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default TermsPage;
