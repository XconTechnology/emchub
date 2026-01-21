import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Send, CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AboutUs() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const scrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/contact-queries", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "Thank you for contacting us. We'll get back to you soon."
      });
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setIsSubmitted(false), 5000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header forceSolid={true} />

      <main className="pt-16">
        {/* Hero Section */}
        <div
          className="text-white relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, hsl(86 49% 53%) 0%, hsl(86 49% 45%) 50%, hsl(86 49% 38%) 100%)"
          }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
            <h1 className="text-5xl md:text-6xl font-black mb-6 text-center">Welcome to EMC Hub</h1>
            <p className="text-xl text-white/90 text-center max-w-3xl mx-auto">
              Your Gateway to Hong Kong's Halal Marketplace
            </p>

            {/* Beta Notice + CTA (scroll to contact) */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 text-center">
              <p className="text-white/90 max-w-3xl mx-auto">
                <span className="font-semibold">Note:</span> TimeDollars (TD) is currently in{" "}
                <span className="font-semibold">Beta</span>. Interested people, vendors, and NGOs can contact ILM to join
                the beta testing phase.
              </p>

              <Button
                size="lg"
                onClick={scrollToContact}
                className="bg-white text-primary hover:bg-white/90 px-8 py-4 font-semibold rounded-xl shadow-lg"
                data-testid="btn-hero-join-beta"
              >
                Contact ILM to Join Beta
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="shadow-xl mb-8">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                  Ethnic Minority Hub (EMC Hub) is a community{" "}
                  <span className="text-primary font-semibold">#halalmarketplace</span> web platform to assist small shops
                  and other businesses to digitize and promote their products online in Hong Kong free of charge as the
                  initial phase of the social enterprise prototype funded by the SIE Fund through BeHub as intermediary.
                </p>

                <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                  EMC Hub aims to develop entrepreneurship through self-help community of change-makers collaborating for
                  mutual benefit to enact positive change, collectively developing a local online and on the ground
                  community support <span className="text-primary font-semibold">#halalmarketplace</span> platform that
                  caters to community needs and stimulate local EM business development through digital transformation to
                  improve market share.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* TD Beta Testing Section */}
          <Card className="shadow-xl border-2 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black mb-4" style={{ color: "hsl(86 49% 45%)" }}>
                  TimeDollars (TD) is now in Beta, want to be an early tester?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  We’re inviting people, vendors, and NGOs to help us test TD earning and redemption flows and shape the
                  next version.
                </p>
              </div>

              <div className="bg-primary/5 rounded-2xl p-8 mb-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: "hsl(86 49% 45%)" }}>
                      Status
                    </h3>
                    <p className="text-muted-foreground">Beta Phase (limited slots)</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: "hsl(86 49% 45%)" }}>
                      Who can join
                    </h3>
                    <p className="text-muted-foreground">Users, merchants/vendors, community groups, NGOs</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: "hsl(86 49% 45%)" }}>
                      What you’ll test
                    </h3>
                    <p className="text-muted-foreground">
                      Earn TD, redeem TD, merchant rules (limits), checkout experience
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: "hsl(86 49% 45%)" }}>
                      Your benefit
                    </h3>
                    <p className="text-muted-foreground">
                      Early access, priority onboarding, and direct influence on final features
                    </p>
                  </div>
                </div>
              </div>

              {/* ✅ Only one button now, scrolls to contact form */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={scrollToContact}
                  className="bg-primary text-primary-foreground hover:opacity-90 px-8 py-4 font-semibold rounded-xl shadow-lg"
                  data-testid="btn-join-td-beta"
                >
                  Contact ILM to Join Beta
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Us Section */}
          <Card className="shadow-xl mt-8" id="contact">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-4" style={{ color: "hsl(86 49% 45%)" }}>
                  Contact Us
                </h2>
                <p className="text-lg text-muted-foreground">Have questions? We'd love to hear from you.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="space-y-6">
                  <h3 className="font-bold text-xl mb-4">Get in Touch</h3>

                  <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Email</p>
                      <a
                        href="mailto:emchub@ilm.org.hk"
                        className="text-primary hover:underline"
                        data-testid="link-email"
                      >
                        emchub@ilm.org.hk
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Phone</p>
                      <a href="tel:+85292605885" className="text-primary hover:underline" data-testid="link-phone">
                        +852 9260 5885
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Our team is available Monday to Friday, 9:00 AM - 6:00 PM (HKT). We typically respond to inquiries
                      within 24-48 hours.
                    </p>
                  </div>
                </div>

                {/* Contact Form */}
                <div>
                  <h3 className="font-bold text-xl mb-4">Send us a Message</h3>

                  {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CheckCircle className="w-16 h-16 text-primary mb-4" />
                      <h4 className="text-xl font-semibold mb-2">Thank You!</h4>
                      <p className="text-muted-foreground">
                        Your message has been sent successfully. We'll get back to you soon.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          data-testid="input-contact-name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          data-testid="input-contact-email"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="What is this about?"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                          data-testid="input-contact-subject"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Write your message here..."
                          rows={5}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          data-testid="input-contact-message"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full gap-2"
                        disabled={isSubmitting}
                        data-testid="button-submit-contact"
                      >
                        {isSubmitting ? (
                          <>Sending...</>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
