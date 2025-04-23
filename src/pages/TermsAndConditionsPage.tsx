import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Printer } from "lucide-react";
export default function TermsAndConditions() {
  const [showEffectiveDate, setShowEffectiveDate] = useState(true);
  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleString("default", {
    month: "long",
  })} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">
                Terms and Conditions
              </CardTitle>
              <CardDescription>
                HisaabPlus Inventory Management System
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
          {showEffectiveDate && (
            <div className="mt-4 text-sm text-muted-foreground">
              Effective Date: {formattedDate}
            </div>
          )}
        </CardHeader>

        <Tabs defaultValue="terms">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="terms">Terms of Service</TabsTrigger>
              <TabsTrigger value="display">Display Options</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="terms" className="p-0">
            <CardContent className="pt-6" id="terms-content">
              <div className="space-y-6 text-sm">
                <section>
                  <h2 className="text-xl font-semibold mb-2">
                    1. Introduction
                  </h2>
                  <p>
                    Welcome to HisaabPlus ("we," "our," or "us"). These Terms
                    and Conditions govern your access to and use of the
                    HisaabPlus Inventory Management System, including any
                    updates, new features, and services (collectively, the
                    "Service").
                  </p>
                  <p className="mt-2">
                    By accessing or using HisaabPlus, you agree to be bound by
                    these Terms and Conditions. If you do not agree to these
                    terms, please do not use our Service.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-2">2. Definitions</h2>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>"Account"</strong> means a unique account created
                      for you to access our Service.
                    </li>
                    <li>
                      <strong>"User"</strong> refers to individuals who access
                      or use the Service.
                    </li>
                    <li>
                      <strong>"Content"</strong> refers to any data, text,
                      information, or material you upload, store, or generate
                      through your use of the Service.
                    </li>
                    <li>
                      <strong>"Subscription"</strong> refers to the purchase of
                      access to use the Service for a specified period.
                    </li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-2">
                    3. Account Registration
                  </h2>
                  <p>
                    To use certain features of the Service, you must register
                    for an account. When you register, you agree to:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Provide accurate, current, and complete information</li>
                    <li>
                      Maintain and promptly update your account information
                    </li>
                    <li>Keep your password secure and confidential</li>
                    <li>
                      Notify us immediately of any unauthorized access to your
                      account
                    </li>
                    <li>
                      Be responsible for all activities that occur under your
                      account
                    </li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-2">
                    4. Subscription and Payments
                  </h2>
                  <p>
                    HisaabPlus offers various subscription plans. By selecting a
                    subscription plan, you agree to pay all fees associated with
                    the plan you choose.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>
                      Subscription fees are billed in advance on a recurring
                      basis
                    </li>
                    <li>
                      You authorize us to charge your payment method for the
                      subscription fees
                    </li>
                    <li>
                      All fees are exclusive of taxes unless stated otherwise
                    </li>
                    <li>
                      We reserve the right to change subscription fees upon
                      reasonable notice
                    </li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-2">
                    5. User Content
                  </h2>
                  <p>
                    You retain all rights to your Content. By uploading Content
                    to the Service, you grant us a non-exclusive, worldwide,
                    royalty-free license to use, copy, and display your Content
                    solely for the purpose of providing the Service to you.
                  </p>
                  <p className="mt-2">
                    You are solely responsible for your Content and agree not to
                    upload any Content that:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Infringes on intellectual property rights</li>
                    <li>Contains malicious code or viruses</li>
                    <li>Violates any applicable law or regulation</li>
                    <li>Is defamatory, obscene, or otherwise objectionable</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-2">
                    6. Data Security and Privacy
                  </h2>
                  <p>
                    We implement reasonable security measures to protect your
                    data. For more information about how we collect, use, and
                    disclose your information, please see our{" "}
                    <a
                      href="/privacy-policy"
                      className="text-primary underline"
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-2">
                    7. Intellectual Property
                  </h2>
                  <p>
                    The HisaabPlus Service, including its original content,
                    features, and functionality, is owned by us and is protected
                    by copyright, trademark, and other intellectual property
                    laws.
                  </p>
                  <p className="mt-2">
                    Our trademarks and trade dress may not be used in connection
                    with any product or service without our prior written
                    consent.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-2">
                    8. Limitation of Liability
                  </h2>
                  <p>
                    To the maximum extent permitted by law, we shall not be
                    liable for any indirect, incidental, special, consequential,
                    or punitive damages, or any loss of profits or revenues,
                    whether incurred directly or indirectly.
                  </p>
                  <p className="mt-2">
                    Our liability for any claim arising out of or relating to
                    these Terms shall be limited to the greater of $100 or the
                    amount you paid us in the 12 months preceding the claim.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-2">9. Termination</h2>
                  <p>
                    We may terminate or suspend your account and access to the
                    Service immediately, without prior notice or liability, for
                    any reason, including but not limited to a breach of these
                    Terms.
                  </p>
                  <p className="mt-2">
                    Upon termination, your right to use the Service will
                    immediately cease. All provisions of these Terms which by
                    their nature should survive termination shall survive.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-2">
                    10. Changes to Terms
                  </h2>
                  <p>
                    We reserve the right to modify these Terms at any time. We
                    will provide notice of any material changes by posting the
                    new Terms on the Service and updating the "Effective Date"
                    at the top.
                  </p>
                  <p className="mt-2">
                    Your continued use of the Service after any such changes
                    constitutes your acceptance of the new Terms.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-2">
                    11. Governing Law
                  </h2>
                  <p>
                    These Terms shall be governed by and construed in accordance
                    with the laws of [Your Jurisdiction], without regard to its
                    conflict of law provisions.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-2">12. Contact Us</h2>
                  <p>
                    If you have any questions about these Terms, please contact
                    us at:
                  </p>
                  <p className="mt-2">
                    HisaabPlus Support
                    <br />
                    Email: support@hisaabplus.com
                    <br />
                    Phone: [Your Phone Number]
                  </p>
                </section>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="display">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-date" className="flex flex-col">
                    <span>Show Effective Date</span>
                    <span className="text-sm text-muted-foreground">
                      Display the current date as the effective date
                    </span>
                  </Label>
                  <Switch
                    id="show-date"
                    checked={showEffectiveDate}
                    onCheckedChange={setShowEffectiveDate}
                  />
                </div>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>

        <CardFooter className="flex justify-between text-sm text-muted-foreground border-t pt-6">
          <p>HisaabPlus Inventory Management System</p>
          <p>© {new Date().getFullYear()} HisaabPlus. All rights reserved.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
