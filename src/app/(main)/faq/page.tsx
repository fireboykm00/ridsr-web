// src/app/(main)/faq/page.tsx
import { Card } from '@/components/ui/Card';

const FAQPage = () => {
  const faqs = [
    {
      question: "Who can use the RIDSR Platform?",
      answer: "The RIDSR Platform is designed for health professionals, including doctors, nurses, laboratory technicians, and public health officials in Rwanda."
    },
    {
      question: "Is the platform available offline?",
      answer: "Yes, the RIDSR Platform has offline capabilities that allow health workers to continue reporting even without internet connectivity. Data is automatically synced when connectivity is restored."
    },
    {
      question: "How is my data protected?",
      answer: "All data is encrypted and stored securely in compliance with Rwanda's data protection laws and international health data privacy standards."
    },
    {
      question: "Can I access the platform from my mobile device?",
      answer: "Yes, the RIDSR Platform is built as a Progressive Web App (PWA) and can be accessed from any device with a modern browser."
    },
    {
      question: "What types of diseases should I report?",
      answer: "You should report any suspected or confirmed cases of epidemic-prone diseases as defined by the Ministry of Health guidelines."
    },
    {
      question: "How often should I submit reports?",
      answer: "Routine surveillance reports should be submitted weekly. Immediate notification is required for certain epidemic-prone diseases."
    }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-8">Find answers to common questions about the RIDSR Platform.</p>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">About RIDSR Platform</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The Rwanda National Integrated Disease Surveillance and Response (RIDSR) Platform is a digital solution
            designed to strengthen disease surveillance and response capabilities across Rwanda.
          </p>
        </Card>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-6">
              <h3 className="text-base font-semibold text-foreground mb-2">{faq.question}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
            </Card>
          ))}
        </div>

        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-3">Need More Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you have additional questions that are not answered here, please contact our support team.
          </p>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-sm font-medium text-foreground">Email Support</p>
              <p className="text-sm text-muted-foreground">support@ridsr.rw</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Phone</p>
              <p className="text-sm text-muted-foreground">+250 788 123 456</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FAQPage;
