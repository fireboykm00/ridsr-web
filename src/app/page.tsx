// src/app/page.tsx
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/features/home/HeroSection';
import FeaturesSection from '@/features/home/FeaturesSection';
import PartnersSection from '@/features/home/PartnersSection';
import CTASection from '@/features/home/CTASection';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="grow">
                <HeroSection />
                <FeaturesSection />
                <PartnersSection />
                <CTASection />
            </main>

            <Footer />
        </div>
    );
}
