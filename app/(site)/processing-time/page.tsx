import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata = { title: "Processing Time | Wear The Originals" };

export default function ProcessingTimePage() {
  return (
    <ContentPage title="Processing Time">
      <ContentSection heading="How We Prepare Your Order">
        <p>
          At Wear The Originals (OGNLS), every order is carefully prepared and
          checked before it leaves our hands.
        </p>
        <p>
          Orders are processed within 4-5 business days after payment
          confirmation. Once your order has been dispatched, you will receive
          shipping and tracking information where applicable.
        </p>
        <p>
          Please note that processing time is separate from shipping and
          delivery time. Delivery times may vary depending on the destination
          and courier service.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
