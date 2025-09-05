import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

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
        
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ) : isAuthenticated && user ? (
          <>
            {/* User Profile Section */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {(user.firstName || user.lastName) && (
                    <p className="font-medium truncate">
                      {user.firstName} {user.lastName}
                    </p>
                  )}
                  {user.email && (
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
              
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" data-testid="mobile-button-add-listing">
                Add Listing
              </Button>
              
              <a 
                href="/api/logout" 
                className="flex items-center justify-center w-full py-2 text-foreground hover:text-primary transition-colors border border-border rounded-lg"
                data-testid="mobile-link-logout"
                onClick={onClose}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </a>
            </div>
          </>
        ) : (
          <>
            <a href="/api/login" className="block text-foreground hover:text-primary font-medium py-2 transition-colors" data-testid="mobile-link-signin" onClick={onClose}>
              Sign In
            </a>
            <a href="/api/login" className="block text-foreground hover:text-primary font-medium py-2 transition-colors" data-testid="mobile-link-signup" onClick={onClose}>
              Sign Up
            </a>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" data-testid="mobile-button-add-listing">
              Add Listing
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
