import HeroImg from "@/assets/images/HeroImg.png";
import HeroImgLight from "@/assets/images/HeroImgLight.png";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <>
      <section className="overflow-hidden bg-white dark:bg-transparent">
        <div className="relative mx-auto max-w-5xl px-6 py-28 lg:py-24">
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h1 className="text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">
              From Storefront to Stockroom
            </h1>
            <p className="mx-auto my-8 max-w-2xl text-xl">
              Simplifies stock control, tracks sales and suppliers, and
              efficiently manages udhaar, bills, and product performance in
              real-time.
            </p>

            <Button asChild size="lg">
              <Link to="/register">
                <span className="btn-label">Start your journey</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto -mt-16 max-w-7xl">
          <div className="perspective-distant -mr-16 pl-16 lg:-mr-56 lg:pl-56">
            <div className="[transform:rotateX(20deg);]">
              <div className="lg:h-176 relative skew-x-[.36rad]">
                <div
                  aria-hidden
                  className="bg-linear-to-b from-background to-background z-1 absolute -inset-16 via-transparent sm:-inset-32"
                />
                <div
                  aria-hidden
                  className="bg-linear-to-r from-background to-background z-1 absolute -inset-16 bg-white/50 via-transparent sm:-inset-32 dark:bg-transparent"
                />

                <div
                  aria-hidden
                  className="absolute -inset-16 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] [--color-border:var(--color-zinc-400)] sm:-inset-32 dark:[--color-border:color-mix(in_oklab,var(--color-white)_20%,transparent)]"
                />
                <div
                  aria-hidden
                  className="from-background z-11 absolute inset-0 bg-gradient-to-l"
                />
                <div
                  aria-hidden
                  className="z-2 absolute inset-0 size-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,transparent_40%,var(--color-background)_100%)]"
                />
                <div
                  aria-hidden
                  className="z-2 absolute inset-0 size-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,transparent_40%,var(--color-background)_100%)]"
                />

                <img
                  className="rounded-(--radius) z-1 relative border dark:hidden"
                  src={HeroImgLight}
                  alt="Tailark hero section"
                  width={2880}
                  height={2074}
                />
                <img
                  className="rounded-(--radius) z-1 relative hidden border dark:block"
                  src={HeroImg}
                  alt="Tailark hero section"
                  width={2880}
                  height={2074}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background relative z-10 py-16">
        <div className="m-auto max-w-5xl px-6">
          <h2 className="text-center text-lg font-medium">
            Your favorite companies are our partners.
          </h2>
          <div className="mx-auto mt-20 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-12">
            <img
              className="h-5 w-fit dark:invert"
              src="https://html.tailus.io/blocks/customers/nvidia.svg"
              alt="Nvidia Logo"
              height="20"
              width="auto"
            />
            <img
              className="h-4 w-fit dark:invert"
              src="https://html.tailus.io/blocks/customers/column.svg"
              alt="Column Logo"
              height="16"
              width="auto"
            />
            <img
              className="h-4 w-fit dark:invert"
              src="https://html.tailus.io/blocks/customers/github.svg"
              alt="GitHub Logo"
              height="16"
              width="auto"
            />
            <img
              className="h-5 w-fit dark:invert"
              src="https://html.tailus.io/blocks/customers/nike.svg"
              alt="Nike Logo"
              height="20"
              width="auto"
            />
            <img
              className="h-4 w-fit dark:invert"
              src="https://html.tailus.io/blocks/customers/laravel.svg"
              alt="Laravel Logo"
              height="16"
              width="auto"
            />
            <img
              className="h-7 w-fit dark:invert"
              src="https://html.tailus.io/blocks/customers/lilly.svg"
              alt="Lilly Logo"
              height="28"
              width="auto"
            />
            <img
              className="h-5 w-fit dark:invert"
              src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
              alt="Lemon Squeezy Logo"
              height="20"
              width="auto"
            />
            <img
              className="h-6 w-fit dark:invert"
              src="https://html.tailus.io/blocks/customers/openai.svg"
              alt="OpenAI Logo"
              height="24"
              width="auto"
            />
            <img
              className="h-4 w-fit dark:invert"
              src="https://html.tailus.io/blocks/customers/tailwindcss.svg"
              alt="Tailwind CSS Logo"
              height="16"
              width="auto"
            />
            <img
              className="h-5 w-fit dark:invert"
              src="https://html.tailus.io/blocks/customers/vercel.svg"
              alt="Vercel Logo"
              height="20"
              width="auto"
            />
            <img
              className="h-5 w-fit dark:invert"
              src="https://html.tailus.io/blocks/customers/zapier.svg"
              alt="Zapier Logo"
              height="20"
              width="auto"
            />
          </div>
        </div>
      </section>
    </>
  );
}
