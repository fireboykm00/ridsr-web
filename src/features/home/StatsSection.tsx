// src/features/home/StatsSection.tsx
import { ArrowTrendingUpIcon, UserGroupIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

const stats = [
  {
    value: "500+",
    label: "Health Facilities Connected",
    icon: <UserGroupIcon className="w-6 h-6 text-blue-700" />,
    description: "Across Rwanda's districts and sectors"
  },
  {
    value: "98%",
    label: "Report Accuracy",
    icon: <ArrowTrendingUpIcon className="w-6 h-6 text-blue-700" />,
    description: "With automated validation systems"
  },
  {
    value: "24/7",
    label: "Monitoring",
    icon: <ClockIcon className="w-6 h-6 text-blue-700" />,
    description: "Real-time surveillance capabilities"
  },
  {
    value: "100%",
    label: "Coverage",
    icon: <MapPinIcon className="w-6 h-6 text-blue-700" />,
    description: "Nationwide disease surveillance"
  }
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Transforming Public Health in Rwanda
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Our platform is revolutionizing disease surveillance and response across the nation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="glass-card flex flex-col items-center text-center p-6"
            >
              <div className="mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {stat.label}
              </div>
              <p className="text-gray-600 text-sm">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-8 md:p-12 text-white">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-8 md:mb-0">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Join the Digital Health Revolution
              </h3>
              <p className="text-blue-100 max-w-lg">
                Become part of Rwanda&apos;s mission to strengthen public health through innovative technology solutions.
              </p>
            </div>
            <div className="md:w-1/3 flex justify-center md:justify-end">
              <button className="px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors">
                Get Started Today
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;