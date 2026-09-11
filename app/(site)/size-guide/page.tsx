import {
  ContentPage,
  ContentSection,
  ContentTable,
} from "@/components/content-page";

export const metadata = { title: "Size Guide | Wear The Originals" };

export default function SizeGuidePage() {
  return (
    <ContentPage title="Jacket Size Guide">
      <ContentSection heading="Find Your OGNLS Fit">
        <p>
          Choosing the right size is important, especially when purchasing a
          leather jacket online.
        </p>
        <p>
          Our jackets may have different fits depending on the design, including
          regular, slim, relaxed, bomber, biker, varsity, and oversized styles.
          For the most accurate fit, always check the measurements provided on
          the individual product page.
        </p>
      </ContentSection>

      <ContentSection heading="How to Measure">
        <p>
          For the best results, measure yourself while wearing a light layer of
          clothing.
        </p>
        <p>
          <strong className="text-espresso">Chest</strong> — Measure around the
          fullest part of your chest, keeping the measuring tape level and
          comfortably snug.
        </p>
        <p>
          <strong className="text-espresso">Shoulders</strong> — Measure from
          the end of one shoulder to the end of the other across the back.
        </p>
        <p>
          <strong className="text-espresso">Sleeve Length</strong> — Measure
          from the shoulder seam down to the wrist.
        </p>
        <p>
          <strong className="text-espresso">Jacket Length</strong> — Measure
          from the highest point of the shoulder down to the desired jacket
          length.
        </p>
      </ContentSection>

      <ContentSection heading="General Size Reference">
        <ContentTable
          headers={["Size", "General Fit"]}
          rows={[
            ["XS", "Extra Small"],
            ["S", "Small"],
            ["M", "Medium"],
            ["L", "Large"],
            ["XL", "Extra Large"],
            ["XXL", "Double Extra Large"],
            ["3XL", "Triple Extra Large"],
          ]}
        />
        <p>
          Please refer to the specific measurements listed on each product page
          before placing your order.
        </p>
      </ContentSection>

      <ContentSection heading="Between Two Sizes?">
        <p>
          If your measurements fall between two sizes, consider the fit you
          prefer:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Choose the smaller size for a more fitted appearance.</li>
          <li>
            Choose the larger size if you prefer additional room or plan to
            layer clothing underneath.
          </li>
        </ul>
      </ContentSection>

      <ContentSection heading="Different Jacket Fits">
        <p>
          <strong className="text-espresso">Slim Fit</strong> — Designed to sit
          closer to the body.
        </p>
        <p>
          <strong className="text-espresso">Regular Fit</strong> — Provides a
          balanced fit with comfortable room for everyday wear.
        </p>
        <p>
          <strong className="text-espresso">Relaxed Fit</strong> — Offers
          additional room through the body and sleeves.
        </p>
        <p>
          <strong className="text-espresso">Oversized Fit</strong> — Designed
          intentionally with a looser silhouette.
        </p>
      </ContentSection>

      <ContentSection heading="Men's Leather Jacket Size Chart">
        <ContentTable
          headers={["OGNLS Size", "US/UK", "EU", "Chest (in)", "Chest (cm)"]}
          rows={[
            ["XS", "34", "44", "34–36", "86–91"],
            ["S", "36", "46", "36–38", "91–97"],
            ["M", "38", "48", "38–40", "97–102"],
            ["L", "40", "50", "40–42", "102–107"],
            ["XL", "42", "52", "42–44", "107–112"],
            ["XXL", "44", "54", "44–46", "112–117"],
            ["3XL", "46", "56", "46–48", "117–122"],
          ]}
        />
      </ContentSection>

      <ContentSection heading="Women's Leather Jacket Size Chart">
        <ContentTable
          headers={["OGNLS Size", "US", "UK", "EU", "Bust (in)", "Bust (cm)"]}
          rows={[
            ["XS", "0–2", "4–6", "32–34", "31–33", "79–84"],
            ["S", "4–6", "8–10", "36–38", "33–35", "84–89"],
            ["M", "8–10", "12–14", "40–42", "35–37", "89–94"],
            ["L", "12–14", "16–18", "44–46", "37–39", "94–99"],
            ["XL", "16–18", "20–22", "48–50", "39–41", "99–104"],
            ["XXL", "20–22", "24–26", "52–54", "41–43", "104–109"],
          ]}
        />
      </ContentSection>

      <ContentSection heading="How to Measure (Chest / Bust)">
        <p>
          Wrap a measuring tape around the fullest part of your chest or bust.
          Keep the tape level and comfortably snug without pulling it too
          tightly.
        </p>
      </ContentSection>

      <ContentSection heading="Fit Recommendation">
        <p>If you're between two sizes:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Choose the smaller size for a more fitted look.</li>
          <li>
            Choose the larger size if you prefer a relaxed fit or plan to wear
            layers underneath.
          </li>
        </ul>
      </ContentSection>

      <ContentSection heading="Need Help Choosing Your Size?">
        <p>
          If you're unsure which size to select, contact the Wear The Originals
          (OGNLS) team before placing your order.
        </p>
        <p>
          Send us your measurements and the product you're interested in, and
          we'll help you determine the most suitable size based on the available
          measurements.
        </p>
      </ContentSection>

      <ContentSection heading="Important Note">
        <p>
          Leather is a natural material and different jacket designs may have
          slightly different fits. Product-specific measurements should always
          take priority over general size labels.
        </p>
        <p className="font-display text-espresso text-base">
          Wear The Originals.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
