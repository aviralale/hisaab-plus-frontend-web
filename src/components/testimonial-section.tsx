import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EverestRetail from "@/assets/images/Everest-Retail.png";

export default function Testimonials() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-4xl font-medium lg:text-5xl">
            Built for businesses, trusted by professionals
          </h2>
          <p className="text-muted-foreground">
            Our Inventory Management System empowers businesses to track, sell,
            and grow with confidence. Hear from those who’ve transformed their
            workflow with us.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2 [--color-card:var(--color-muted)] *:border-none *:shadow-none dark:[--color-muted:var(--color-zinc-900)]">
          <Card className="grid grid-rows-[auto_1fr] gap-8 sm:col-span-2 sm:p-6 lg:row-span-2">
            <CardHeader>
              <img
                className="h-16 w-fit dark:invert"
                src={EverestRetail}
                alt="Everest Retail Logo"
                height={24}
              />
            </CardHeader>
            <CardContent>
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p className="text-xl font-medium">
                  This IMS is a game-changer for us. Stock tracking, sales
                  reports, and expense logging—all in one place. It’s intuitive
                  and powerful.
                </p>
                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage
                      src="https://tailus.io/images/reviews/shekinah.webp"
                      alt="Shekinah Tshiokufila"
                      loading="lazy"
                    />
                    <AvatarFallback>ST</AvatarFallback>
                  </Avatar>
                  <div>
                    <cite className="text-sm font-medium">
                      Shekinah Tshiokufila
                    </cite>
                    <span className="text-muted-foreground block text-sm">
                      Retail Manager, Everest Stores
                    </span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="h-full pt-6">
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p className="text-xl font-medium">
                  Everything is seamless—from purchase entry to sales summary.
                  It cut my manual workload by 70%.
                </p>
                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage
                      src="https://tailus.io/images/reviews/jonathan.webp"
                      alt="Jonathan Yombo"
                      loading="lazy"
                    />
                    <AvatarFallback>JY</AvatarFallback>
                  </Avatar>
                  <div>
                    <cite className="text-sm font-medium">Jonathan Yombo</cite>
                    <span className="text-muted-foreground block text-sm">
                      Inventory Head, BhatBhateni
                    </span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="h-full pt-6">
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p>
                  The QR-based stock system and PDF invoice generation are
                  incredible. I use it daily.
                </p>
                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage
                      src="https://tailus.io/images/reviews/yucel.webp"
                      alt="Yucel Faruksahan"
                      loading="lazy"
                    />
                    <AvatarFallback>YF</AvatarFallback>
                  </Avatar>
                  <div>
                    <cite className="text-sm font-medium">
                      Yucel Faruksahan
                    </cite>
                    <span className="text-muted-foreground block text-sm">
                      Owner, Tailkits Mart
                    </span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="h-full pt-6">
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p>
                  It fits perfectly with Nepali calendar, VAT printing, and
                  Udhaar tracking. Couldn’t ask for more!
                </p>
                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage
                      src="https://tailus.io/images/reviews/rodrigo.webp"
                      alt="Rodrigo Aguilar"
                      loading="lazy"
                    />
                    <AvatarFallback>RA</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Rodrigo Aguilar</p>
                    <span className="text-muted-foreground block text-sm">
                      Founder, NepalMart POS
                    </span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
