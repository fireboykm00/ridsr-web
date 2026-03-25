// src/app/(main)/about/page.tsx
import { Card } from '@/components/ui/Card';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">About RIDSR Platform</h1>
        <p className="text-muted-foreground mb-8">Rwanda National Integrated Disease Surveillance and Response</p>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Our Mission</h2>
          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
            The Rwanda National Integrated Disease Surveillance and Response (RIDSR) Platform is designed to
            transform public health through digital innovation. Our mission is to enable real-time disease
            surveillance, rapid response, and data-driven decision making for health professionals across Rwanda.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            By connecting health facilities nationwide, we are creating a robust system that strengthens
            Rwanda&apos;s capacity to detect, investigate, and respond to public health threats.
          </p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Core Values</h3>
            <ul className="space-y-2">
              <li className="flex items-start text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3 shrink-0"></div>
                Accuracy: Ensuring reliable and precise health data
              </li>
              <li className="flex items-start text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3 shrink-0"></div>
                Timeliness: Providing real-time surveillance capabilities
              </li>
              <li className="flex items-start text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3 shrink-0"></div>
                Accessibility: Making the system available to all health workers
              </li>
              <li className="flex items-start text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3 shrink-0"></div>
                Integrity: Maintaining the highest standards of data security
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Key Features</h3>
            <ul className="space-y-2">
              <li className="flex items-start text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-accent rounded-full mt-1.5 mr-3 shrink-0"></div>
                Real-time disease surveillance
              </li>
              <li className="flex items-start text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-accent rounded-full mt-1.5 mr-3 shrink-0"></div>
                Offline capability with automatic sync
              </li>
              <li className="flex items-start text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-accent rounded-full mt-1.5 mr-3 shrink-0"></div>
                GIS mapping and visualization
              </li>
              <li className="flex items-start text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-accent rounded-full mt-1.5 mr-3 shrink-0"></div>
                Automated outbreak detection
              </li>
              <li className="flex items-start text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-accent rounded-full mt-1.5 mr-3 shrink-0"></div>
                Lab integration capabilities
              </li>
            </ul>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Our Impact</h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            Since our inception, the RIDSR Platform has connected hundreds of health facilities across Rwanda,
            enabling faster detection and response to disease outbreaks.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-muted rounded-md">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-xs text-muted-foreground mt-1">Health Facilities</div>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <div className="text-2xl font-bold text-primary">98%</div>
              <div className="text-xs text-muted-foreground mt-1">Coverage Rate</div>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <div className="text-2xl font-bold text-accent">24/7</div>
              <div className="text-xs text-muted-foreground mt-1">Monitoring</div>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-xs text-muted-foreground mt-1">Nationwide</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
