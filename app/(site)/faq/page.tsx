import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata = { title: "FAQ | Wear The Originals" };

const FAQS = [
  {
    q: "What products does OGNLS offer?",
    a: "We offer men's and women's leather jackets, bags and clutches, vintage leather goods, and leather accessories.",
  },
  {
    q: "Do you offer customization?",
    a: "Yes. Customization is available for selected products. Contact us with your requirements and our team will confirm the available options.",
  },
  {
    q: "How long does it take to process my order?",
    a: "Orders are generally processed within 4-5 business days after payment confirmation.",
  },
  {
    q: "How can I track my order?",
    a: "Where tracking is available, tracking information will be provided after your order has been dispatched.",
  },
  {
    q: "Can I return my order?",
    a: "Eligible products can generally be returned or exchanged within 7 days of delivery, subject to our Return & Exchange Policy.",
  },
  {
    q: "Can I exchange a jacket for another size?",
    a: "Yes, eligible size exchanges may be available depending on product availability. Please contact us within 7 days of delivery.",
  },
  {
    q: "Are customized products returnable?",
    a: "Customized or personalized products may not be eligible for return or exchange unless they arrive damaged, defective, or materially different from the agreed specifications.",
  },
  {
    q: "Is every leather product identical?",
    a: "No. Leather is a natural material, so slight differences in grain, texture, color, and appearance are normal and can make each piece unique.",
  },
  {
    q: "How can I contact OGNLS?",
    a: "You can reach us at contact@weartheoriginals.com, weartheoriginals@gmail.com.",
  },
];

export default function FaqPage() {
  return (
    <ContentPage title="Frequently Asked Questions">
      {FAQS.map((item) => (
        <ContentSection key={item.q} heading={item.q}>
          <p>{item.a}</p>
        </ContentSection>
      ))}
    </ContentPage>
  );
}
