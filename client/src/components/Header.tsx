import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X } from "lucide-react";
import MobileMenu from "./MobileMenu";
import emcLogo from "@assets/image_1756989613955.png";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "glassmorphism shadow-lg" : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center" data-testid="logo">
              <img 
                src={emcLogo} 
                alt="EMC HUB Logo" 
                className="w-10 h-10 mr-3"
              />
              <span className="font-bold text-xl text-foreground">EMC HUB</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="nav-link text-foreground hover:text-primary font-medium" data-testid="nav-home">
                Home
              </a>
              <a href="#" className="nav-link text-foreground hover:text-primary font-medium" data-testid="nav-map">
                Map of Listings
              </a>
              <div className="relative group">
                <a href="#" className="nav-link text-foreground hover:text-primary font-medium flex items-center" data-testid="nav-listings">
                  All Listings
                  <ChevronDown className="ml-1 w-4 h-4" />
                </a>
              </div>
              <div className="relative group">
                <a href="#" className="nav-link text-foreground hover:text-primary font-medium flex items-center" data-testid="nav-blog">
                  Blog
                  <ChevronDown className="ml-1 w-4 h-4" />
                </a>
              </div>
              <a href="#" className="nav-link text-foreground hover:text-primary font-medium" data-testid="nav-about">
                About Us
              </a>
            </div>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <a href="#" className="text-foreground hover:text-primary font-medium transition-colors" data-testid="link-signin">
                Sign In
              </a>
              <a href="#" className="text-foreground hover:text-primary font-medium transition-colors" data-testid="link-signup">
                Sign Up
              </a>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" data-testid="button-add-listing">
                Add Listing
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground hover:text-primary"
                data-testid="button-mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}
