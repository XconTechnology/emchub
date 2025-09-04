import { Card, CardContent } from "@/components/ui/card";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Rashid Ahmed",
      role: "Restaurant Owner",
      initial: "R",
      content: "EMC HUB helped my restaurant reach new customers and grow our community presence. The platform is easy to use and brings real value to ethnic minority businesses.",
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "Local Resident",
      initial: "S",
      content: "I love discovering new authentic cuisines and services in my neighborhood. EMC HUB makes it so easy to find amazing ethnic minority businesses I never knew existed.",
    },
    {
      id: 3,
      name: "Abdul Malik",
      role: "Shop Owner",
      initial: "A",
      content: "The map feature is fantastic! Customers can easily find my shop, and I've seen a significant increase in foot traffic since joining EMC HUB.",
    },
  ];

  return (
    <section className="py-16 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Community Says
          </h2>
          <p className="text-xl text-muted-foreground">
            Real stories from business owners and customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-card rounded-2xl shadow-lg hover-lift border-0" data-testid={`testimonial-${testimonial.id}`}>
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-foreground font-bold">
                      {testimonial.initial}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground" data-testid={`testimonial-name-${testimonial.id}`}>
                      {testimonial.name}
                    </h4>
                    <p className="text-muted-foreground text-sm" data-testid={`testimonial-role-${testimonial.id}`}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground italic" data-testid={`testimonial-content-${testimonial.id}`}>
                  "{testimonial.content}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
