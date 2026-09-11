import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata = { title: "Contact | Wear The Originals" };

export default function ContactPage() {
  return (
    <ContentPage title="Contact Wear The Originals">
      <ContentSection heading="Customer Support">
        <p>
          Have a question about a product, order, customization, or anything
          else? Our team is here to help.
        </p>
        <p>
          Email:{" "}
          <a
            href="mailto:contact@weartheoriginals.com"
            className="text-espresso stitch-underline"
          >
            contact@weartheoriginals.com
          </a>
        </p>
        <p>
          Alternative Email:{" "}
          <a
            href="mailto:weartheoriginals@gmail.com"
            className="text-espresso stitch-underline"
          >
            weartheoriginals@gmail.com
          </a>
        </p>
        <p>
          For order-related inquiries, please include your order number so we
          can assist you more efficiently.
        </p>
      </ContentSection>

      <ContentSection heading="Customization">
        <p>
          Interested in a customized leather piece? Visit our{" "}
          <a href="/customization" className="text-espresso stitch-underline">
            Customization
          </a>{" "}
          page to get started.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
