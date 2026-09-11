import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata = { title: "Shipping Policy | Wear The Originals" };

export default function ShippingPolicyPage() {
  return (
    <ContentPage title="Shipping Policy">
      <ContentSection heading="Overview">
        <p>
          At Wear The Originals (OGNLS), we carefully prepare every order before
          dispatch to ensure it reaches you in the condition expected.
        </p>
      </ContentSection>

      <ContentSection heading="Order Processing">
        <p>
          Orders are processed within 4-5 business days after payment
          confirmation.
        </p>
        <p>
          Processing time refers to the time required to prepare, inspect,
          package, and dispatch your order. It does not include shipping or
          delivery time.
        </p>
      </ContentSection>

      <ContentSection heading="Shipping & Delivery">
        <p>
          Once your order has been dispatched, shipping and delivery times may
          vary depending on:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Destination country</li>
          <li>Shipping method</li>
          <li>Courier or logistics provider</li>
          <li>Customs clearance</li>
          <li>Local delivery conditions</li>
        </ul>
        <p>
          International orders may be subject to customs duties, taxes, or other
          charges imposed by the destination country. Any such charges are the
          responsibility of the customer unless otherwise stated at checkout.
        </p>
      </ContentSection>

      <ContentSection heading="Tracking">
        <p>
          Where tracking is available, tracking information will be provided
          after your order has been dispatched.
        </p>
      </ContentSection>

      <ContentSection heading="Delays">
        <p>
          While we work with shipping partners to deliver orders as efficiently
          as possible, delays caused by customs, weather, carrier disruptions,
          or circumstances beyond our control may occur.
        </p>
        <p>
          If you experience an unexpected delivery issue, please contact our
          customer support team.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
