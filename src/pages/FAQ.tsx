import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'What is Annadanam?',
    a: 'Annadanam is a technology-driven platform that connects food donors with NGOs, shelters, and communities in need. Our goal is to reduce food waste while fighting hunger.',
  },
  {
    q: 'How does food donation work?',
    a: 'Simply sign up, log your surplus food with details like type, quantity, and preferred pickup time. Nearby recipients are instantly notified and can claim the donation.',
  },
  {
    q: 'Is the food safe to consume?',
    a: 'Yes. We enforce strict food safety guidelines. Donors must provide details about preparation time and storage conditions to ensure only safe, fresh food reaches recipients.',
  },
  {
    q: 'How do I track my donation?',
    a: 'Once your donation is claimed, you can track its journey in real-time on a map. You will also receive notifications when it is picked up, in transit, and delivered.',
  },
  {
    q: 'Can I donate money instead of food?',
    a: 'Absolutely! We accept monetary donations used to cover logistics, packaging, and operational costs. Visit the Donate Money page to contribute securely.',
  },
  {
    q: 'Who can sign up as a recipient?',
    a: 'NGOs, community kitchens, shelters, old-age homes, orphanages, and verified organizations can sign up as recipients. We verify all recipient organizations.',
  },
  {
    q: 'Is there a minimum quantity for donation?',
    a: 'No minimum quantity is required. Whether it is meals for 5 people or 500, every contribution counts.',
  },
  {
    q: 'How do I become a volunteer?',
    a: 'You can sign up and select the Volunteer role during registration. Volunteers help with food pickup, delivery, and quality checks in their local area.',
  },
  {
    q: 'Is my personal data safe?',
    a: 'Yes. All personal information is encrypted and stored securely. We never share your data with third parties without your consent.',
  },
  {
    q: 'How can I contact support?',
    a: 'You can reach us at info@annadanam.org or call +91 8087826047. We are available Monday to Saturday, 9 AM to 6 PM IST.',
  },
];

export default function FAQ() {
  return (
    <section className="py-20 bg-background">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">Find answers to common questions about Annadanam</p>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <AccordionItem value={`item-${i}`} className="border border-border rounded-lg px-5 bg-card">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
