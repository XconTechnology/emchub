import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, ChevronDown, FileText, Shield } from "lucide-react";
import { cn } from "@/lib/utils";


interface TermsAndConditionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}


function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}


function TermsContent() {
  return (
    <div className="space-y-6 pb-2">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Welcome to <strong className="text-foreground">EMC HUB HK</strong>! These Terms of Use govern your access to and use
        of our digital platform, which helps users discover halal food options, schools, shops,
        community opportunities, and selected e-commerce services in Hong Kong.
      </p>

      <Section title="Access and Eligibility">
        <p>
          You must be at least 18 years old to use EMC HUB HK. By using the Platform, you represent
          that you meet this requirement and have the legal capacity to agree to these Terms.
        </p>
        <p>
          Certain features require account creation. You agree to provide accurate information, keep
          your login credentials confidential, and notify us of any unauthorised use.
        </p>
      </Section>

      <Section title="Permitted Use">
        <BulletList
          items={[
            "Search and view listings for halal foods, schools, shops, and community opportunities.",
            "Participate in beta features, volunteering, or time-based exchanges.",
            "Browse and purchase products via our e-commerce section.",
            "Post reviews, ratings, or user-generated content where permitted.",
          ]}
        />
      </Section>

      <Section title="Prohibited Conduct">
        <BulletList
          items={[
            "Violate any laws, including Hong Kong regulations on data privacy, consumer protection, or intellectual property.",
            "Post false listings, misleading information, or content that infringes third-party rights.",
            "Use the Platform for commercial purposes without permission, scrape data, or interfere with its operation.",
            "Harass users, post discriminatory content, or engage in fraudulent activities like fake reviews.",
            "Attempt unauthorised access to accounts, systems, or location data.",
          ]}
        />
      </Section>

      <Section title="Intellectual Property">
        <p>
          All content on EMC HUB HK — including maps, listings, logos, images, software, and designs —
          is owned by us or our licensors. You may not copy, modify, distribute, or commercially exploit
          it without written permission.
        </p>
      </Section>

      <Section title="User Content">
        <p>
          By posting User Content, you grant us a worldwide, royalty-free, perpetual licence to use,
          modify, display, and distribute it for Platform operations, promotion, and improvements.
        </p>
        <p>
          No unlawful, defamatory, obscene, hateful, or infringing material. We may remove content
          at our discretion and report illegal activity to authorities.
        </p>
      </Section>

      <Section title="Payments and E-commerce">
        <p>
          Purchases are processed via third-party gateways. You agree to pay valid charges and provide
          accurate delivery details. We are not liable for third-party errors, lost shipments, or product
          quality (handled by merchants).
        </p>
      </Section>

      <Section title="Disclaimers & Limitation of Liability">
        <p>
          EMC HUB HK is provided "as is" without warranties of any kind. To the fullest extent permitted
          by Hong Kong law, total liability shall not exceed HK$100 or the value of your recent transactions.
        </p>
      </Section>

      <Section title="Governing Law">
        <p>
          These Terms are governed by the laws of Hong Kong SAR. Any disputes shall be subject to the
          exclusive jurisdiction of the courts of Hong Kong SAR.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions? Email us at{" "}
          <a
            href="mailto:emchub@ilm.org.hk"
            className="font-medium text-primary underline underline-offset-2"
          >
            emchub@ilm.org.hk
          </a>
        </p>
      </Section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-6 pb-2">
      <p className="text-sm text-muted-foreground leading-relaxed">
        This Privacy Policy explains how <strong className="text-foreground">EMC HUB HK</strong> collects,
        uses, discloses, and protects your personal information in compliance with the Personal Data
        (Privacy) Ordinance (Cap. 486) of the Hong Kong SAR.
      </p>

      <Section title="Information We Collect">
        <BulletList
          items={[
            "Personal information: name, email, contact details, account credentials.",
            "Order and transaction details including delivery address and purchase history.",
            "Usage and technical information: IP address, browser type, device identifiers, and app usage patterns.",
            "Cookies and similar technologies for session management and analytics.",
          ]}
        />
      </Section>

      <Section title="How We Use Your Information">
        <BulletList
          items={[
            "To provide, operate, and maintain EMC HUB HK including maps, listings, and e-commerce.",
            "To process registrations, orders, payments, and bookings.",
            "To enhance your user experience and personalise navigation.",
            "To communicate about your account, orders, and platform updates.",
            "For analytics and research using aggregated, anonymised data.",
            "To comply with legal obligations and protect our rights and users.",
          ]}
        />
      </Section>

      <Section title="Disclosure of Information">
        <p>
          We may share your data with trusted service providers (hosting, analytics, payment processors,
          logistics), community partners for volunteering coordination, and authorities when required by law.
          All parties are bound by confidentiality obligations.
        </p>
      </Section>

      <Section title="Data Security">
        <p>
          We take reasonable administrative, technical, and physical measures to protect your personal
          information. Despite our efforts, internet transmission is not completely secure; any transmission
          is at your own risk.
        </p>
      </Section>

      <Section title="Your Rights">
        <p>
          You have the right to request access to and correction of your personal data. Contact us at{" "}
          <a
            href="mailto:emchub@ilm.org.hk"
            className="font-medium text-primary underline underline-offset-2"
          >
            emchub@ilm.org.hk
          </a>{" "}
          to exercise these rights. A reasonable fee of up to HK$100 may apply for data access requests.
        </p>
      </Section>

      <Section title="Data Retention">
        <p>
          We retain personal information as long as necessary to fulfil the purposes described here or as
          required by applicable law. When no longer needed, we delete or anonymise your data.
        </p>
      </Section>

      <Section title="Children's Privacy">
        <p>
          EMC HUB HK is not directed at children under 13. Users under 18 should use the Platform only
          with parental involvement. We will delete any data collected from children without appropriate consent.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          For privacy-related enquiries, email us at{" "}
          <a
            href="mailto:emchub@ilm.org.hk"
            className="font-medium text-primary underline underline-offset-2"
          >
            emchub@ilm.org.hk
          </a>
        </p>
      </Section>
    </div>
  );
}

