import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata = { title: "Cookie Policy | Wear The Originals" };

export default function CookiePolicyPage() {
  return (
    <ContentPage title="Cookie Policy">
      <ContentSection heading="Our Use of Cookies">
        <p>
          Wear The Originals (OGNLS) may use cookies and similar technologies to
          improve website functionality, understand how visitors use our
          website, and provide a better shopping experience.
        </p>
        <p>Cookies may be used for purposes such as:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Keeping products in your shopping cart</li>
          <li>Remembering preferences</li>
          <li>Understanding website traffic</li>
          <li>Improving website performance</li>
          <li>Measuring marketing and advertising performance</li>
        </ul>
        <p>
          Some cookies may be placed by third-party services used on our
          website.
        </p>
      </ContentSection>

      <ContentSection heading="Managing Cookies">
        <p>
          You can manage or disable cookies through your browser settings.
          Please note that disabling certain cookies may affect website
          functionality or your shopping experience.
        </p>
        <p>
          By continuing to use our website, you acknowledge the use of cookies
          in accordance with this policy.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
