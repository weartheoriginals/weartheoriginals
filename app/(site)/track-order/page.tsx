import OrderTrackingForm from "@/components/order-tracking-form";
import { CircleHelp, Clock, Mail, MapPin, Phone, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Track Your Order | Wear The Originals",
  description:
    "Enter your order number and email to check the status of your OGNLS order.",
};

const INFO_ITEMS = [
  {
    icon: Clock,
    title: "Processing Time",
    body: "Orders are processed within 4–5 business days after payment confirmation.",
  },
  {
    icon: Truck,
    title: "Shipping & Delivery",
    body: "Delivery times vary depending on your destination, shipping method and customs clearance.",
  },
  {
    icon: MapPin,
    title: "Tracking Updates",
    body: "Once your order is dispatched, tracking information will be provided where available.",
  },
  {
    icon: CircleHelp,
    title: "Need Help?",
    body: "If you haven't received your tracking details, please contact our support team.",
  },
];

export default function TrackOrderPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-85 md:h-100 overflow-hidden bg-espresso">
        <Image
          src="/images/track-order-hero.webp"
          alt="Leather bag detail with OGNLS embossed patch"
          fill
          priority
          className="object-cover"
        />
        {/* Gradient overlay so the text stays readable over the photo */}
        <div className="absolute inset-0 bg-linear-to-r from-espresso/90 via-espresso/60 to-transparent" />

        <div className="relative z-10 mx-auto max-w-350 h-full px-6 md:px-10 flex flex-col justify-center">
          <p className="text-xs text-ivory/60 mb-4">
            <Link href="/" className="hover:text-brass stitch-underline">
              Home
            </Link>{" "}
            / Order Tracking
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-ivory mb-4">
            Track Your Order
          </h1>
          <p className="text-sm md:text-base text-ivory/70 max-w-md leading-relaxed">
            Enter your order number and email address below to check the status
            of your OGNLS order.
          </p>
        </div>
      </section>

      {/* Form + status card */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-350 px-6 md:px-10 py-16">
          <OrderTrackingForm />
        </div>
      </section>

      {/* Info strip */}
      <section className="bg-ivory border-t border-espresso/10">
        <div className="mx-auto max-w-350 px-6 md:px-10 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {INFO_ITEMS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full border border-espresso/20 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-espresso" />
              </div>
              <h3 className="font-mono-label text-[10px] uppercase text-espresso mb-2">
                {title}
              </h3>
              <p className="text-xs text-umber leading-relaxed max-w-50">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact + International orders */}
      <section className="bg-ivory border-t border-espresso/10">
        <div className="mx-auto max-w-350 px-6 md:px-10 py-16 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-2xl text-espresso mb-4">
              Can&apos;t Find Your Tracking Information?
            </h2>
            <p className="text-sm text-umber leading-relaxed mb-6">
              If you have not received your tracking information after your
              order has been dispatched, please get in touch with our customer
              support team.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-espresso mt-0.5 shrink-0" />
                <div>
                  <p className="font-mono-label text-[10px] uppercase text-brass mb-1">
                    Email
                  </p>
                  <a
                    href="mailto:contact@weartheoriginals.com"
                    className="block text-sm text-umber hover:text-espresso stitch-underline"
                  >
                    contact@weartheoriginals.com
                  </a>

                  <a
                    href="mailto:weartheoriginals@gmail.com"
                    className="block text-sm text-umber hover:text-espresso stitch-underline"
                  >
                    weartheoriginals@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-espresso mt-0.5 shrink-0" />
                <div>
                  <p className="font-mono-label text-[10px] uppercase text-brass mb-1">
                    Phone
                  </p>

                  <a
                    href="tel:+966566403192"
                    className="block text-sm text-umber hover:text-espresso stitch-underline"
                  >
                    +966 56 640 3192
                  </a>
                </div>
              </div>
            </div>

            <hr className="stitch-divider my-6" />

            <p className="text-xs text-umber/70">
              Please include your order number so we can assist you more
              efficiently.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-espresso mb-4">
              International Orders
            </h2>
            <p className="text-sm text-umber leading-relaxed mb-6">
              Delivery dates and tracking updates are provided by the relevant
              shipping carrier. International orders may experience additional
              delays due to customs clearance, carrier delays, weather, or other
              circumstances beyond our control.
            </p>

            <div className="relative aspect-video border border-espresso/10 rounded-2xl overflow-hidden">
              <Image
                src="/images/international-orders.jpg"
                alt="OGNLS branded leather hang tag"
                fill
                className="object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-linear-to-t from-espresso/30 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
