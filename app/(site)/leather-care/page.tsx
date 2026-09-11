import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata = { title: "Leather Care Guide | Wear The Originals" };

export default function LeatherCarePage() {
  return (
    <ContentPage title="Leather Care Guide">
      <ContentSection heading="Caring for Your OGNLS Leather">
        <p>
          At Wear The Originals (OGNLS), we believe genuine leather is made to
          age beautifully.
        </p>
        <p>
          With proper care, your leather piece can maintain its appearance,
          strength, and character for years. As leather is a natural material,
          its texture and appearance may naturally evolve with use — creating a
          finish that is uniquely yours.
        </p>
      </ContentSection>

      <ContentSection heading="1. Keep Leather Dry">
        <p>
          Avoid exposing your leather product to excessive water or moisture.
        </p>
        <p>
          If your item becomes lightly wet, gently wipe away the moisture with a
          clean, soft cloth and allow it to dry naturally at room temperature.
        </p>
        <p>
          Do not use a hair dryer, heater, iron, or direct heat to dry leather.
        </p>
      </ContentSection>

      <ContentSection heading="2. Avoid Prolonged Sunlight">
        <p>
          Extended exposure to direct sunlight can cause leather to fade or
          change color.
        </p>
        <p>
          When not in use, store your leather products away from prolonged
          direct sunlight and excessive heat.
        </p>
      </ContentSection>

      <ContentSection heading="3. Store Properly">
        <p>
          For jackets, hang the garment on a wide, sturdy hanger to help
          maintain its shape.
        </p>
        <p>
          For bags, wallets, passport holders, and other accessories, store them
          in a cool, dry place and avoid placing heavy objects on top of them.
        </p>
        <p>
          Where provided, use the original dust bag or protective packaging for
          storage.
        </p>
      </ContentSection>

      <ContentSection heading="4. Keep Leather Away From Chemicals">
        <p>Avoid contact with:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Perfumes</li>
          <li>Alcohol-based products</li>
          <li>Oils</li>
          <li>Makeup</li>
          <li>Cleaning chemicals</li>
          <li>Solvents</li>
          <li>Hair products</li>
        </ul>
        <p>
          These substances may stain, discolor, or damage the leather surface.
        </p>
      </ContentSection>

      <ContentSection heading="5. Cleaning">
        <p>
          For everyday dust or light surface marks, gently wipe the leather with
          a clean, soft, dry cloth.
        </p>
        <p>
          Do not use household cleaning products, detergents, or aggressive
          chemicals.
        </p>
        <p>
          For deeper stains or significant damage, we recommend consulting a
          professional leather-care specialist rather than attempting aggressive
          cleaning yourself.
        </p>
      </ContentSection>

      <ContentSection heading="6. Leather Conditioners">
        <p>
          If using a leather conditioner or treatment, always choose one
          specifically designed for the particular type of leather.
        </p>
        <p>
          Test any product on a small, hidden area first before applying it to
          the entire item.
        </p>
        <p>
          Different leather finishes may react differently to conditioning
          products.
        </p>
      </ContentSection>

      <ContentSection heading="7. Natural Leather Characteristics">
        <p>
          Leather is a natural material. Small variations in grain, texture,
          color, creasing, markings, and surface character may occur naturally.
        </p>
        <p>
          These characteristics are not necessarily imperfections. They are part
          of what makes each leather piece individual.
        </p>
      </ContentSection>

      <ContentSection heading="8. Leather Jackets">
        <p>
          Avoid folding leather jackets for extended periods, as this can create
          permanent creases.
        </p>
        <p>
          Hang your jacket properly after wearing it and allow it to air
          naturally before storing.
        </p>
        <p>
          Do not machine wash or tumble dry a leather jacket unless the specific
          care instructions for that product expressly permit it.
        </p>
      </ContentSection>

      <ContentSection heading="9. Vintage Leather">
        <p>
          Vintage leather requires additional care because older leather may
          naturally have signs of age, patina, marks, or changes in texture.
        </p>
        <p>
          These characteristics may contribute to the authenticity and character
          of vintage pieces.
        </p>
        <p>
          Avoid aggressive cleaning or restoration unless performed by a
          qualified leather specialist.
        </p>
      </ContentSection>

      <ContentSection heading="10. Enjoy the Character">
        <p>Leather is not meant to remain exactly the same forever.</p>
        <p>
          Over time, genuine leather can develop patina — subtle changes in
          color, texture, and finish caused by use, handling, and exposure.
        </p>
        <p>
          At OGNLS, we see this natural evolution as part of the beauty of
          leather.
        </p>
        <p className="font-display text-espresso text-base">
          Wear The Originals. Let it become yours.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
