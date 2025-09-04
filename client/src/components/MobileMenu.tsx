import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <div 
      className={`md:hidden fixed top-16 left-0 w-full h-screen bg-background z-40 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      data-testid="mobile-menu"
    >
      <div className="px-4 py-6 space-y-4">
        <a href="#" className="block text-foreground hover:text-primary font-medium py-2 transition-colors" data-testid="mobile-nav-home" onClick={onClose}>
          Home
        </a>
        <a href="#" className="block text-foreground hover:text-primary font-medium py-2 transition-colors" data-testid="mobile-nav-map" onClick={onClose}>
          Map of Listings
        </a>
        <a href="#" className="block text-foreground hover:text-primary font-medium py-2 transition-colors" data-testid="mobile-nav-listings" onClick={onClose}>
          All Listings
        </a>
        <a href="#" className="block text-foreground hover:text-primary font-medium py-2 transition-colors" data-testid="mobile-nav-blog" onClick={onClose}>
          Blog
        </a>
        <a href="#" className="block text-foreground hover:text-primary font-medium py-2 transition-colors" data-testid="mobile-nav-about" onClick={onClose}>
          About Us
        </a>
        <hr className="border-border my-4" />
        <a href="#" className="block text-foreground hover:text-primary font-medium py-2 transition-colors" data-testid="mobile-link-signin" onClick={onClose}>
          Sign In
        </a>
        <a href="#" className="block text-foreground hover:text-primary font-medium py-2 transition-colors" data-testid="mobile-link-signup" onClick={onClose}>
          Sign Up
        </a>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" data-testid="mobile-button-add-listing">
          Add Listing
        </Button>
      </div>
    </div>
  );
}
