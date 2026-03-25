// src/features/home/FeaturesSection.tsx
import {
  ChartBarIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  AcademicCapIcon,
  BellAlertIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    title: "Real-time Surveillance",
    description: "Monitor disease outbreaks as they happen with automated threshold alerts and instant notifications to response teams.",
    icon: ChartBarIcon,
  },
  {
    title: "Offline Reporting",
    description: "Submit case reports even without connectivity. Data syncs automatically when the network is restored.",
    icon: DevicePhoneMobileIcon,
  },
  {
    title: "Lab Integration",
    description: "Connect directly with laboratory information systems for faster specimen tracking and result transmission.",
    icon: ShieldCheckIcon,
  },
  {
    title: "GIS Mapping",
    description: "Visualize case distribution and disease trends on interactive maps powered by geographic data.",
    icon: GlobeAltIcon,
  },
  {
    title: "Outbreak Alerts",
    description: "Automated detection of unusual disease patterns with immediate escalation workflows.",
    icon: BellAlertIcon,
  },
  {
    title: "Analytics & Reports",
    description: "Generate weekly, monthly, and annual surveillance reports with exportable data visualizations.",
    icon: DocumentChartBarIcon,
  },
  {
    title: "Rapid Response",
    description: "Streamlined investigation workflows that connect field teams with national coordination centers.",
    icon: ClockIcon,
  },
  {
    title: "Training Academy",
    description: "Built-in learning modules for continuous capacity building of health surveillance officers.",
    icon: AcademicCapIcon,
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">Capabilities</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Built for Public Health Professionals
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Every feature is designed with input from Rwandan health workers, district officers, and national surveillance teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border rounded-md overflow-hidden">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-card p-7 flex flex-col"
              >
                <Icon className="h-6 w-6 text-primary mb-4" strokeWidth={1.5} />
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
