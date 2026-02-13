// src/app/(main)/home/page.tsx
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/features/home/HeroSection';
import FeaturesSection from '@/features/home/FeaturesSection';
import Footer from '@/components/layout/Footer';
import { ChartBarIcon, GlobeAltIcon, BoltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="grow">
                <HeroSection />
                <FeaturesSection />
                <section className="py-20 bg-blue-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <ChartBarIcon className="h-8 w-8 text-cyan-600 mb-3" />
                                <p className="text-sm text-gray-500">National Reporting Uptime</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">99.9%</p>
                            </div>
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <GlobeAltIcon className="h-8 w-8 text-blue-600 mb-3" />
                                <p className="text-sm text-gray-500">District Visibility</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">30/30</p>
                            </div>
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <BoltIcon className="h-8 w-8 text-amber-500 mb-3" />
                                <p className="text-sm text-gray-500">Alert Dispatch Speed</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">&lt; 60s</p>
                            </div>
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <ShieldCheckIcon className="h-8 w-8 text-emerald-600 mb-3" />
                                <p className="text-sm text-gray-500">Secure Access Control</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">Role-based</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-gradient-to-b from-white to-cyan-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mb-10">
                            <p className="text-xs uppercase tracking-[0.2em] text-blue-700 font-semibold">Workflow</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">From Report to Response in One Stream</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <p className="text-sm font-semibold text-blue-700 mb-2">01 Report</p>
                                <p className="text-gray-700">Facilities submit case reports in structured, standardized formats.</p>
                            </div>
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <p className="text-sm font-semibold text-blue-700 mb-2">02 Validate</p>
                                <p className="text-gray-700">District and national teams validate and triage cases with audit trails.</p>
                            </div>
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <p className="text-sm font-semibold text-blue-700 mb-2">03 Act</p>
                                <p className="text-gray-700">Alert-ready dashboards accelerate outbreak response and decision making.</p>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
