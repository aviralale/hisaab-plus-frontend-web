import { Button } from "@/components/ui/button";
import HomePageLayout from "@/layout/HomePageLayout";
import { ChevronRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export const AboutPage: React.FC = () => {
  return (
    <HomePageLayout>
      <section className="py-16 md:py-32">
        <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
          <img
            className="rounded-2xl grayscale"
            src="https://images.unsplash.com/photo-1444988510113-d8e9c6741202"
            alt="Inventory warehouse"
            loading="lazy"
          />

          <div className="grid gap-6 md:grid-cols-2 md:gap-12">
            <h2 className="text-4xl font-semibold">
              Powering Smarter Inventory for Businesses in Nepal
            </h2>
            <div className="space-y-6">
              <p>
                Our Inventory Management System (IMS) is designed to simplify
                stock tracking, sales management, udhaar (credit) records, and
                more — all in one place. Whether you're running a small shop or
                a growing business, IMS helps you stay organized and in control.
              </p>
              <p>
                With features like Nepali Calendar integration, customizable
                stock entries, real-time sales insights, and VAT bill
                generation, IMS is built with local business needs in mind.
              </p>

              <Button
                asChild
                variant="secondary"
                size="sm"
                className="gap-1 pr-1.5"
              >
                <Link to="/features">
                  <span>Explore Features</span>
                  <ChevronRight className="size-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </HomePageLayout>
  );
};
