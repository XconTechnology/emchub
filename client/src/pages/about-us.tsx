import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export default function AboutUs() {
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
