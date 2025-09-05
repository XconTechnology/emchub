import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X, User, LogOut } from "lucide-react";
import MobileMenu from "./MobileMenu";
import AuthModal from "./AuthModal";
import AddListingModal from "./AddListingModal";
import emcLogo from "@assets/image_1756989816731.png";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isOpen, mode, openSignIn, openSignUp, close } = useAuthModal();

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
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ) : isAuthenticated && user ? (
                <>
                  <Button 
                    onClick={() => setIsAddListingModalOpen(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" 
                    data-testid="button-add-listing"
                  >
                    Add Listing
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="button-user-menu">
                        {user.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt="Profile"
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          {(user.firstName || user.lastName) && (
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                          )}
                          {user.email && (
                            <p className="w-[200px] truncate text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <a href="/api/logout" className="cursor-pointer" data-testid="link-logout">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </a>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={openSignIn}
                    className="text-foreground hover:text-primary font-medium transition-colors" 
                    data-testid="button-signin"
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={openSignUp}
                    className="text-foreground hover:text-primary font-medium transition-colors" 
                    data-testid="button-signup"
                  >
                    Sign Up
                  </Button>
                  <Button 
                    onClick={openSignIn}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" 
                    data-testid="button-add-listing-guest"
                  >
                    Add Listing
                  </Button>
                </>
              )}
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

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenSignIn={openSignIn}
        onOpenSignUp={openSignUp}
        onOpenAddListing={() => setIsAddListingModalOpen(true)}
      />

      {/* Authentication Modal */}
      <AuthModal isOpen={isOpen} onClose={close} initialMode={mode} />

      {/* Add Listing Modal */}
      <AddListingModal 
        isOpen={isAddListingModalOpen} 
        onClose={() => setIsAddListingModalOpen(false)} 
      />
    </>
  );
}
