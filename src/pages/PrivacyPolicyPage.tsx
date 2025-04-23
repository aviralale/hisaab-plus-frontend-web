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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Printer, Shield } from "lucide-react";

export default function PrivacyPolicy() {
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
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl font-bold">
                  Privacy Policy
                </CardTitle>
                <CardDescription>
                  HisaabPlus Inventory Management System
                </CardDescription>
              </div>
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

        <Tabs defaultValue="policy">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="policy">Privacy Policy</TabsTrigger>
              <TabsTrigger value="display">Display Options</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="policy" className="p-0">
            <CardContent className="pt-6" id="privacy-content">
              <div className="space-y-6 text-sm">
                <section>
                  <p className="mb-6">
                    This Privacy Policy describes how HisaabPlus ("we," "our,"
                    or "us") collects, uses, and discloses your information when
                    you use our Inventory Management System (the "Service"). By
                    using HisaabPlus, you agree to the collection and use of
                    information in accordance with this policy.
                  </p>
                </section>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="information-collection">
                    <AccordionTrigger>
                      <h2 className="text-lg font-semibold">
                        Information Collection and Use
                      </h2>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>
                        We collect several different types of information for
                        various purposes to provide and improve our Service to
                        you:
                      </p>

                      <h3 className="font-medium mt-4">Personal Data</h3>
                      <p>
                        While using our Service, we may ask you to provide us
                        with certain personally identifiable information that
                        can be used to contact or identify you ("Personal
                        Data"). This may include, but is not limited to:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Email address</li>
                        <li>First name and last name</li>
                        <li>Business name</li>
                        <li>Phone number</li>
                        <li>Address, State, Province, ZIP/Postal code, City</li>
                        <li>Payment information</li>
                      </ul>

                      <h3 className="font-medium mt-4">Usage Data</h3>
                      <p>
                        We may also collect information on how the Service is
                        accessed and used ("Usage Data"). This Usage Data may
                        include information such as your computer's Internet
                        Protocol address (e.g., IP address), browser type,
                        browser version, the pages of our Service that you
                        visit, the time and date of your visit, the time spent
                        on those pages, unique device identifiers, and other
                        diagnostic data.
                      </p>

                      <h3 className="font-medium mt-4">
                        Inventory and Business Data
                      </h3>
                      <p>
                        As an inventory management system, HisaabPlus collects
                        and stores data related to your inventory, products,
                        customers, vendors, transactions, and other business
                        operations that you input into the system.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="data-usage">
                    <AccordionTrigger>
                      <h2 className="text-lg font-semibold">Use of Data</h2>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>
                        HisaabPlus uses the collected data for various purposes:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>To provide and maintain our Service</li>
                        <li>To notify you about changes to our Service</li>
                        <li>
                          To allow you to participate in interactive features of
                          our Service when you choose to do so
                        </li>
                        <li>To provide customer support</li>
                        <li>
                          To gather analysis or valuable information so that we
                          can improve our Service
                        </li>
                        <li>To monitor the usage of our Service</li>
                        <li>To detect, prevent and address technical issues</li>
                        <li>To process payments and fulfill transactions</li>
                        <li>
                          To provide you with news, special offers, and general
                          information about other goods, services, and events
                          which we offer that are similar to those that you have
                          already purchased or enquired about unless you have
                          opted not to receive such information
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="data-storage">
                    <AccordionTrigger>
                      <h2 className="text-lg font-semibold">
                        Data Storage and Transfer
                      </h2>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>
                        Your information, including Personal Data, may be
                        transferred to — and maintained on — computers located
                        outside of your state, province, country, or other
                        governmental jurisdiction where the data protection laws
                        may differ from those of your jurisdiction.
                      </p>
                      <p className="mt-2">
                        If you are located outside [Your Country] and choose to
                        provide information to us, please note that we transfer
                        the data, including Personal Data, to [Your Country] and
                        process it there.
                      </p>
                      <p className="mt-2">
                        Your consent to this Privacy Policy followed by your
                        submission of such information represents your agreement
                        to that transfer.
                      </p>
                      <p className="mt-2">
                        HisaabPlus will take all the steps reasonably necessary
                        to ensure that your data is treated securely and in
                        accordance with this Privacy Policy and no transfer of
                        your Personal Data will take place to an organization or
                        a country unless there are adequate controls in place
                        including the security of your data and other personal
                        information.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="data-disclosure">
                    <AccordionTrigger>
                      <h2 className="text-lg font-semibold">
                        Disclosure of Data
                      </h2>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <h3 className="font-medium">Legal Requirements</h3>
                      <p>
                        HisaabPlus may disclose your Personal Data in the good
                        faith belief that such action is necessary to:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>To comply with a legal obligation</li>
                        <li>
                          To protect and defend the rights or property of
                          HisaabPlus
                        </li>
                        <li>
                          To prevent or investigate possible wrongdoing in
                          connection with the Service
                        </li>
                        <li>
                          To protect the personal safety of users of the Service
                          or the public
                        </li>
                        <li>To protect against legal liability</li>
                      </ul>

                      <h3 className="font-medium mt-4">Business Transaction</h3>
                      <p>
                        If HisaabPlus is involved in a merger, acquisition or
                        asset sale, your Personal Data may be transferred. We
                        will provide notice before your Personal Data is
                        transferred and becomes subject to a different Privacy
                        Policy.
                      </p>

                      <h3 className="font-medium mt-4">Service Providers</h3>
                      <p>
                        We may employ third-party companies and individuals to
                        facilitate our Service ("Service Providers"), provide
                        the Service on our behalf, perform Service-related
                        services, or assist us in analyzing how our Service is
                        used.
                      </p>
                      <p className="mt-2">
                        These third parties have access to your Personal Data
                        only to perform these tasks on our behalf and are
                        obligated not to disclose or use it for any other
                        purpose.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="security">
                    <AccordionTrigger>
                      <h2 className="text-lg font-semibold">
                        Security of Data
                      </h2>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>
                        The security of your data is important to us, but
                        remember that no method of transmission over the
                        Internet or method of electronic storage is 100% secure.
                        While we strive to use commercially acceptable means to
                        protect your Personal Data, we cannot guarantee its
                        absolute security.
                      </p>
                      <p className="mt-2">
                        We implement a variety of security measures to maintain
                        the safety of your personal information when you enter,
                        submit, or access your personal information, including:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>
                          All sensitive/credit information you supply is
                          encrypted via Secure Socket Layer (SSL) technology.
                        </li>
                        <li>
                          We implement advanced authentication methods,
                          including multi-factor authentication.
                        </li>
                        <li>
                          Regular security audits and penetration testing.
                        </li>
                        <li>
                          Employee access controls and training on data security
                          practices.
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="data-rights">
                    <AccordionTrigger>
                      <h2 className="text-lg font-semibold">
                        Your Data Protection Rights
                      </h2>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>
                        Depending on your location, you may have certain data
                        protection rights. HisaabPlus aims to take reasonable
                        steps to allow you to correct, amend, delete, or limit
                        the use of your Personal Data.
                      </p>
                      <p className="mt-2">You have the right to:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>
                          <strong>Access</strong>: You can request copies of
                          your personal data.
                        </li>
                        <li>
                          <strong>Rectification</strong>: You can request that
                          we correct inaccurate personal data.
                        </li>
                        <li>
                          <strong>Erasure</strong>: You can request that we
                          delete your personal data.
                        </li>
                        <li>
                          <strong>Restrict processing</strong>: You can request
                          that we restrict the processing of your data.
                        </li>
                        <li>
                          <strong>Data portability</strong>: You can request
                          that we transfer your data to another organization.
                        </li>
                        <li>
                          <strong>Object to processing</strong>: You have the
                          right to object to our processing of your personal
                          data.
                        </li>
                      </ul>
                      <p className="mt-2">
                        If you wish to exercise any of these rights, please
                        contact us at privacy@hisaabplus.com.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="cookies">
                    <AccordionTrigger>
                      <h2 className="text-lg font-semibold">
                        Cookies and Tracking
                      </h2>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>
                        We use cookies and similar tracking technologies to
                        track the activity on our Service and hold certain
                        information.
                      </p>
                      <p className="mt-2">
                        Cookies are files with a small amount of data which may
                        include an anonymous unique identifier. Cookies are sent
                        to your browser from a website and stored on your
                        device. Other tracking technologies are also used such
                        as beacons, tags, and scripts to collect and track
                        information and to improve and analyze our Service.
                      </p>
                      <p className="mt-2">
                        You can instruct your browser to refuse all cookies or
                        to indicate when a cookie is being sent. However, if you
                        do not accept cookies, you may not be able to use some
                        portions of our Service.
                      </p>
                      <p className="mt-2">Examples of Cookies we use:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>
                          <strong>Session Cookies</strong>: We use Session
                          Cookies to operate our Service.
                        </li>
                        <li>
                          <strong>Preference Cookies</strong>: We use Preference
                          Cookies to remember your preferences and various
                          settings.
                        </li>
                        <li>
                          <strong>Security Cookies</strong>: We use Security
                          Cookies for security purposes.
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="changes">
                    <AccordionTrigger>
                      <h2 className="text-lg font-semibold">
                        Changes to This Privacy Policy
                      </h2>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>
                        We may update our Privacy Policy from time to time. We
                        will notify you of any changes by posting the new
                        Privacy Policy on this page and updating the "effective
                        date" at the top of this Privacy Policy.
                      </p>
                      <p className="mt-2">
                        You are advised to review this Privacy Policy
                        periodically for any changes. Changes to this Privacy
                        Policy are effective when they are posted on this page.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="contact">
                    <AccordionTrigger>
                      <h2 className="text-lg font-semibold">Contact Us</h2>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>
                        If you have any questions about this Privacy Policy,
                        please contact us:
                      </p>
                      <ul className="space-y-1 mt-2">
                        <li>By email: privacy@hisaabplus.com</li>
                        <li>By phone: [Your Phone Number]</li>
                        <li>By mail: [Your Physical Address]</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="display">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="policy-show-date" className="flex flex-col">
                    <span>Show Effective Date</span>
                    <span className="text-sm text-muted-foreground">
                      Display the current date as the effective date
                    </span>
                  </Label>
                  <Switch
                    id="policy-show-date"
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
