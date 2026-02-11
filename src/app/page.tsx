// src/app/(main)/home/page.tsx
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/features/home/HeroSection';
import FeaturesSection from '@/features/home/FeaturesSection';
import StatsSection from '@/features/home/StatsSection';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="grow">
                <HeroSection />
                <FeaturesSection />
                <StatsSection />
            </main>

            <Footer />
        </div>
    );
}