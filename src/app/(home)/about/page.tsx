// src/app/(main)/about/page.tsx
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="grow">
      {/* Hero */}
      <section className="relative bg-primary overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
          style={{ backgroundImage: "url('/rwanda-pattern.svg')" }}
        />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <p className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60 font-semibold mb-3">
            About
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground max-w-2xl">
            Rwanda National Integrated Disease Surveillance &amp; Response
          </h1>
          <p className="text-primary-foreground/70 mt-4 max-w-2xl text-sm leading-relaxed">
            A unified digital platform enabling real-time disease monitoring,
            rapid outbreak response, and data-driven public health decisions
            across all 30 districts of Rwanda.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">
              Our Mission
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Transforming Public Health Through Digital Innovation
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              The RIDSR Platform connects health facilities nationwide, creating
              a robust system that strengthens Rwanda&apos;s capacity to detect,
              investigate, and respond to public health threats. Our mission is
              to enable real-time disease surveillance, rapid response, and
              data-driven decision making for health professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Values & Features */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-border rounded-md overflow-hidden">
            <div className="bg-card p-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Core Values
              </h3>
              <ul className="space-y-3">
                {[
                  "Accuracy: Reliable and precise health data",
                  "Timeliness: Real-time surveillance capabilities",
                  "Accessibility: Available to all health workers",
                  "Integrity: Highest standards of data security",
                ].map((v) => (
                  <li
                    key={v}
                    className="flex items-start text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-3 shrink-0" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card p-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Key Capabilities
              </h3>
              <ul className="space-y-3">
                {[
                  "Real-time disease surveillance",
                  "Offline capability with automatic sync",
                  "GIS mapping and visualization",
                  "Automated outbreak detection",
                  "Lab integration capabilities",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-start text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 mr-3 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">
            Impact
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10">
            Platform at a Glance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "500+", label: "Health Facilities" },
              { value: "98%", label: "Coverage Rate" },
              { value: "24/7", label: "Monitoring" },
              { value: "30", label: "Districts" },
            ].map((s) => (
              <div
                key={s.label}
                className="border border-border rounded-md p-6 text-center"
              >
                <div className="text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 bg-primary overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
          style={{ backgroundImage: "url('/rwanda-pattern.svg')" }}
        />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/70 max-w-md mx-auto mb-6 text-sm">
            Access the platform and start contributing to Rwanda&apos;s disease
            surveillance network.
          </p>
          <Link
            href="/login"
            className="px-8 py-3.5 bg-accent text-accent-foreground text-sm font-semibold rounded-md hover:bg-accent/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}
