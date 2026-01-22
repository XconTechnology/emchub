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
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
            <h1 className="text-5xl md:text-6xl font-black mb-4 text-center">
              Privacy Policy
            </h1>
            <p className="text-lg text-white/90 text-center max-w-3xl mx-auto">
              Privacy Policy for EMC HUB HK (Effective Date: 21 January 2026)
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="shadow-xl">
            <CardContent className="p-8 md:p-12 space-y-10">
              {/* Intro */}
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to EMC HUB HK. This Privacy Policy explains how we collect, use,
                  disclose, and protect your personal information when you use our digital platform
                  and mobile application that helps users discover halal food options, schools,
                  shops, community opportunities, etc and selected e-commerce offerings in Hong Kong.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We are committed to protecting your privacy and complying with the Personal Data
                  (Privacy) Ordinance (Cap. 486) of the Hong Kong SAR (“PDPO”) and other applicable
                  laws regarding the handling of personal data. By using EMC HUB HK, you consent to
                  the practices described in this Privacy Policy.
                </p>
              </section>

              {/* Information We Collect */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Information We Collect</h2>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We may collect personal information from you when you register for an account,
                    use EMC HUB HK to participate in volunteering or community activities, make
                    purchases, or communicate with us. This may include your name, email address,
                    contact information, and any other information you provide to us voluntarily.
                    Account login details (such as username and password). Order and transaction
                    details (such as delivery address, billing information processed via third-party
                    payment gateways, and purchase history). Information relating to volunteer or
                    community activities, including participation history, hours contributed, and
                    associated organisations or events.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Usage and Technical Information
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We may automatically collect information about how you access and use EMC HUB HK,
                    including: IP address, browser type, and device identifiers. Operating system,
                    connection type, and mobile network information. Access times, pages viewed,
                    referring pages, and clickstream data. App usage patterns, including search
                    queries and interactions with maps and listings.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Context</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing EMC HUB HK information and/or services using mobile digital routes
                    such as (but not limited to) mobile, tablet or other devices/technology including
                    mobile applications, or otherwise engaging with us, then you should expect that
                    EMC HUB HK&apos;s data collection and usage as set out in this privacy policy will
                    apply in that context too.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Cookies and Similar Technologies
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We may use cookies, SDKs, and similar technologies to recognise you when you
                    return to ECM HUB HK, maintain your session, analyse traffic and usage trends to
                    improve our services. We may collect technical information from your mobile
                    device or your use of our services through a mobile device, for example, location
                    data and certain characteristics of, and performance data about your device,
                    carrier/operating system including device, connection type and IP address. Unless
                    you have elected to remain anonymous through your device and/or platform settings,
                    the above information about you may be collected and used by us automatically if
                    you use the service through your mobile device(s) via any EMC HUB HK mobile
                    application, through your mobile&apos;s browser or otherwise.
                  </p>
                </div>
              </section>

              {/* Use of Information */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Use of Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may use your information for the following purposes:
                </p>

                <div className="space-y-3">
                  <div className="bg-primary/5 rounded-2xl p-6 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Service Provision and Operations
                    </h3>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                      <li>
                        To provide, operate, and maintain EMC HUB HK, including maps, listings, search,
                        and e-commerce functionalities
                      </li>
                      <li>To process your registrations, orders, payments, and bookings</li>
                      <li>
                        To match you with community, volunteering or “beta” experiences where applicable.
                      </li>
                    </ul>
                  </div>

                  <div className="bg-primary/5 rounded-2xl p-6 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Enhancing User Experience
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We may use the information we collect to enhance your user experience, personalize
                      your navigation, and improve EMC HUB’s functionality and content. To improve the
                      design, features, performance, and security of EMC HUB HK through analytics and testing.
                    </p>
                  </div>

                  <div className="bg-primary/5 rounded-2xl p-6 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">Communication</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      To communicate with you about your account, orders, volunteering opportunities,
                      platform updates, promotions, surveys, or support matters. We may use your personal
                      information to communicate with you regarding your account, updates to EMC HUB HK,
                      and other relevant information. You may choose to unsubscribe from these communications
                      at any time.
                    </p>
                  </div>

                  <div className="bg-primary/5 rounded-2xl p-6 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Community and Beta Features
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      During our beta phase and community-engagement features we may: Record your
                      participation in activities, events, or projects. Share necessary information with
                      partner organisations hosting these opportunities (for example, your name and contact
                      information to coordinate your attendance or recognition).
                    </p>
                  </div>

                  <div className="bg-primary/5 rounded-2xl p-6 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      E-commerce and Payment
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      To process purchases of products or services offered through EMC HUB HK. To share
                      necessary information with payment processors (for example, credit card processors)
                      and logistics partners for payment and delivery.
                    </p>
                  </div>

                  <div className="bg-primary/5 rounded-2xl p-6 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Analytics and Research
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We may use aggregated and anonymised data for research, statistics, usage analysis,
                      and service improvement. Such data will not personally identify you.
                    </p>
                  </div>

                  <div className="bg-primary/5 rounded-2xl p-6 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Legal and Compliance
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We may use your personal information where necessary to comply with legal obligations,
                      respond to lawful requests, enforce our terms, or protect our rights, users, and the public.
                    </p>
                  </div>
                </div>
              </section>

              {/* Disclosure */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Disclosure of Information</h2>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Service Providers and Partners
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We may disclose your personal information to trusted third parties who support the
                    operation of EMC HUB HK, including: Hosting and IT service providers, analytics
                    providers, payment processors and financial institutions, logistics and delivery
                    partners, organisations or merchants offering goods, services, or community experiences
                    through EMC HUB HK.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Legal Obligations</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These parties are bound by confidentiality obligations and are only permitted to use
                    your information to perform services and are prohibited from using your personal
                    information for any other purpose.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Community and Volunteering Partners
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    For community engagement or volunteering features, we may share limited, relevant
                    information with partner NGOs, schools, or organisations to coordinate activities,
                    verify participation, and provide recognition or rewards.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Legal Obligations and Protection
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We may disclose your personal information to comply with PDPO and other applicable laws,
                    regulations, or legal processes, or to respond to valid requests from law enforcement
                    agencies, regulators, courts, or other governmental authorities. We may also disclose
                    information when necessary to investigate or prevent suspected illegal activities, fraud,
                    security issues, or to protect the rights, property, or safety of EMC HUB HK, our users,
                    or others.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Transfers Outside Hong Kong
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    If we transfer personal data outside Hong Kong, we will take reasonably practicable steps
                    to ensure that the recipient provides a level of protection that is substantially similar
                    to the requirements of the PDPO, or that other safeguards are in place as permitted by law.
                  </p>
                </div>
              </section>

              {/* Data Security */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We endeavour to take reasonable steps to protect your personal information from unauthorised
                  access, use, disclosure, alteration, or destruction. These measures may include:
                  Administrative, technical, and physical safeguards. Limiting access to personal data to
                  authorised personnel only. Using secure servers and encryption where appropriate.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Where you have chosen a password to access certain parts of EMC HUB HK, you are responsible
                  for keeping this password confidential and not sharing it with anyone. Despite our efforts,
                  transmission of information over the internet and mobile networks is not completely secure,
                  and any transmission is at your own risk. Once we receive your information, we will use
                  strict procedures and security features to reduce the risk of unauthorized access.
                </p>
              </section>

              {/* Data Breach */}
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Data Breach Response</h2>
                <p className="text-muted-foreground leading-relaxed">
                  In the event of a data breach involving unauthorised access, disclosure, alteration, or
                  destruction of personal data, we will take prompt action to:
                </p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Contain and assess the breach</li>
                  <li>Mitigate any potential harm</li>
                  <li>
                    Comply with our obligations under the PDPO and other applicable laws, including notification
                    to affected individuals and relevant authorities where required.
                  </li>
                </ul>
              </section>

              {/* Retention */}
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We will retain your personal information for as long as necessary to fulfil the purposes
                  described in this Privacy Policy, or as required by the PDPO and other applicable laws and
                  regulations, including for accounting, reporting, or dispute-resolution purposes. When personal
                  data is no longer required, we will take steps to delete or anonymise it, unless retention is
                  required by law.
                </p>
              </section>

              {/* Rights */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Subject to applicable laws, you have certain rights in relation to your personal data held by us.
                </p>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Access and Correction</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You have the right to request access to personal data we hold about you. Request correction
                    of any inaccurate or incomplete personal data. You may exercise some of these rights through
                    your account settings, or by contacting us at{" "}
                    <span className="font-semibold text-foreground">emchub@ilm.org.hk</span> or another contact email
                    that we specify for EMC HUB HK.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Fees Incurred</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to charge a reasonable fee (for example, HK$100) to cover our costs in
                    processing a data access request, in accordance with the PDPO.
                  </p>
                </div>
              </section>

              {/* Children */}
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Children’s Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  EMC HUB HK is not primarily directed at children under the age of 13. If you are under 18, you
                  should use EMC HUB HK only with the involvement of a parent or guardian, where required by applicable
                  law. If we become aware that we have collected personal data from a child without appropriate consent,
                  we will take steps to delete such data where required by law.
                </p>
              </section>

              {/* Changes */}
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Changes to this Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our services, legal or
                  regulatory requirements, or operational needs. Any revised version will be posted on our website
                  or application with an updated effective date. By continuing to use EMC HUB HK thirty (30) days after
                  such revisions become effective, you will be deemed to have accepted the updated Privacy Policy.
                </p>
              </section>

              {/* Contact */}
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions, concerns, or complaints regarding this Privacy Policy or our data protection
                  practices, please contact us at:
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Email:</span> emchub@ilm.org.hk
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  By using EMC HUB HK, you acknowledge that you have read and understood this Privacy Policy and consent
                  to the collection, use, and disclosure of your personal information as described above.
                </p>
                <p className="text-muted-foreground leading-relaxed font-semibold text-foreground">
                  EMC HUB HK
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
