// src/features/home/HeroSection.tsx
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
            Republic of Rwanda &middot; Ministry of Health
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-foreground leading-[1.15] mb-6">
            National Integrated Disease Surveillance &amp; Response
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl">
            A unified digital platform enabling real-time disease monitoring, rapid outbreak response,
            and data-driven public health decisions across all 30 districts of Rwanda.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="px-7 py-3.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Access Dashboard
            </Link>
            <Link
              href="/about"
              className="px-7 py-3.5 text-primary border border-primary text-sm font-medium rounded-md hover:bg-primary/5 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-16 pt-10 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-3xl font-bold text-foreground">500+</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Health Facilities</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">30/30</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Districts Covered</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">24/7</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Active Monitoring</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">99.9%</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">System Uptime</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