// ─── Scroll Progress Indicator ────────────────────────────────────────────────

function ScrollProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary transition-all duration-150 ease-out rounded-full"
        style={{ width: `${Math.min(progress * 100, 100)}%` }}
      />
    </div>
  );
}

// ─── Scroll Hint ──────────────────────────────────────────────────────────────

function ScrollHint({ visible }: { visible: boolean }) {
  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 flex flex-col items-center pb-2 pt-8 pointer-events-none",
        "bg-gradient-to-t from-background via-background/80 to-transparent",
        "transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <span className="text-xs text-muted-foreground mb-1">Scroll to read</span>
      <ChevronDown className="h-4 w-4 text-muted-foreground animate-bounce" />
    </div>
  );
}


const SCROLL_THRESHOLD = 0.92; 

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  open,
  onOpenChange,
  onAccept,
}) => {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");
  const [termsRead, setTermsRead] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [accepted, setAccepted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens/closes or tab changes
  useEffect(() => {
    if (open) {
      setTermsRead(false);
      setScrollProgress(0);
      setShowHint(true);
      setAccepted(false);
      setActiveTab("terms");
    }
  }, [open]);

  useEffect(() => {
    setScrollProgress(0);
    setShowHint(true);
    // Scroll the viewport back to top when tab changes
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const scrollable = scrollHeight - clientHeight;
    if (scrollable <= 0) {
      setTermsRead(true);
      setScrollProgress(1);
      setShowHint(false);
      return;
    }
    const progress = scrollTop / scrollable;
    setScrollProgress(progress);
    if (progress > 0.05) setShowHint(false);
    if (activeTab === "terms" && progress >= SCROLL_THRESHOLD) {
      setTermsRead(true);
    }
  }, [activeTab]);

  const handleAccept = () => {
    setAccepted(true);
    // Small delay for the checkmark animation to play
    setTimeout(() => {
      onAccept();
      onOpenChange(false);
    }, 420);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full flex flex-col gap-0 p-0 overflow-hidden max-h-[90vh]">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-xl font-bold">Terms &amp; Privacy</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Please read and scroll through the Terms of Use before accepting.
          </p>
        </DialogHeader>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "terms" | "privacy")}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="px-6 pt-3 shrink-0">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="terms" className="gap-2">
                <FileText className="h-4 w-4" />
                Terms of Use
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-2">
                <Shield className="h-4 w-4" />
                Privacy Policy
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Progress bar — only shown on terms tab */}
          <div className="px-6 pt-3 pb-1 shrink-0">
            {activeTab === "terms" ? (
              <div className="space-y-1">
                <ScrollProgressBar progress={scrollProgress} />
                <p className="text-xs text-muted-foreground text-right">
                  {termsRead ? (
                    <span className="text-primary font-medium">✓ Terms read</span>
                  ) : (
                    `${Math.round(scrollProgress * 100)}% read`
                  )}
                </p>
              </div>
            ) : (
              <div className="h-5" /> // spacer
            )}
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 min-h-0 relative">
            <TabsContent value="terms" className="h-full m-0">
              <div className="relative h-full">
                <ScrollArea className="h-full">
                  <div
                    ref={scrollRef}
                    className="px-6 pb-4 overflow-y-auto"
                    style={{ maxHeight: "calc(90vh - 280px)", minHeight: "200px" }}
                    onScroll={handleScroll}
                  >
                    <TermsContent />
                  </div>
                </ScrollArea>
                <ScrollHint visible={showHint && !termsRead} />
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="h-full m-0">
              <ScrollArea className="h-full">
                <div
                  className="px-6 pb-4 overflow-y-auto"
                  style={{ maxHeight: "calc(90vh - 280px)", minHeight: "200px" }}
                >
                  <PrivacyContent />
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="px-6 py-4 border-t shrink-0 flex flex-col sm:flex-row items-center gap-3">
          {!termsRead && (
            <p className="text-xs text-muted-foreground flex-1 text-center sm:text-left">
              Scroll to the bottom of the <strong>Terms of Use</strong> to enable acceptance.
            </p>
          )}

          {termsRead && (
            <p className="text-xs text-muted-foreground flex-1 text-center sm:text-left">
              By clicking Accept, you agree to the Terms of Use and Privacy Policy.
            </p>
          )}

          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={accepted}
            >
              Cancel
            </Button>

            <Button
              onClick={handleAccept}
              disabled={!termsRead || accepted}
              className={cn(
                "min-w-[120px] transition-all duration-200",
                accepted && "bg-green-600 hover:bg-green-600"
              )}
            >
              {accepted ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 animate-in zoom-in-50 duration-200" />
                  Accepted!
                </span>
              ) : (
                "Accept"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditionsModal;