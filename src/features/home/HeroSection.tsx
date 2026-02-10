// src/features/home/HeroSection.tsx
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Rwanda National Integrated Disease Surveillance and Response Platform
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-lg">
              Transforming public health through digital innovation. Our platform enables real-time disease surveillance, rapid response, and data-driven decision making for health professionals across Rwanda.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors text-center"
              >
                Access Dashboard
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 bg-white text-blue-700 border border-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors text-center"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-blue-200 to-blue-400 rounded-2xl shadow-xl flex items-center justify-center">
                <div className="bg-white rounded-xl p-6 w-4/5 h-4/5 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-900">Surveillance Dashboard</div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-16 bg-blue-100 rounded-lg"></div>
                    <div className="h-16 bg-green-100 rounded-lg"></div>
                    <div className="h-16 bg-amber-100 rounded-lg"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-yellow-500 text-white py-2 px-4 rounded-lg shadow-lg">
                <span className="font-bold">Real-time Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;