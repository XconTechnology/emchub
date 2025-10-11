import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X, User, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import AddListingModal from "./AddListingModal";
import { BecomeVendorModal } from "./BecomeVendorModal";
import emcLogo from "@assets/image_1756989816731.png";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  forceSolid?: boolean;
}

export default function Header({ forceSolid = false }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const { user, isLoading, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSolid = forceSolid || isScrolled;

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-[1200] transition-all duration-300 ${
          isSolid ? "glassmorphism shadow-lg" : "bg-transparent"
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
              <span className={`font-bold text-xl transition-colors ${isSolid ? 'text-gray-900' : 'text-white'}`}>EMC HUB</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className={`nav-link font-medium transition-colors ${isSolid ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-home">
                Home
              </Link>
              <Link href="/map" className={`nav-link font-medium transition-colors ${isSolid ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-map">
                Map of Listings
              </Link>
              <Link href="/explore" className={`nav-link font-medium transition-colors ${isSolid ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-explore">
                Explore
              </Link>
              <Link href="/about-us" className={`nav-link font-medium transition-colors ${isSolid ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-about">
                About Us
              </Link>
              {user?.isAdmin && (
                <Link href="/admin" className={`nav-link font-medium transition-colors ${isSolid ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-admin">
                  Admin
                </Link>
              )}
            </div>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ) : user ? (
                <>
                  {user.vendorStatus === 'verified' && (
                    <Button 
                      onClick={() => setIsAddListingModalOpen(true)}
                      className="bg-[hsl(86,49%,53%)] text-white hover:bg-[hsl(86,49%,48%)] transition-colors" 
                      data-testid="button-add-listing"
                    >
                      Add Listing
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="rounded-full hover:bg-gray-100/20 transition-all"
                        data-testid="button-profile-menu"
                      >
                        <div className="w-10 h-10 rounded-full bg-[hsl(86,49%,53%)] flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 shadow-xl border-0 z-[1300]" align="end" forceMount>
                      <DropdownMenuLabel className="py-3">
                        <div className="flex flex-col space-y-2">
                          <p className="text-base font-semibold leading-none">{user.username}</p>
                          <p className="text-xs leading-none text-muted-foreground font-normal">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="my-1" />
                      <div className="py-1">
                        <DropdownMenuItem onClick={() => setLocation("/dashboard")} className="py-2.5 cursor-pointer hover:bg-gray-100 transition-colors" data-testid="menu-dashboard">
                          <LayoutDashboard className="mr-3 h-4 w-4 text-gray-600" />
                          <span className="font-medium">My Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation("/profile")} className="py-2.5 cursor-pointer hover:bg-gray-100 transition-colors" data-testid="menu-profile">
                          <User className="mr-3 h-4 w-4 text-gray-600" />
                          <span className="font-medium">Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation("/dashboard/settings")} className="py-2.5 cursor-pointer hover:bg-gray-100 transition-colors" data-testid="menu-settings">
                          <Settings className="mr-3 h-4 w-4 text-gray-600" />
                          <span className="font-medium">Settings</span>
                        </DropdownMenuItem>
                      </div>
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem 
                        onClick={() => {
                          logoutMutation.mutate(undefined, {
                            onSuccess: () => {
                              setLocation("/");
                            }
                          });
                        }}
                        className="py-2.5 cursor-pointer hover:bg-red-50 transition-colors text-red-600"
                        data-testid="menu-logout"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span className="font-medium">Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <Button 
                      variant="ghost" 
                      className={`font-medium transition-colors ${isSolid ? 'text-gray-900 hover:text-gray-700' : 'text-white hover:text-gray-900'}`}
                      data-testid="button-signin"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button 
                      variant="ghost" 
                      className={`font-medium transition-colors ${isSolid ? 'text-gray-900 hover:text-gray-700' : 'text-white hover:text-gray-900'}`}
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
                {user.vendorStatus === 'verified' && (
                  <Button 
                    onClick={() => setIsAddListingModalOpen(true)}
                    className="w-full justify-start bg-[hsl(86,49%,53%)] text-white hover:bg-[hsl(86,49%,48%)]"
                    data-testid="mobile-button-add-listing"
                  >
                    Add Listing
                  </Button>
                )}
                <Link href="/profile">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    data-testid="mobile-link-profile"
                  >
                    Profile
                  </Button>
                </Link>
                {user.vendorStatus !== 'verified' && (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setIsVendorModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                    data-testid="mobile-link-become-vendor"
                  >
                    Become a Vendor
                  </Button>
                )}
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
      
      {/* Become a Vendor Modal */}
      <BecomeVendorModal 
        isOpen={isVendorModalOpen} 
        onClose={() => setIsVendorModalOpen(false)} 
      />
    </>
  );
}
