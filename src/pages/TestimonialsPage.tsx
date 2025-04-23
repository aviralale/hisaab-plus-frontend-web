import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import HomePageLayout from "@/layout/HomePageLayout";

type Testimonial = {
  name: string;
  role: string;
  image: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Prakash Shrestha",
    role: "Grocery Store Owner, Pokhara",
    image: "https://randomuser.me/api/portraits/men/20.jpg",
    quote:
      "The IMS system has made it incredibly easy to manage my stock and udhaar records. It saves me hours every week!",
  },
  {
    name: "Aayush Bista",
    role: "Retail Manager, Kathmandu",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    quote:
      "I was always stressed during VAT filing. With IMS’s VAT bill feature, everything’s just one click away!",
  },
  {
    name: "Mina Karki",
    role: "Clothing Store Owner, Biratnagar",
    image: "https://randomuser.me/api/portraits/women/24.jpg",
    quote:
      "Love the Nepali calendar support! It matches our day-to-day usage and feels truly local.",
  },
  {
    name: "Suraj Maharjan",
    role: "Wholesale Supplier, Lalitpur",
    image: "https://randomuser.me/api/portraits/men/30.jpg",
    quote:
      "IMS is the best investment I’ve made for my business. I can finally keep track of sales, stock, and due payments in one place.",
  },
  {
    name: "Rita Sharma",
    role: "Stationery Shop Owner, Chitwan",
    image: "https://randomuser.me/api/portraits/women/26.jpg",
    quote:
      "Before IMS, I was using a diary for udhaar. Now everything is digital and secure!",
  },
  {
    name: "Bibek Acharya",
    role: "Pharmacy Owner, Dharan",
    image: "https://randomuser.me/api/portraits/men/31.jpg",
    quote:
      "IMS has completely changed how I handle inventory. From expiry tracking to easy billing, it covers everything.",
  },
];

const chunkArray = (
  array: Testimonial[],
  chunkSize: number
): Testimonial[][] => {
  const result: Testimonial[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

const testimonialChunks = chunkArray(
  testimonials,
  Math.ceil(testimonials.length / 3)
);

export default function TestimonialsPage() {
  return (
    <HomePageLayout>
      <div className="py-16 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-title text-3xl font-semibold">Wall of Love</h2>
            <p className="text-body mt-6 text-muted-foreground">
              Business owners across Nepal are transforming how they manage
              their inventory with IMS.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
            {testimonialChunks.map((chunk, chunkIndex) => (
              <div key={chunkIndex} className="space-y-3">
                {chunk.map(({ name, role, quote, image }, index) => (
                  <Card key={index}>
                    <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6">
                      <Avatar className="size-9">
                        <AvatarImage alt={name} src={image} loading="lazy" />
                        <AvatarFallback>
                          {name.split(" ")[0][0]}
                          {name.split(" ")[1][0]}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-medium">{name}</h3>
                        <span className="text-muted-foreground block text-sm tracking-wide">
                          {role}
                        </span>
                        <blockquote className="mt-3">
                          <p className="text-gray-700 dark:text-gray-300">
                            {quote}
                          </p>
                        </blockquote>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </HomePageLayout>
  );
}
