import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, GraduationCap, Globe, Store, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-20 pb-20 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <div className="mb-8 fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight mb-6">
              Searching for a halal place?
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
              Discover the best places to stay, eat, shop & visit the city nearest to you.
            </p>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-5xl mx-auto mb-12 fade-in" data-testid="hero-search-container">
            <div className="bg-white dark:bg-card rounded-3xl shadow-2xl border border-primary/10 p-3">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
                  <Input
                    type="text"
                    placeholder="Search businesses, cuisines, services..."
                    className="w-full pl-14 pr-6 py-5 bg-secondary/30 border-0 rounded-2xl focus:ring-2 focus:ring-primary text-lg font-medium placeholder:text-muted-foreground/60"
                    data-testid="input-search"
                  />
                </div>
                <div className="relative min-w-[240px]">
                  <Select>
                    <SelectTrigger className="px-6 py-5 bg-secondary/30 border-0 rounded-2xl focus:ring-2 focus:ring-primary text-lg font-medium" data-testid="select-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="food">Food & Dining</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="accommodation">Accommodation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-lg hover:shadow-xl" data-testid="button-search">
                  <Search className="w-5 h-5 mr-3" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Elegant OR Divider */}
          <div className="flex items-center justify-center mb-12 fade-in">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent max-w-40"></div>
            <div className="mx-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-base tracking-wider">OR</span>
              </div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent max-w-40"></div>
          </div>

          {/* Browse by Category */}
          <div className="fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10">Browse by category</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="group bg-white dark:bg-card rounded-3xl p-8 shadow-lg hover:shadow-2xl cursor-pointer border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2" data-testid="category-school">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 rounded-3xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <GraduationCap className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">School</h3>
              </div>
              
              <div className="group bg-white dark:bg-card rounded-3xl p-8 shadow-lg hover:shadow-2xl cursor-pointer border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2" data-testid="category-online">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-900/40 dark:to-cyan-800/20 rounded-3xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Globe className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">Online</h3>
              </div>
              
              <div className="group bg-white dark:bg-card rounded-3xl p-8 shadow-lg hover:shadow-2xl cursor-pointer border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2" data-testid="category-provision-store">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Store className="w-10 h-10 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">Provision-Store</h3>
              </div>
              
              <div className="group bg-white dark:bg-card rounded-3xl p-8 shadow-lg hover:shadow-2xl cursor-pointer border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2" data-testid="category-masjid">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <MapPin className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">Masjid</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
