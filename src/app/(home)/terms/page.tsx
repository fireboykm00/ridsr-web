import { Card } from "@/components/ui/Card";

export default function TermsPage() {
  return (
    <main className="grow">
      {/* Hero */}
      <section className="relative bg-primary overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
          style={{ backgroundImage: "url('/rwanda-pattern.svg')" }}
        />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <p className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60 font-semibold mb-3">
            Legal
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">
            Terms of Service
          </h1>
          <p className="text-primary-foreground/70 mt-3 text-sm">
            Last updated: 2024
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <Card className="p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Acceptance of Terms
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              By accessing and using the Rwanda National Integrated Disease
              Surveillance and Response (RIDSR) Platform, you accept and agree
              to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-lg font-semibold text-foreground mb-3">
              Description of Service
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              RIDSR provides a digital platform for disease surveillance and
              response in Rwanda. The service is designed for health
              professionals and authorized personnel to report, track, and
              manage disease cases.
            </p>

            <h2 className="text-lg font-semibold text-foreground mb-3">
              User Responsibilities
            </h2>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2 mb-6">
              <li>Maintain the confidentiality of your account credentials</li>
              <li>
                Provide accurate and timely information when reporting cases
              </li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Use the platform solely for its intended purpose</li>
            </ul>

            <h2 className="text-lg font-semibold text-foreground mb-3">
              Data Privacy
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              All data entered into the RIDSR platform is handled in accordance
              with Rwanda&apos;s data protection laws and international
              standards for health data privacy.
            </p>

            <h2 className="text-lg font-semibold text-foreground mb-3">
              Limitation of Liability
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The RIDSR Platform and its operators shall not be liable for any
              indirect, incidental, special, consequential or punitive damages
              resulting from your access to or use of the service.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
