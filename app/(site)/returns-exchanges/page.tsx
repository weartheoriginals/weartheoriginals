import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata = { title: "Returns & Exchanges | Wear The Originals" };

export default function ReturnsExchangesPage() {
  return (
    <ContentPage title="Return & Exchange Policy">
      <ContentSection heading="Overview">
        <p>
          At Wear The Originals (OGNLS), we want you to be satisfied with your
          purchase.
        </p>
        <p>
          We accept eligible returns and exchanges within 7 days of delivery.
        </p>
      </ContentSection>

      <ContentSection heading="Eligibility">
        <p>To be eligible for a return or exchange:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>The item must be unused and unworn.</li>
          <li>The item must be in its original condition.</li>
          <li>
            Original tags, packaging, and accessories must be intact where
            applicable.
          </li>
          <li>
            The item must not have been altered, washed, damaged, or modified.
          </li>
          <li>Proof of purchase must be provided.</li>
        </ul>
      </ContentSection>

      <ContentSection heading="Size Exchanges">
        <p>
          If you receive an incorrect size or need a different size, please
          contact us within 7 days of delivery.
        </p>
        <p>Size exchanges are subject to product availability.</p>
      </ContentSection>

      <ContentSection heading="Customized Products">
        <p>
          Because customized products are made according to individual customer
          requirements, customized or personalized items may not be eligible for
          return or exchange, unless the item arrives damaged, defective, or
          materially different from the agreed specifications.
        </p>
        <p>
          Please confirm customization details carefully before placing your
          order.
        </p>
      </ContentSection>

      <ContentSection heading="Damaged or Incorrect Items">
        <p>
          If your order arrives damaged or you receive an incorrect item,
          contact us as soon as possible with your order details and clear
          photographs of the product and packaging.
        </p>
        <p>We will review the issue and provide the appropriate resolution.</p>
      </ContentSection>

      <ContentSection heading="Return Authorization">
        <p>
          Please contact Wear The Originals (OGNLS) before sending any product
          back.
        </p>
        <p>Items returned without prior authorization may not be accepted.</p>
      </ContentSection>
    </ContentPage>
  );
}
