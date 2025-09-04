import { Search, Heart, Handshake } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Discover",
      description: "Browse through hundreds of ethnic minority businesses using our advanced search and map features",
    },
    {
      icon: Heart,
      title: "Connect",
      description: "Read reviews, view photos, and get contact information to connect with local business owners",
    },
    {
      icon: Handshake,
      title: "Support",
      description: "Support ethnic minority entrepreneurs by visiting their businesses and sharing your experiences",
    },
  ];

  return (
    <section className="py-16 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How EMC HUB Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Connecting communities through digital discovery
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center" data-testid={`how-it-works-step-${index}`}>
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <step.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
