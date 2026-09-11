import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata = { title: "Refund Policy | Wear The Originals" };

export default function RefundPolicyPage() {
  return (
    <ContentPage title="Refund Policy">
      <ContentSection heading="Overview">
        <p>
          Once a returned item has been received and inspected, Wear The
          Originals (OGNLS) will notify you whether the return has been
          approved.
        </p>
        <p>
          If approved, the refund will be processed through the applicable
          original payment method, where possible.
        </p>
      </ContentSection>

      <ContentSection heading="Refund Conditions">
        <p>
          Refunds are generally considered for eligible returned products that
          meet our Return & Exchange Policy.
        </p>
        <p>
          Shipping charges may be non-refundable unless the return is due to an
          error on our part or the product arrives damaged or incorrect.
        </p>
      </ContentSection>

      <ContentSection heading="Refund Processing">
        <p>
          The time required for a refund to appear in your account may vary
          depending on your payment provider or financial institution.
        </p>
      </ContentSection>

      <ContentSection heading="Non-Refundable Situations">
        <p>A refund may not be provided for products that:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Have been worn or used</li>
          <li>Have been damaged after delivery</li>
          <li>Have been altered or customized by the customer</li>
          <li>Are returned outside the applicable return period</li>
          <li>Are missing original packaging or components where required</li>
        </ul>
        <p>
          Customized or personalized products may be non-refundable unless they
          are defective, damaged, or materially different from the agreed
          specifications.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
