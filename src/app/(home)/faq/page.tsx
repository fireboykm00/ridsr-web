import { Card } from "@/components/ui/Card";

const faqs = [
  {
    q: "Who can use the RIDSR Platform?",
    a: "The RIDSR Platform is designed for health professionals, including doctors, nurses, laboratory technicians, and public health officials in Rwanda.",
  },
  {
    q: "Is the platform available offline?",
    a: "Yes, the RIDSR Platform has offline capabilities that allow health workers to continue reporting even without internet connectivity. Data is automatically synced when connectivity is restored.",
  },
  {
    q: "How is my data protected?",
    a: "All data is encrypted and stored securely in compliance with Rwanda's data protection laws and international health data privacy standards.",
  },
  {
    q: "Can I access the platform from my mobile device?",
    a: "Yes, the RIDSR Platform is built as a Progressive Web App (PWA) and can be accessed from any device with a modern browser.",
  },
  {
    q: "What types of diseases should I report?",
    a: "You should report any suspected or confirmed cases of epidemic-prone diseases as defined by the Ministry of Health guidelines.",
  },
  {
    q: "How often should I submit reports?",
    a: "Routine surveillance reports should be submitted weekly. Immediate notification is required for certain epidemic-prone diseases.",
  },
];

export default function FAQPage() {
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
            Support
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">
            Frequently Asked Questions
          </h1>
          <p className="text-primary-foreground/70 mt-3 max-w-xl text-sm">
            Find answers to common questions about the RIDSR Platform.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="p-6">
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {faq.q}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </Card>
            ))}
          </div>

          {/* Contact */}
          <Card className="p-6 mt-8">
            <h3 className="text-base font-semibold text-foreground mb-3">
              Need More Help?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Contact our support team for additional assistance.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="text-foreground">support@ridsr.rw</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone: </span>
                <span className="text-foreground">+250 788 123 456</span>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
