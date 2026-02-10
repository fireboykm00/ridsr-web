// src/features/home/FeaturesSection.tsx
import { 
  ChartBarIcon, 
  ShieldCheckIcon, 
  GlobeAltIcon, 
  ClockIcon, 
  DevicePhoneMobileIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    title: "Real-time Surveillance",
    description: "Monitor disease outbreaks in real-time with automated alerts and notifications.",
    icon: <ChartBarIcon className="w-8 h-8 text-blue-700" />,
  },
  {
    title: "Offline Capability",
    description: "Continue reporting even without internet connectivity with automatic sync when back online.",
    icon: <DevicePhoneMobileIcon className="w-8 h-8 text-blue-700" />,
  },
  {
    title: "Lab Integration",
    description: "Seamlessly connect with laboratory systems for faster diagnosis and reporting.",
    icon: <ShieldCheckIcon className="w-8 h-8 text-blue-700" />,
  },
  {
    title: "GIS Mapping",
    description: "Visualize disease patterns with geographic information system mapping.",
    icon: <GlobeAltIcon className="w-8 h-8 text-blue-700" />,
  },
  {
    title: "Rapid Response",
    description: "Enable quick response to outbreaks with streamlined workflows and communication.",
    icon: <ClockIcon className="w-8 h-8 text-blue-700" />,
  },
  {
    title: "Training Academy",
    description: "Access to continuous learning resources for health professionals.",
    icon: <AcademicCapIcon className="w-8 h-8 text-blue-700" />,
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Public Health
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Our platform combines cutting-edge technology with public health expertise to create the most effective disease surveillance system in Rwanda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card flex flex-col items-center text-center p-8 transition-transform hover:scale-[1.02]"
            >
              <div className="mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-700">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;