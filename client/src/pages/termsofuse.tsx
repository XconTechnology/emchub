import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background">
      <Header forceSolid={true} />

      <main className="pt-16">
        {/* Hero Section */}
        <div
          className="text-white relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, hsl(86 49% 53%) 0%, hsl(86 49% 45%) 50%, hsl(86 49% 38%) 100%)",
          }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
            <h1 className="text-5xl md:text-6xl font-black mb-4 text-center">
              Terms of Use
            </h1>
            <p className="text-lg text-white/90 text-center max-w-3xl mx-auto">
              Terms of Use for EMC HUB HK (Effective Date: 21 January 2026)
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="shadow-xl">
            <CardContent className="p-8 md:p-12 space-y-10">
              {/* Introduction */}
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to EMC HUB HK! These Terms of Use govern your access to and
                  use of our digital platform and mobile application (collectively, the
                  "Platform"), which helps users discover halal food options, schools,
                  shops, community opportunities, etc and selected e-commerce services
                  in Hong Kong.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using EMC HUB HK, you agree to be bound by these Terms.
                  If you do not agree, do not use the Platform.
                </p>
              </section>

              {/* Access and Eligibility */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Access and Eligibility</h2>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Eligibility</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You must be at least 18 years old to use EMC HUB HK. By using the
                    Platform, you represent that you meet this requirement and have the
                    legal capacity to agree to these Terms. If used on behalf of an
                    organization, you warrant authority to bind it.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">User Accounts</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Certain features require account creation. You agree to provide accurate
                    information, keep your login credentials confidential, and notify us of any
                    unauthorized use. You are responsible for all activities under your account.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Availability</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We aim for reliable access but do not guarantee uninterrupted service.
                    We may modify, suspend, or terminate the Platform or features at any time
                    without notice.
                  </p>
                </div>
              </section>

              {/* Use of EMC HUB HK */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Use of EMC HUB HK</h2>

                <div className="bg-primary/5 rounded-2xl p-6 space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Permitted Use</h3>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>
                      You may use EMC HUB HK to search and view listings for halal foods,
                      schools, shops, etc and community opportunities.
                    </li>
                    <li>
                      Participate in beta features, volunteering, or time-based exchanges.
                    </li>
                    <li>
                      Browse and purchase products via our e-commerce section.
                    </li>
                    <li>
                      Post reviews, ratings, or user-generated content where permitted.
                    </li>
                  </ul>
                </div>

                <div className="bg-primary/5 rounded-2xl p-6 space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Prohibited Conduct</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You agree not to engage in any conduct that:
                  </p>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                    <li>
                      Violate any laws, including Hong Kong regulations on data privacy,
                      consumer protection, or intellectual property.
                    </li>
                    <li>
                      Post false listings, misleading information, or content that infringes
                      third-party rights.
                    </li>
                    <li>
                      Use the Platform for commercial purposes without permission, scrape data,
                      or interfere with its operation (for example, via bots or excessive requests).
                    </li>
                    <li>
                      Harass users, post discriminatory content based on race, religion, gender,
                      or other protected characteristics, or engage in fraudulent activities like
                      fake reviews.
                    </li>
                    <li>
                      Attempt unauthorized access to accounts, systems, or location data.
                    </li>
                    <li>
                      Misuse location services or e-commerce features (for example, incorrect
                      addresses leading to failed deliveries).
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Intellectual Property</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    All content on EMC HUB HK including maps, listings, logos, images, software,
                    and designs is owned by us or our licensors and protected by copyright,
                    trademark, and other laws. You may not copy, modify, distribute, or
                    commercially exploit it without written permission.
                  </p>
                </div>
              </section>

              {/* User Content */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">User Content</h2>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Responsibility</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Features like reviews, photos, or community posts ("User Content") are your
                    responsibility. You warrant you own or have rights to it and it complies with
                    these Terms.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">License</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    By posting User Content, you grant us a worldwide, royalty-free, perpetual
                    license to use, modify, display, and distribute it for Platform operations,
                    promotion, and improvements.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Prohibited Content</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    No unlawful, defamatory, obscene, hateful, or infringing material. We may remove
                    content at our discretion and report illegal activity to authorities.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">E-commerce Specifics</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    For listings or sales, you must accurately describe products/services, comply with
                    Hong Kong consumer laws, and handle refunds/disputes as applicable.
                  </p>
                </div>
              </section>

              {/* Location Data */}
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Location Data</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Location services enable map-based discovery. Granting permissions is optional
                  but required for full functionality.
                </p>
              </section>

              {/* Payments and E-commerce */}
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Payments and E-commerce</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Purchases are processed via third-party gateways. You agree to pay valid charges
                  and provide accurate delivery details. We are not liable for third-party errors,
                  lost shipments, or product quality (handled by merchants).
                </p>
              </section>

              {/* Disclaimers */}
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Disclaimers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  EMC HUB HK is provided "as is" without warranties of any kind, express or implied,
                  including accuracy of listings, location data, or beta features. Listings from
                  third parties are not endorsed. Verify independently. We disclaim liability for
                  merchant interactions or community events.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To the fullest extent permitted by Hong Kong law, EMC HUB HK, its affiliates, and
                  personnel are not liable for indirect, consequential, or punitive damages, including
                  lost profits, data loss, or personal injury from user interactions. Total liability
                  shall not exceed HK$100 or the value of your recent transactions.
                </p>
              </section>

              {/* Termination */}
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may suspend or terminate your account for violations without notice. Upon termination,
                  your right to use the Platform ends.
                </p>
              </section>

              {/* Modification of Terms */}
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Modification of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update these Terms. Changes are effective upon posting with a new date.
                  Continued use constitutes acceptance.
                </p>
              </section>

              {/* Governing Law */}
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Governing Law and Jurisdiction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms of Use shall be governed by and construed in accordance with the laws
                  of Hong Kong SAR. Any disputes arising out of or in connection with these Terms of
                  Use shall be subject to the exclusive jurisdiction of the courts of Hong Kong SAR.
                </p>
              </section>

              {/* Contact */}
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions, concerns, or feedback regarding these Terms of Use,
                  please contact us at <span className="font-semibold text-foreground">emchub@ilm.org.hk</span>.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  By using EMC HUB HK, you confirm you have read, understood, and agree to these Terms.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
