import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, LayoutDashboard, Settings, ShoppingCart, MessageSquare } from "lucide-react";
import { Link, useLocation } from "wouter";
import AddListingModal from "./AddListingModal";
import { BecomeVendorModal } from "./BecomeVendorModal";
import emcLogo from "@assets/logo.png";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  forceSolid?: boolean;
}

export default function Header({ forceSolid = false }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, isLoading, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch cart items for logged-in users
  const { data: cartItems = [] } = useQuery<any[]>({
    queryKey: ['/api/cart'],
    enabled: !!user,
  });

  // Fetch unread notification counts with real-time polling
  const { data: notificationCounts } = useQuery<{
    totalUnread: number;
    conversationUnread: number;
    serviceRequestUnread: number;
  }>({
    queryKey: ['/api/notifications/unread-counts'],
    enabled: !!user,
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

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
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <Link href="/" className={`nav-link text-sm xl:text-base font-medium transition-colors whitespace-nowrap ${isSolid ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-home">
                Home
              </Link>
              <Link href="/products" className={`nav-link text-sm xl:text-base font-medium transition-colors whitespace-nowrap ${isSolid ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-products">
                Products
              </Link>
              <Link href="/events" className={`nav-link text-sm xl:text-base font-medium transition-colors whitespace-nowrap ${isSolid ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-events">
                Events
              </Link>
              <Link href="/map" className={`nav-link text-sm xl:text-base font-medium transition-colors whitespace-nowrap ${isSolid ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-map">
                Map
              </Link>
              <Link href="/explore" className={`nav-link text-sm xl:text-base font-medium transition-colors whitespace-nowrap ${isSolid ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-explore">
                Explore
              </Link>
              <Link href="/about-us" className={`nav-link text-sm xl:text-base font-medium transition-colors whitespace-nowrap ${isSolid ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-about">
                About Us
              </Link>
              <Link href="/how-timebanks-work" className={`nav-link text-sm xl:text-base font-medium transition-colors whitespace-nowrap ${isSolid ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-timebanks">
                How TimeBanks Work
              </Link>
              {user?.isAdmin && (
                <Link href="/admin" className={`nav-link text-sm xl:text-base font-medium transition-colors whitespace-nowrap ${isSolid ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`} data-testid="nav-admin">
                  Admin
                </Link>
              )}
            </div>

            {/* User Actions */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
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
                  
                  {/* Messages Icon with Notification Badge */}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setLocation('/dashboard/services')}
                    className="relative rounded-full hover:bg-gray-100/20 transition-all"
                    data-testid="button-messages"
                  >
                    <div className="w-10 h-10 rounded-full bg-[hsl(200,80%,50%)] flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    {(notificationCounts?.totalUnread || 0) > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 bg-red-500 text-white text-xs animate-pulse"
                        data-testid="messages-badge"
                      >
                        {notificationCounts?.totalUnread}
                      </Badge>
                    )}
                  </Button>

                  {/* Cart Icon */}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setLocation('/dashboard/cart')}
                    className="relative rounded-full hover:bg-gray-100/20 transition-all"
                    data-testid="button-cart"
                  >
                    <div className="w-10 h-10 rounded-full bg-[hsl(86,49%,53%)] flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    {cartItems.length > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                        data-testid="cart-badge"
                      >
                        {cartItems.length}
                      </Badge>
                    )}
                  </Button>

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
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`transition-colors ${isSolid ? 'text-gray-900 hover:text-primary' : 'text-white hover:text-white/80'}`}
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

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-16 left-0 right-0 z-[1100] max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => { setLocation('/'); setIsMobileMenuOpen(false); }}
              data-testid="mobile-nav-home"
            >
              Home
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => { setLocation('/products'); setIsMobileMenuOpen(false); }}
              data-testid="mobile-nav-products"
            >
              Products
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => { setLocation('/events'); setIsMobileMenuOpen(false); }}
              data-testid="mobile-nav-events"
            >
              Events
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => { setLocation('/map'); setIsMobileMenuOpen(false); }}
              data-testid="mobile-nav-map"
            >
              Map of Listings
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => { setLocation('/explore'); setIsMobileMenuOpen(false); }}
              data-testid="mobile-nav-explore"
            >
              Explore
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => { setLocation('/about-us'); setIsMobileMenuOpen(false); }}
              data-testid="mobile-nav-about"
            >
              About Us
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => { setLocation('/how-timebanks-work'); setIsMobileMenuOpen(false); }}
              data-testid="mobile-nav-timebanks"
            >
              How TimeBanks Work
            </Button>
            {user?.isAdmin && (
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={() => { setLocation('/admin'); setIsMobileMenuOpen(false); }}
                data-testid="mobile-nav-admin"
              >
                Admin
              </Button>
            )}
            <div className="border-t my-2"></div>
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
                <Button 
                  variant="ghost" 
                  className="w-full justify-start relative"
                  onClick={() => { setLocation('/dashboard/services'); setIsMobileMenuOpen(false); }}
                  data-testid="mobile-link-messages"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                  {(notificationCounts?.totalUnread || 0) > 0 && (
                    <Badge 
                      className="ml-auto h-5 min-w-5 flex items-center justify-center p-0 px-1 bg-red-500 text-white text-xs animate-pulse"
                    >
                      {notificationCounts?.totalUnread}
                    </Badge>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start relative"
                  onClick={() => setLocation('/dashboard/cart')}
                  data-testid="mobile-link-cart"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  My Cart
                  {cartItems.length > 0 && (
                    <Badge 
                      className="ml-auto h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                    >
                      {cartItems.length}
                    </Badge>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setLocation('/dashboard')}
                  data-testid="mobile-link-dashboard"
                >
                  My Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setLocation('/profile')}
                  data-testid="mobile-link-profile"
                >
                  Profile
                </Button>
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
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => { setLocation('/auth'); setIsMobileMenuOpen(false); }}
                  data-testid="mobile-button-signin"
                >
                  Sign In
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => { setLocation('/auth'); setIsMobileMenuOpen(false); }}
                  data-testid="mobile-button-signup"
                >
                  Sign Up
                </Button>
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
