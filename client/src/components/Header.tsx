import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X, User, LogOut } from "lucide-react";
import { Link } from "wouter";
import AddListingModal from "./AddListingModal";
import emcLogo from "@assets/image_1756989816731.png";
import { useAuth } from "@/hooks/use-auth";
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
  const { user, isLoading, logoutMutation } = useAuth();

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
              <span className={`font-bold text-xl transition-colors ${isScrolled ? 'text-gray-900' : 'text-white'}`}>EMC HUB</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className={`nav-link font-medium transition-colors ${isScrolled ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-home">
                Home
              </a>
              <a href="#" className={`nav-link font-medium transition-colors ${isScrolled ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-map">
                Map of Listings
              </a>
              <div className="relative group">
                <a href="#" className={`nav-link font-medium flex items-center transition-colors ${isScrolled ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-listings">
                  All Listings
                  <ChevronDown className="ml-1 w-4 h-4" />
                </a>
              </div>
              <div className="relative group">
                <a href="#" className={`nav-link font-medium flex items-center transition-colors ${isScrolled ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-blog">
                  Blog
                  <ChevronDown className="ml-1 w-4 h-4" />
                </a>
              </div>
              <a href="#" className={`nav-link font-medium transition-colors ${isScrolled ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-about">
                About Us
              </a>
            </div>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ) : user ? (
                <>
                  <Button 
                    onClick={() => setIsAddListingModalOpen(true)}
                    className="bg-[hsl(86,49%,53%)] text-white hover:bg-[hsl(86,49%,48%)] transition-colors" 
                    data-testid="button-add-listing"
                  >
                    Add Listing
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className={`relative h-10 px-4 rounded-md transition-colors ${isScrolled ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`}
                        data-testid="button-profile"
                      >
                        <User className="h-5 w-5 mr-2" />
                        Profile
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
                        <Link href="/profile" className="cursor-pointer" data-testid="link-profile">
                          <User className="mr-2 h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => logoutMutation.mutate()}
                        className="cursor-pointer"
                        data-testid="button-logout"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <Button 
                      variant="ghost" 
                      className={`font-medium transition-colors ${isScrolled ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`}
                      data-testid="button-signin"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button 
                      variant="ghost" 
                      className={`font-medium transition-colors ${isScrolled ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`}
                      data-testid="button-signup"
                    >
                      Sign Up
                    </Button>
                  </Link>
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

      {/* Mobile menu - simplified for now */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            {user ? (
              <>
                <Button 
                  onClick={() => setIsAddListingModalOpen(true)}
                  className="w-full justify-start bg-[hsl(86,49%,53%)] text-white hover:bg-[hsl(86,49%,48%)]"
                  data-testid="mobile-button-add-listing"
                >
                  Add Listing
                </Button>
                <Link href="/profile">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    data-testid="mobile-link-profile"
                  >
                    Profile
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={() => logoutMutation.mutate()}
                  className="w-full justify-start"
                  data-testid="mobile-button-logout"
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" className="w-full justify-start" data-testid="mobile-button-signin">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button variant="ghost" className="w-full justify-start" data-testid="mobile-button-signup">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Listing Modal */}
      <AddListingModal 
        isOpen={isAddListingModalOpen} 
        onClose={() => setIsAddListingModalOpen(false)} 
      />
    </>
  );
}
