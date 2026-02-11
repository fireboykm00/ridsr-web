// src/app/(main)/about/page.tsx
import { Card } from '@/components/ui/Card';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About RIDSR Platform</h1>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            The Rwanda National Integrated Disease Surveillance and Response (RIDSR) Platform is designed to
            transform public health through digital innovation. Our mission is to enable real-time disease
            surveillance, rapid response, and data-driven decision making for health professionals across Rwanda.
          </p>
          <p className="text-gray-700">
            By connecting health facilities nationwide, we are creating a robust system that strengthens
            Rwanda&apos;s capacity to detect, investigate, and respond to public health threats.
          </p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Core Values</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-700 rounded-full mt-2 mr-3"></div>
                <span>Accuracy: Ensuring reliable and precise health data</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-700 rounded-full mt-2 mr-3"></div>
                <span>Timeliness: Providing real-time surveillance capabilities</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-700 rounded-full mt-2 mr-3"></div>
                <span>Accessibility: Making the system available to all health workers</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-700 rounded-full mt-2 mr-3"></div>
                <span>Integrity: Maintaining the highest standards of data security</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <span>Real-time disease surveillance</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <span>Offline capability with automatic sync</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <span>GIS mapping and visualization</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <span>Automated outbreak detection</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <span>Lab integration capabilities</span>
              </li>
            </ul>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Impact</h2>
          <p className="text-gray-700 mb-4">
            Since our inception, the RIDSR Platform has connected hundreds of health facilities across Rwanda,
            enabling faster detection and response to disease outbreaks. Our system has contributed to:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">500+</div>
              <div className="text-sm text-gray-600">Health Facilities</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">98%</div>
              <div className="text-sm text-gray-600">Coverage Rate</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">24/7</div>
              <div className="text-sm text-gray-600">Monitoring</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">100%</div>
              <div className="text-sm text-gray-600">Nationwide</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;