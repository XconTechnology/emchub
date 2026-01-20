import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ExternalLink, Mail, Phone, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    setFormData({ name: "", email: "", subject: "", message: "" });
    
    // Reset success state after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header forceSolid={true} />
      
      <main className="pt-16">
        {/* Hero Section */}
        <div className="text-white relative overflow-hidden" style={{background: "linear-gradient(135deg, hsl(86 49% 53%) 0%, hsl(86 49% 45%) 50%, hsl(86 49% 38%) 100%)"}}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
            <h1 className="text-5xl md:text-6xl font-black mb-6 text-center">
              Welcome to EMC Hub
            </h1>
            <p className="text-xl text-white/90 text-center max-w-3xl mx-auto">
              Your Gateway to Hong Kong's Halal Marketplace
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="shadow-xl mb-8">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                  Ethnic Minority Hub (EMC Hub) is a community <span className="text-primary font-semibold">#halalmarketplace</span> web platform to assist small shops and other businesses to digitize and promote their products online in Hong Kong free of charge as the initial phase of the social enterprise prototype funded by the SIE Fund through BeHub as intermediary.
                </p>

                <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                  EMC Hub aims to develop entrepreneurship through self-help community of change-makers collaborating for mutual benefit to enact positive change, collectively developing a local online and on the ground community support <span className="text-primary font-semibold">#halalmarketplace</span> platform that caters to community needs and stimulate local EM business development through digital transformation to improve market share.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Event Section */}
          <Card className="shadow-xl border-2 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black mb-4" style={{color: "hsl(86 49% 45%)"}}>
                  Ready to join our next phase to grow the halal marketplace emchub.hk?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Join us to exhibit your products in our booth
                </p>
              </div>

              <div className="bg-primary/5 rounded-2xl p-8 mb-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{color: "hsl(86 49% 45%)"}}>Event Details</h3>
                    <a 
                      href="https://www.exhibitiongroup.com.hk/exhibitions/lohasexpo2024"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-2"
                      data-testid="link-event-details"
                    >
                      LOHAS Expo 2024
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{color: "hsl(86 49% 45%)"}}>Date</h3>
                    <p className="text-muted-foreground">January 26-28, 2024</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{color: "hsl(86 49% 45%)"}}>Venue</h3>
                    <p className="text-muted-foreground">The Hong Kong Convention & Exhibition Centre</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{color: "hsl(86 49% 45%)"}}>Focus</h3>
                    <p className="text-muted-foreground">Halal products and services, promoting SMEs</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Us Section */}
          <Card className="shadow-xl mt-8" id="contact">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-4" style={{color: "hsl(86 49% 45%)"}}>
                  Contact Us
                </h2>
                <p className="text-lg text-muted-foreground">
                  Have questions? We'd love to hear from you.
                </p>
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
                      <a 
                        href="tel:+852 9260 5885" 
                        className="text-primary hover:underline"
                        data-testid="link-phone"
                      >
                        +852 9260 5885
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Our team is available Monday to Friday, 9:00 AM - 6:00 PM (HKT). 
                      We typically respond to inquiries within 24-48 hours.
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
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
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
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
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
