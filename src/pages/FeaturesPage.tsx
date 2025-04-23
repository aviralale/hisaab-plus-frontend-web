import HomePageLayout from "@/layout/HomePageLayout";
import {
  Boxes,
  ReceiptText,
  BarChart2,
  Banknote,
  CalendarClock,
  Settings,
} from "lucide-react";

export default function FeaturesPage() {
  return (
    <HomePageLayout>
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
          <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
            <h2 className="text-balance text-4xl font-medium lg:text-5xl">
              Streamline Your Inventory with Smart Management
            </h2>
            <p>
              Hisaab Plus IMS gives you full control of your stock, sales,
              udhaar, and billing — all in one powerful and easy-to-use
              dashboard.
            </p>
          </div>

          <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Boxes className="size-4" />
                <h3 className="text-sm font-medium">Inventory Tracking</h3>
              </div>
              <p className="text-sm">
                Keep real-time track of product quantities, categories, and
                stock entries.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ReceiptText className="size-4" />
                <h3 className="text-sm font-medium">Sales & Billing</h3>
              </div>
              <p className="text-sm">
                Generate VAT-compliant bills and manage sales seamlessly.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Banknote className="size-4" />
                <h3 className="text-sm font-medium">Udhaar Management</h3>
              </div>
              <p className="text-sm">
                Track credits and payments with customers using detailed udhaar
                logs.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="size-4" />
                <h3 className="text-sm font-medium">Analytics</h3>
              </div>
              <p className="text-sm">
                Visualize performance with sales graphs, stock insights, and
                profit reports.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarClock className="size-4" />
                <h3 className="text-sm font-medium">Nepali Calendar Support</h3>
              </div>
              <p className="text-sm">
                Fully integrated with Nepali calendar for accurate local date
                tracking.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Settings className="size-4" />
                <h3 className="text-sm font-medium">Customizable Settings</h3>
              </div>
              <p className="text-sm">
                Adapt the system to your business needs with flexible
                configurations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </HomePageLayout>
  );
}
