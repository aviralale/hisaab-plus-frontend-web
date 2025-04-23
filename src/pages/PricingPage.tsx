// src/pages/Pricing.tsx
import { Button } from "@/components/ui/button";
import HomePageLayout from "@/layout/HomePageLayout";
import { Check } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export const PricingPage: React.FC = () => {
  return (
    <HomePageLayout>
      <div className="relative py-16 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
              Smart Inventory Management for Nepali Businesses
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Specially designed for the unique needs of businesses in Nepal
            </p>
          </div>
          <div className="mt-8 md:mt-20">
            <div className="bg-card relative rounded-3xl border shadow-2xl shadow-zinc-950/5">
              <div className="grid items-center gap-12 divide-y p-12 md:grid-cols-2 md:divide-x md:divide-y-0">
                <div className="pb-12 text-center md:pb-0 md:pr-12">
                  <h3 className="text-2xl font-semibold">Business Premium</h3>
                  <p className="mt-2 text-lg">For businesses of all sizes</p>
                  <div className="mt-8 flex flex-col items-center">
                    <span className="mb-2 inline-block text-6xl font-bold">
                      <span className="text-4xl">Rs.</span>25,000
                    </span>
                    <span className="text-muted-foreground text-sm">
                      per year
                    </span>
                  </div>
                  <div className="flex justify-center mt-8">
                    <Button
                      asChild
                      size="lg"
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Link to="/signup">Get Started Now</Link>
                    </Button>
                  </div>
                  <p className="text-muted-foreground mt-12 text-sm">
                    Includes: Security, Unlimited Storage, Payment System,
                    Search Engine, and all premium features
                  </p>
                </div>
                <div className="relative">
                  <ul role="list" className="space-y-4">
                    {[
                      "Full support in both English and Nepali languages",
                      "Bill and VAT system compliant with Nepali tax regulations",
                      "Free onboarding training and setup assistance",
                      "Mobile app for managing inventory on the go",
                      "Data stored securely so you'll never loose it",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="size-4 text-orange-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground mt-6 text-sm">
                    Trusted by leading Nepali businesses:
                  </p>
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center text-sm font-medium">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <span className="text-blue-800">NT</span>
                      </div>
                      Nepal Telecom
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
                        <span className="text-red-800">SB</span>
                      </div>
                      Siddhartha Bank
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                        <span className="text-green-800">BM</span>
                      </div>
                      Big Mart
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                        <span className="text-amber-800">HJ</span>
                      </div>
                      Himalaya Java
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomePageLayout>
  );
};
