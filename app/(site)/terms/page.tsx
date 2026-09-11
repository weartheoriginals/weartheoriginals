import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata = { title: "Terms & Conditions | Wear The Originals" };

export default function TermsPage() {
  return (
    <ContentPage title="Terms & Conditions">
      <ContentSection heading="Welcome">
        <p>
          Welcome to Wear The Originals (OGNLS). By accessing or using our
          website and purchasing our products, you agree to be bound by these
          Terms & Conditions.
        </p>
      </ContentSection>

      <ContentSection heading="1. Products">
        <p>We offer leather products including:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Men's Jackets</li>
          <li>Women's Jackets</li>
          <li>Bags & Clutches</li>
          <li>Vintage Leather Goods</li>
          <li>Leather Accessories</li>
        </ul>
        <p>
          Product descriptions, images, colors, dimensions, and finishes are
          provided to help customers make informed purchasing decisions.
        </p>
        <p>
          Because leather is a natural material, variations in grain, texture,
          color, and appearance may occur. These natural variations are not
          necessarily considered defects and may contribute to the individuality
          of each product.
        </p>
      </ContentSection>

      <ContentSection heading="2. Product Availability">
        <p>
          Product availability may change without notice. We reserve the right
          to limit quantities or discontinue products where necessary.
        </p>
      </ContentSection>

      <ContentSection heading="3. Pricing">
        <p>
          Prices displayed on our website are subject to change without prior
          notice.
        </p>
        <p>
          Any applicable taxes, duties, customs charges, or other
          destination-specific fees may be the responsibility of the customer
          unless expressly stated otherwise.
        </p>
      </ContentSection>

      <ContentSection heading="4. Orders">
        <p>
          Submitting an order constitutes an offer to purchase the selected
          products.
        </p>
        <p>
          We reserve the right to refuse or cancel an order in situations
          including suspected fraudulent activity, inaccurate information,
          pricing errors, product unavailability, or other circumstances
          requiring cancellation.
        </p>
      </ContentSection>

      <ContentSection heading="5. Custom Orders">
        <p>Selected products may be available for customization.</p>
        <p>
          Customers are responsible for providing accurate customization
          requirements. Once a customized order has entered production, changes
          or cancellations may not be possible.
        </p>
        <p>
          Customized products may also be subject to different return and refund
          conditions.
        </p>
      </ContentSection>

      <ContentSection heading="6. Intellectual Property">
        <p>
          All website content, including brand names, logos, photographs,
          graphics, text, product descriptions, designs, and other materials,
          belongs to or is used by Wear The Originals (OGNLS) and may not be
          reproduced, copied, modified, or distributed without permission.
        </p>
      </ContentSection>

      <ContentSection heading="7. Website Use">
        <p>
          Customers agree not to use the website for unlawful purposes or in a
          manner that could damage, disrupt, or interfere with the website or
          its operation.
        </p>
      </ContentSection>

      <ContentSection heading="8. Third-Party Services">
        <p>
          Our website may use third-party services such as payment processors,
          shipping providers, analytics services, or other technology providers.
          Their services may be subject to their own terms and policies.
        </p>
      </ContentSection>

      <ContentSection heading="9. Policy Changes">
        <p>
          We may update these Terms & Conditions from time to time. Any updated
          version will be published on this page.
        </p>
      </ContentSection>

      <ContentSection heading="10. Contact">
        <p>For questions regarding these Terms & Conditions, contact:</p>
        <p>
          <a
            href="mailto:contact@weartheoriginals.com"
            className="text-espresso stitch-underline"
          >
            contact@weartheoriginals.com
          </a>
        </p>
      </ContentSection>
    </ContentPage>
  );
}
