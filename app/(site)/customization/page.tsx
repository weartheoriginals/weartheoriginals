import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata = { title: "Customization | Wear The Originals" };

export default function CustomizationPage() {
  return (
    <ContentPage title="Made for You">
      <ContentSection heading="Customization">
        <p>Interested in creating a customized leather piece?</p>
        <p>
          Contact us with your requirements, including the product, preferred
          design, size, color, finish, or personalization you have in mind. Our
          team will review your request and let you know what options are
          available.
        </p>
        <p>
          Once a customized order has entered production, changes or
          cancellations may not be possible. Customized products may also be
          subject to different return and refund conditions.
        </p>
      </ContentSection>

      <ContentSection heading="Get in Touch">
        <p>
          Email us at{" "}
          <a
            href="mailto:contact@weartheoriginals.com"
            className="text-espresso stitch-underline"
          >
            contact@weartheoriginals.com
          </a>{" "}
          with your customization request.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
