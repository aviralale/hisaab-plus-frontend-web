import HomePageLayout from "@/layout/HomePageLayout";
import { Link } from "react-router-dom";

export default function FAQsPage() {
  return (
    <HomePageLayout>
      <section className="scroll-py-16 py-16 md:scroll-py-32 md:py-32 bg-muted/40">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-y-12 px-2 lg:grid-cols-[1fr_auto]">
            <div className="text-center lg:text-left">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Frequently Asked
                <br className="hidden lg:block" /> Questions
              </h2>
              <p className="text-muted-foreground max-w-md text-base">
                Can’t find the answer you’re looking for? We’ve shared some of
                our most commonly asked questions to help you out.
              </p>
            </div>

            <div className="divide-y divide-border sm:mx-auto sm:max-w-lg lg:mx-0">
              {[
                {
                  question: "What is the refund policy?",
                  answer: (
                    <>
                      We offer a 30-day money-back guarantee. If you’re not
                      satisfied with our product, reach out for a full refund.
                      <ol className="list-decimal space-y-2 pl-4 mt-4 text-sm text-muted-foreground">
                        <li>
                          Contact support with your order number and refund
                          reason.
                        </li>
                        <li>Refunds are processed within 3–5 business days.</li>
                        <li>One refund per new customer only.</li>
                      </ol>
                    </>
                  ),
                },
                {
                  question: "How do I cancel my subscription?",
                  answer:
                    "You can cancel anytime through your account settings. Just click the cancel button and follow the steps.",
                },
                {
                  question: "Can I upgrade my plan?",
                  answer: (
                    <>
                      Absolutely. Log into your account and choose your new
                      plan.
                      <ul className="list-disc pl-4 mt-4 text-sm text-muted-foreground space-y-2">
                        <li>You’ll be charged the difference instantly.</li>
                        <li>Your new plan activates immediately.</li>
                      </ul>
                    </>
                  ),
                },
                {
                  question: "Do you offer phone support?",
                  answer:
                    "Currently, we provide support via email and live chat. Our team is quick to respond and happy to help!",
                },
              ].map((faq, idx) => (
                <div key={idx} className="py-6">
                  <h3 className="font-medium text-lg">{faq.question}</h3>
                  <div className="mt-3 text-muted-foreground text-sm">
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground mt-6 px-8">
              Can't find what you're looking for? Contact our{" "}
              <Link
                to="/contact"
                className="text-primary font-medium hover:underline"
              >
                customer support team
              </Link>
            </p>
          </div>
        </div>
      </section>
    </HomePageLayout>
  );
}
