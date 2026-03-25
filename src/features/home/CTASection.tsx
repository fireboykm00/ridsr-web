// src/features/home/CTASection.tsx
import Link from 'next/link';

const CTASection = () => {
  return (
    <section className="relative py-20 bg-primary overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('/rwanda-pattern.svg')" }}
      />
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
          Ready to Strengthen Disease Surveillance?
        </h2>
        <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8 leading-relaxed">
          Join hundreds of health professionals across Rwanda using RIDSR to detect, report, and respond to public health threats in real time.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            className="px-8 py-3.5 bg-accent text-accent-foreground text-sm font-semibold rounded-md hover:bg-accent/90 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="px-8 py-3.5 text-primary-foreground border border-primary-foreground/30 text-sm font-medium rounded-md hover:bg-primary-foreground/10 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
