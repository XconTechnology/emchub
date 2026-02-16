import { useState } from "react";
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";
import emcLogo from "@assets/logo.png";
import ContactSupportForm from "./ContactSupportForm";
import { useAuth } from "@/hooks/use-auth";

export default function Footer() {
  const { user } = useAuth();
  const [showSupportForm, setShowSupportForm] = useState(false);

  const handleSupportClick = () => {
    if (user) setShowSupportForm(true);
    else window.location.href = "/auth";
  };

  return (
    <>
      <footer className="bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <img src={emcLogo} alt="EMC HUB Logo" className="w-10 h-10 mr-3" />
                <span className="font-bold text-xl">EMC HUB</span>
              </div>
              <p className="text-background/80 mb-6">
                Connecting Hong Kong&apos;s ethnic minority community through digital discovery.
                Find, support, and celebrate the diverse businesses that make our city vibrant.
              </p>

              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/emchubHK/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-background/20 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                  data-testid="social-facebook"
                  aria-label="EMC HUB on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>

                <a
                  href="https://www.instagram.com/emchubhk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-background/20 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                  data-testid="social-instagram"
                  aria-label="EMC HUB on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                <a
                  href="https://www.linkedin.com/company/emchub/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-background/20 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                  data-testid="social-linkedin"
                  aria-label="EMC HUB on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-background/80 hover:text-primary transition-colors" data-testid="footer-link-home">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="text-background/80 hover:text-primary transition-colors" data-testid="footer-link-events">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/map" className="text-background/80 hover:text-primary transition-colors" data-testid="footer-link-map">
                    Map View
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-background/80 hover:text-primary transition-colors" data-testid="footer-link-products">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/about-us" className="text-background/80 hover:text-primary transition-colors" data-testid="footer-link-about">
                    About Us
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleSupportClick}
                    className="text-background/80 hover:text-primary transition-colors text-left"
                    data-testid="footer-link-contact-support"
                  >
                    Contact Support
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold mb-4">Contact Info</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-background/80">
                  <Mail className="w-4 h-4 mr-3" />
                  <span data-testid="contact-email">emchub@ilm.org.hk</span>
                </li>
                <li className="flex items-center text-background/80">
                  <Phone className="w-4 h-4 mr-3" />
                  <span data-testid="contact-phone">+852 9260 5885</span>
                </li>
                <li className="flex items-start text-background/80">
                  <MapPin className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                  <span data-testid="contact-address">
                    Unit C, 4/F, 760 Cheung Sha Wan Rd, Lai Chi Kok, Kowloon, Hong Kong
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <hr className="border-background/20 my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-background/60 text-sm" data-testid="copyright">
              © 2024 EMC HUB. All rights reserved.
            </p>

            <div className="flex space-x-6 mt-4 md:mt-0">
              {/* ✅ Privacy Policy Link */}
              <Link
                href="/privacy-policy"
                className="text-background/60 hover:text-primary transition-colors text-sm"
                data-testid="footer-link-privacy"
              >
                Privacy Policy
              </Link>

              {/* ✅ Terms of Service Link */}
              <Link
                href="/terms-of-use"
                className="text-background/60 hover:text-primary transition-colors text-sm"
                data-testid="footer-link-terms"
              >
                Terms of Service
              </Link>

              {/* ✅ Support -> opens same support form */}
              <button
                onClick={handleSupportClick}
                className="text-background/60 hover:text-primary transition-colors text-sm"
                data-testid="footer-link-support"
              >
                Support
              </button>
            </div>
          </div>
        </div>
      </footer>

      <ContactSupportForm isOpen={showSupportForm} onClose={() => setShowSupportForm(false)} />
    </>
  );
}
