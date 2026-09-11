import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata = { title: "Privacy Policy | Wear The Originals" };

export default function PrivacyPage() {
  return (
    <ContentPage title="Privacy Policy">
      <ContentSection heading="Overview">
        <p>
          At Wear The Originals (OGNLS), we respect your privacy and are
          committed to protecting the information you provide when using our
          website.
        </p>
      </ContentSection>

      <ContentSection heading="Information We May Collect">
        <p>
          Depending on how you use our website, we may collect information such
          as:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Billing and shipping information</li>
          <li>Order details</li>
          <li>Customer service communications</li>
          <li>Information voluntarily provided for customization requests</li>
        </ul>
        <p>
          Payment information may be processed securely through third-party
          payment providers. We do not need to retain your complete payment-card
          information ourselves.
        </p>
      </ContentSection>

      <ContentSection heading="How We Use Your Information">
        <p>We may use customer information to:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Process and fulfill orders</li>
          <li>Provide shipping updates</li>
          <li>Respond to customer inquiries</li>
          <li>Process returns and exchanges</li>
          <li>Provide customer support</li>
          <li>Handle customization requests</li>
          <li>Improve our website and services</li>
          <li>Prevent fraud or unauthorized activity</li>
          <li>Comply with applicable legal requirements</li>
        </ul>
      </ContentSection>

      <ContentSection heading="Marketing Communications">
        <p>
          Where applicable, we may send promotional communications if you have
          opted to receive them.
        </p>
        <p>You may unsubscribe from marketing communications at any time.</p>
      </ContentSection>

      <ContentSection heading="Third-Party Services">
        <p>
          We may use trusted third-party providers for payment processing,
          shipping, analytics, website functionality, marketing, and other
          business operations.
        </p>
        <p>
          These providers may process information according to their own privacy
          policies.
        </p>
      </ContentSection>

      <ContentSection heading="Data Security">
        <p>
          We take reasonable measures to protect customer information from
          unauthorized access, misuse, alteration, or disclosure.
        </p>
        <p>
          However, no internet-based system can be guaranteed to be completely
          secure.
        </p>
      </ContentSection>

      <ContentSection heading="Your Information">
        <p>
          If you have questions about the personal information we hold or wish
          to make a privacy-related request, contact us at:
        </p>
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
