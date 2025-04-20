import {
  Barcode,
  QrCode,
  CalendarDays,
  FileSpreadsheet,
  FileBarChart2,
  Receipt,
  Landmark,
} from "lucide-react";
import LogoIcon from "@/assets/images/favicon-white.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function IntegrationsSection() {
  return (
    <section>
      <div className="bg-muted dark:bg-background py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid items-center sm:grid-cols-2">
            <div className="dark:bg-muted/50 relative mx-auto w-fit">
              <div
                role="presentation"
                className="bg-radial to-muted dark:to-background absolute inset-0 z-10 from-transparent to-75%"
              ></div>

              <div className="mx-auto mb-2 flex w-fit justify-center gap-2">
                <IntegrationCard>
                  <FileSpreadsheet />
                </IntegrationCard>
                <IntegrationCard>
                  <FileBarChart2 />
                </IntegrationCard>
              </div>

              <div className="mx-auto my-2 flex w-fit justify-center gap-2">
                <IntegrationCard>
                  <Barcode />
                </IntegrationCard>
                <IntegrationCard
                  borderClassName="shadow-black-950/10 shadow-xl border-black/25 dark:border-white/25"
                  className="dark:bg-white/10"
                >
                  <img src={LogoIcon} alt="" />
                </IntegrationCard>
                <IntegrationCard>
                  <QrCode />
                </IntegrationCard>
              </div>

              <div className="mx-auto flex w-fit justify-center gap-2">
                <IntegrationCard>
                  <CalendarDays />
                </IntegrationCard>
                <IntegrationCard>
                  <Receipt />
                </IntegrationCard>
                <IntegrationCard>
                  <Landmark />
                </IntegrationCard>
              </div>
            </div>

            <div className="mx-auto mt-6 max-w-lg space-y-6 text-center sm:mt-0 sm:text-left">
              <h2 className="text-balance text-3xl font-semibold md:text-4xl">
                Integrate with your favorite tools
              </h2>
              <p className="text-muted-foreground">
                Connect seamlessly with accounting tools, spreadsheets, Nepali
                calendars, and barcode/QR tech to boost your workflow.
              </p>

              <Button variant="outline" size="sm" asChild>
                <Link to="/get-started">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type IntegrationCardProps = {
  children: React.ReactNode;
  className?: string;
  borderClassName?: string;
};

const IntegrationCard = ({
  children,
  className,
  borderClassName,
}: IntegrationCardProps) => {
  return (
    <div
      className={cn(
        "bg-background relative flex size-20 rounded-xl dark:bg-transparent",
        className
      )}
    >
      <div
        role="presentation"
        className={cn(
          "absolute inset-0 rounded-xl border border-black/20 dark:border-white/25",
          borderClassName
        )}
      />
      <div className="relative z-20 m-auto size-fit text-muted-foreground *:size-8">
        {children}
      </div>
    </div>
  );
};
