import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HomePageLayout from "@/layout/HomePageLayout";

const ContactPage: React.FC = () => {
  // Form submission handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log("Form submitted");
  };

  return (
    <HomePageLayout>
      <section className="py-32 bg-muted/40">
        <div className="mx-auto max-w-4xl px-4 lg:px-0">
          <h1 className="mb-12 text-center text-4xl font-semibold lg:text-5xl">
            Need Help? Let's Talk.
          </h1>

          <div className="grid divide-y border md:grid-cols-2 md:gap-4 md:divide-x md:divide-y-0">
            <div className="flex flex-col justify-between space-y-6 p-6 sm:p-12">
              <div>
                <h2 className="text-lg font-semibold">Collaborations</h2>
                <a
                  href="mailto:hello@tailus.io"
                  className="text-lg text-blue-600 hover:underline dark:text-blue-400"
                >
                  hello@hisaabplus.com
                </a>
                <p className="mt-2 text-sm text-muted-foreground">
                  Let's build something together.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-6 p-6 sm:p-12">
              <div>
                <h2 className="text-lg font-semibold">Help & Discussions</h2>
                <a
                  href="mailto:press@tailus.io"
                  className="text-lg text-blue-600 hover:underline dark:text-blue-400"
                >
                  help@hisaabplus.com
                </a>
                <p className="mt-2 text-sm text-muted-foreground">
                  For helps regarding usage of platform.
                </p>
              </div>
            </div>
          </div>

          <div className="h-3 border-x bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)] my-12"></div>

          <form
            onSubmit={handleSubmit}
            className="border px-4 py-12 lg:px-0 lg:py-24"
          >
            <Card className="mx-auto max-w-lg p-8 sm:p-16">
              <h3 className="text-xl font-semibold">
                Let's Get You to the Right Place
              </h3>
              <p className="mt-4 text-sm text-muted-foreground">
                Reach out to our team – we're excited to learn about your goals!
              </p>

              <div className="mt-12 space-y-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" required />
                </div>
                <div>
                  <Label htmlFor="email">Work Email</Label>
                  <Input type="email" id="email" required />
                </div>
                <div>
                  <Label htmlFor="country">Country/Region</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nepal">Nepal</SelectItem>
                      <SelectItem value="india">India</SelectItem>
                      <SelectItem value="china">China</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="website">Company Website</Label>
                  <Input id="website" type="url" />
                </div>
                <div>
                  <Label htmlFor="job">Job Function</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job function" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">
                        Manufacturing
                      </SelectItem>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="more">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="msg">Message</Label>
                  <Textarea
                    id="msg"
                    rows={4}
                    placeholder="Let us know how we can help…"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Submit
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </section>
    </HomePageLayout>
  );
};

export default ContactPage;
