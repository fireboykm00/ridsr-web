// src/features/home/PartnersSection.tsx
import Image from "next/image";

const partners = [
  { name: "World Health Organization", logo: "/partners/who.png" },
  { name: "Rwanda Biomedical Centre", logo: "/partners/rbc.png" },
  { name: "Ministry of Health", logo: "/partners/moh.png" },
];

const PartnersSection = () => {
  return (
    <section className="py-16 bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">
            Partners
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Trusted by Leading Health Organizations
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center justify-center"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={1000}
                height={1000}
                className="h-10 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
