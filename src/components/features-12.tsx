import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BoxIcon,
  ChartBarIncreasingIcon,
  ShoppingCartIcon,
  IdCard,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BorderBeam } from "@/components/magicui/border-beam";

export default function Features() {
  type ImageKey = "item-1" | "item-2" | "item-3" | "item-4";
  const [activeItem, setActiveItem] = useState<ImageKey>("item-1");

  const images = {
    "item-1": {
      image: "/charts.png",
      alt: "Inventory tracking visualization",
    },
    "item-2": {
      image: "/music.png",
      alt: "Billing system interface",
    },
    "item-3": {
      image: "/mail2.png",
      alt: "Credit management dashboard",
    },
    "item-4": {
      image: "/payments.png",
      alt: "Analytics dashboard",
    },
  };

  const features = [
    {
      id: "item-1",
      icon: <BoxIcon className="size-4" />,
      title: "Real-Time Inventory Tracking",
      description:
        "Monitor stock levels live, with automatic updates and low-stock alerts to avoid running out.",
    },
    {
      id: "item-2",
      icon: <ShoppingCartIcon className="size-4" />,
      title: "Quick & Clean Billing",
      description:
        "Generate VAT-compliant bills, print PDF receipts, and manage transactions in seconds.",
    },
    {
      id: "item-3",
      icon: <IdCard className="size-4" />,
      title: "Udhaar (Credit) Management",
      description:
        "Track who owes you, how much, and when—with partial payments and balance tracking built-in.",
    },
    {
      id: "item-4",
      icon: <ChartBarIncreasingIcon className="size-4" />,
      title: "Profit & Performance Insights",
      description:
        "Get insights on best-selling products, profit margins, and supplier performance to boost your business decisions.",
    },
  ];

  return (
    <section className="py-12 md:py-20 lg:py-32">
      <div className="bg-linear-to-b absolute inset-0 -z-10 sm:inset-6 sm:rounded-b-3xl dark:block dark:to-[color-mix(in_oklab,var(--color-zinc-900)_75%,var(--color-background))]"></div>
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16 lg:space-y-20 dark:[--color-border:color-mix(in_oklab,var(--color-white)_10%,transparent)]">
        <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-6xl">
            Manage Stock. Track Sales. Grow Smart.
          </h2>
          <p>
            <strong>HisaabPlus</strong> is a smart and intuitive Inventory
            Management System built for Nepali businesses. From keeping track of
            stock and sales to managing suppliers and daily udhaar, it gives you
            full control of your shop — with local context and VAT-ready
            billing.
          </p>
        </div>

        <div className="grid gap-12 sm:px-12 md:grid-cols-2 lg:gap-20 lg:px-0">
          <Accordion
            type="single"
            value={activeItem}
            onValueChange={(value) => setActiveItem(value as ImageKey)}
            className="w-full"
          >
            {features.map((feature) => (
              <AccordionItem key={feature.id} value={feature.id}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2 text-base">
                    {feature.icon}
                    {feature.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent>{feature.description}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="bg-background relative flex overflow-hidden rounded-3xl border p-2">
            <div className="w-15 absolute inset-0 right-0 ml-auto border-l bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]"></div>
            <div className="aspect-76/59 bg-background relative w-[calc(3/4*100%+3rem)] rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeItem}-id`}
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="size-full overflow-hidden rounded-2xl border bg-zinc-900 shadow-md"
                >
                  <img
                    src={images[activeItem].image}
                    className="size-full object-cover object-left-top dark:mix-blend-lighten"
                    alt={images[activeItem].alt}
                    width={1207}
                    height={929}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <BorderBeam
              duration={6}
              size={200}
              className="from-transparent via-yellow-700 to-transparent dark:via-white/50"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
