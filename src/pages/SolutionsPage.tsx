// src/pages/SolutionsPage.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Globe,
  CalendarFoldIcon,
  PrinterIcon,
  SmartphoneNfcIcon,
  ReceiptTextIcon,
  Banknote,
  Sheet,
} from "lucide-react";

import inventoryLight from "@/assets/images/ims-inventory-light.png";
import inventoryDark from "@/assets/images/ims-inventory-dark.png";
import salesLight from "@/assets/images/ims-sales-light.png";
import salesDark from "@/assets/images/ims-sales-dark.png";

import React from "react";
import HomePageLayout from "@/layout/HomePageLayout";

export const SolutionsPage: React.FC = () => {
  return (
    <HomePageLayout>
      <section className="dark:bg-muted/25 bg-zinc-50 py-16 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto grid gap-2 sm:grid-cols-5">
            {/* Inventory Management */}
            <Card className="group overflow-hidden shadow-zinc-950/5 sm:col-span-3 sm:rounded-none sm:rounded-tl-xl">
              <CardHeader>
                <div className="md:p-6">
                  <p className="font-medium">Real-time Inventory Management</p>
                  <p className="text-muted-foreground mt-3 max-w-sm text-sm">
                    Track incoming and outgoing stock instantly, with alerts for
                    low stock and expiry.
                  </p>
                </div>
              </CardHeader>
              <div className="relative h-fit pl-6 md:pl-12">
                <div className="absolute -inset-6 [background:radial-gradient(75%_95%_at_50%_0%,transparent,var(--color-background)_100%)]" />
                <div className="bg-background overflow-hidden rounded-tl-lg border-l border-t pl-2 pt-2 dark:bg-zinc-950">
                  <img
                    src={inventoryDark}
                    className="hidden dark:block"
                    alt="Inventory dark"
                  />
                  <img
                    src={inventoryLight}
                    className="shadow dark:hidden"
                    alt="Inventory light"
                  />
                </div>
              </div>
            </Card>

            {/* Sales Tracking */}
            <Card className="group overflow-hidden shadow-zinc-950/5 sm:col-span-2 sm:rounded-none sm:rounded-tr-xl">
              <p className="mx-auto my-6 max-w-md text-balance px-6 text-center text-lg font-semibold sm:text-2xl md:p-6">
                View Daily Sales & Generate Reports in One Click
              </p>
              <CardContent className="mt-auto h-fit">
                <div className="relative mb-6 sm:mb-0">
                  <div className="absolute -inset-6 [background:radial-gradient(50%_75%_at_75%_50%,transparent,var(--color-background)_100%)]" />
                  <div className="aspect-76/59 overflow-hidden rounded-r-lg border">
                    <img
                      src={salesDark}
                      className="hidden dark:block"
                      alt="Sales dark"
                    />
                    <img
                      src={salesLight}
                      className="shadow dark:hidden"
                      alt="Sales light"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Udhaar */}
            <Card className="group p-6 shadow-zinc-950/5 sm:col-span-2 sm:rounded-none sm:rounded-bl-xl md:p-12">
              <p className="mx-auto mb-12 max-w-md text-balance text-center text-lg font-semibold sm:text-2xl">
                Simplified Udhaar (Credit) Management
              </p>
              <div className="flex justify-center gap-6">
                <div className="inset-shadow-sm dark:inset-shadow-white/5 bg-muted/35 relative flex aspect-square size-16 items-center rounded-[7px] border p-3 shadow-lg ring dark:shadow-white/5 dark:ring-black">
                  <span className="absolute right-2 top-1 block text-sm">
                    <Banknote />
                  </span>
                  <Globe className="mt-auto size-4" />
                </div>
                <div className="inset-shadow-sm dark:inset-shadow-white/5 bg-muted/35 flex aspect-square size-16 items-center justify-center rounded-[7px] border p-3 shadow-lg ring dark:shadow-white/5 dark:ring-black">
                  <span role="img" aria-label="Invoice">
                    <ReceiptTextIcon />
                  </span>
                </div>
              </div>
            </Card>

            {/* Nepali Calendar & Integration */}
            {/* Nepali Calendar & Smart Integrations */}
            <Card className="group relative shadow-zinc-950/5 sm:col-span-3 sm:rounded-none sm:rounded-br-xl">
              <CardHeader className="p-6 md:p-12">
                <p className="font-medium">
                  Smart Integrations with Nepali Calendar Support
                </p>
                <p className="text-muted-foreground mt-2 max-w-md text-sm">
                  Seamlessly operate with Bikram Sambat (BS) calendar and
                  integrate devices like printers, POS systems, QR-based
                  payments, and mobile invoicing tools for a smarter business
                  workflow.
                </p>
              </CardHeader>
              <CardContent className="relative h-fit px-6 pb-6 md:px-12 md:pb-12">
                <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
                  {/* Empty placeholder cells to maintain staggered layout */}

                  <div className="rounded-lg bg-muted/50 flex aspect-square items-center justify-center border p-4">
                    <Sheet className="size-8" />
                  </div>

                  <div className="rounded-lg bg-muted/50 flex aspect-square items-center justify-center border p-4">
                    <CalendarFoldIcon className="size-8" />
                  </div>

                  <div className="rounded-lg bg-muted/50 flex aspect-square items-center justify-center border p-4">
                    <PrinterIcon className="size-8" />
                  </div>

                  <div className="rounded-lg bg-muted/50 flex aspect-square items-center justify-center border p-4">
                    <SmartphoneNfcIcon className="size-8" />
                  </div>

                  <div className="rounded-lg bg-muted/50 flex aspect-square items-center justify-center border p-4">
                    <ReceiptTextIcon className="size-8" />
                  </div>

                  <div className="rounded-lg bg-muted/50 flex aspect-square items-center justify-center border p-4">
                    <Globe className="size-8" />
                  </div>

                  {/* You can add more icons here in future */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </HomePageLayout>
  );
};
