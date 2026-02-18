import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedBusinesses from "@/components/FeaturedBusinesses";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <FeaturedBusinesses />
        <HowItWorks />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
