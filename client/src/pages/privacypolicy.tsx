import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
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
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
            <h1 className="text-5xl md:text-6xl font-black mb-4 text-center">
              Privacy Policy
            </h1>
            <p className="text-lg text-white/90 text-center max-w-3xl mx-auto">
              Privacy Policy for EMC HUB HK (Effective Date: 11 March 2024)
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="shadow-xl">
            <CardContent className="p-8 md:p-12 space-y-8">
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to EMC HUB HK. This Privacy Policy explains how we collect, use, disclose,
                  and protect your personal information when you use our digital platform and mobile
                  application that helps users discover halal food options, schools, shops, community
                  opportunities, and selected e-commerce offerings in Hong Kong.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We are committed to protecting your privacy and complying with the Personal Data
                  (Privacy) Ordinance (Cap. 486) of the Hong Kong SAR (“PDPO”) and other applicable
                  laws. By using EMC HUB HK, you consent to the practices described in this Privacy Policy.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Information We Collect</h2>

                <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may collect personal information when you register for an account, participate in
                  volunteering or community activities, make purchases, or communicate with us. This may
                  include your name, email address, contact information, username and password, and any
                  other information you provide voluntarily. It may also include order and transaction
                  details (such as delivery address and purchase history), and participation details for
                  volunteer or community activities.
                </p>

                <h3 className="text-lg font-semibold text-foreground">Usage and Technical Information</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may automatically collect information about how you access and use EMC HUB HK, including:
                  IP address, browser type, device identifiers, operating system, connection type, access times,
                  pages viewed, referring pages, clickstream data, search queries, and interactions with maps and listings.
                </p>

                <h3 className="text-lg font-semibold text-foreground">Context</h3>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing EMC HUB HK services using mobile, tablet, or other devices/technology (including
                  mobile applications), this Privacy Policy applies in that context too. If you disable location
                  permissions, some location-based features may not work properly.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Cookies and Similar Technologies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may use cookies, SDKs, and similar technologies to recognise you when you return,
                  maintain your session and preferences, and analyse traffic and usage trends to improve our services.
                  You may adjust your browser or device settings to refuse cookies, but this may affect certain features.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Use of Information</h2>

                <h3 className="text-lg font-semibold text-foreground">Service Provision and Operations</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To provide, operate, and maintain EMC HUB HK including maps, listings, search, and e-commerce features.
                  To process registrations, orders, payments, and bookings. To match you with community, volunteering,
                  or beta experiences where applicable.
                </p>

                <h3 className="text-lg font-semibold text-foreground">Enhancing User Experience</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To personalise content, recommendations, and search results based on your interests, usage, and location.
                  To improve design, features, performance, and security using analytics and testing.
                </p>

                <h3 className="text-lg font-semibold text-foreground">Communication</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To communicate about your account, orders, opportunities, platform updates, promotions, surveys, or support matters.
                  You may opt out of non-essential marketing communications anytime via unsubscribe or by contacting us.
                </p>

                <h3 className="text-lg font-semibold text-foreground">Community and Beta Features</h3>
                <p className="text-muted-foreground leading-relaxed">
                  During beta and community engagement features, we may record participation and share necessary info
                  with partner organisations hosting opportunities (for example, your name and contact details to coordinate attendance).
                </p>

                <h3 className="text-lg font-semibold text-foreground">E-commerce and Payment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To process purchases and share necessary information with payment processors and logistics partners for payment and delivery.
                </p>

                <h3 className="text-lg font-semibold text-foreground">Analytics and Research</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may use aggregated and anonymised data for research, statistics, and service improvement.
                  Such data will not personally identify you.
                </p>

                <h3 className="text-lg font-semibold text-foreground">Legal and Compliance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To comply with legal obligations, respond to lawful requests, enforce terms, and protect our rights, users, and the public.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Disclosure of Information</h2>

                <h3 className="text-lg font-semibold text-foreground">Service Providers and Partners</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may disclose personal information to trusted third parties supporting EMC HUB HK operations
                  such as hosting/IT providers, analytics providers, payment processors, logistics partners,
                  and organisations or merchants offering goods/services or experiences through the platform.
                  These parties may only use your information to perform services on our behalf.
                </p>

                <h3 className="text-lg font-semibold text-foreground">Community and Volunteering Partners</h3>
                <p className="text-muted-foreground leading-relaxed">
                  For volunteering/community features, we may share limited relevant information with partner NGOs,
                  schools, or organisations to coordinate activities, verify participation, and provide recognition or rewards.
                </p>

                <h3 className="text-lg font-semibold text-foreground">Legal Obligations and Protection</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may disclose personal information to comply with PDPO and other laws or respond to valid requests
                  from law enforcement/regulators/courts, and to investigate or prevent illegal activities, fraud, or security issues.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Transfers Outside Hong Kong</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If we transfer personal data outside Hong Kong, we will take reasonably practicable steps to ensure
                  comparable protection to PDPO requirements or apply other safeguards as permitted by law.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We take reasonable steps to protect your personal information using administrative, technical,
                  and physical safeguards, limiting access to authorised personnel, and using secure servers/encryption where appropriate.
                  You are responsible for keeping your password confidential.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Internet/mobile transmissions are not completely secure and are at your own risk. Once received,
                  we use strict procedures to reduce risk of unauthorised access.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Data Breach Response</h2>
                <p className="text-muted-foreground leading-relaxed">
                  In the event of a data breach, we will take prompt action to contain and assess the breach,
                  mitigate potential harm, and comply with PDPO and other applicable laws, including notifications where required.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain personal information as long as necessary to fulfil the purposes described,
                  or as required by PDPO and other laws (including accounting, reporting, or dispute resolution).
                  When no longer required, we will delete or anonymise it unless retention is required by law.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Your Rights</h2>

                <h3 className="text-lg font-semibold text-foreground">Access and Correction</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You may request access to personal data we hold about you and request correction of inaccurate or incomplete data.
                  You may exercise these rights via account settings (where available) or by contacting us.
                </p>

                <h3 className="text-lg font-semibold text-foreground">Fees</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may charge a reasonable fee (for example, HK$100) to cover costs for processing a data access request,
                  in accordance with the PDPO.
                </p>

                <h3 className="text-lg font-semibold text-foreground">Direct Marketing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Where required, we will obtain consent before using personal data for direct marketing.
                  You may withdraw consent or opt out anytime.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Children’s Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  EMC HUB HK is not primarily directed at children under 13. If you are under 18, you should use the
                  platform with a parent/guardian where required. If we learn we collected data from a child without
                  appropriate consent, we will delete it where required by law.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Changes to this Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this policy from time to time. Any revised version will be posted with an updated
                  effective date. Continued use 30 days after revisions become effective means you accept the updates.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions, concerns, or complaints regarding this Privacy Policy or our data practices,
                  please contact:
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Email:</span> hello@cantolearn.hk
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
