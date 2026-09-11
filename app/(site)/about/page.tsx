import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata = { title: "About | Wear The Originals" };

export default function AboutPage() {
  return (
    <ContentPage title="About Wear The Originals">
      <ContentSection heading="About OGNLS">
        <p>
          Wear The Originals (OGNLS) is a leather goods brand built around
          timeless design, quality craftsmanship, and the character of genuine
          leather.
        </p>
        <p>
          We create pieces that are made to be more than seasonal trends — from
          men's and women's leather jackets to bags, clutches, vintage leather
          goods, and everyday leather accessories.
        </p>
        <p>
          Our collection includes carefully selected leather products such as
          jackets, bags, wallets, passport holders, vintage leather books,
          leather gifts, and distinctive leather showpieces.
        </p>
      </ContentSection>

      <ContentSection heading="Our Philosophy">
        <p>
          We believe leather has a character of its own. Every texture, grain,
          and finish contributes to the individuality of a piece.
        </p>
        <p>
          At OGNLS, our approach is simple: create and curate leather goods that
          combine function, character, and timeless style.
        </p>
      </ContentSection>

      <ContentSection heading="Our Collections">
        <ul className="list-disc list-inside space-y-1">
          <li>Men's Jackets</li>
          <li>Women's Jackets</li>
          <li>Bags & Clutches</li>
          <li>Vintage Leather</li>
          <li>Leather Accessories</li>
        </ul>
      </ContentSection>

      <ContentSection heading="Made for You">
        <p>
          We also offer customization options for selected products. Whether you
          have a specific design, size, color, finish, or personalization in
          mind, our team can discuss available options based on your
          requirements.
        </p>
      </ContentSection>

      <ContentSection heading="The OGNLS Standard">
        <p>
          From classic everyday essentials to statement pieces, we focus on
          thoughtful designs, quality materials, and craftsmanship that allows
          our products to age with character.
        </p>
        <p className="font-display text-espresso text-base">
          Wear The Originals.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
