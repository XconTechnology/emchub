import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, GraduationCap, Globe, Store, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-16 pb-28 background-pattern overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 morphing-blob blur-2xl floating-element"></div>
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-gradient-to-tl from-primary/25 to-primary/10 morphing-blob blur-3xl floating-element" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-r from-primary/15 to-primary/8 morphing-blob blur-2xl floating-element" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-gradient-to-bl from-primary/12 to-primary/6 morphing-blob blur-2xl floating-element" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <div className="mb-12 fade-in">
            <div className="inline-block mb-6">
              <span className="inline-block px-6 py-2 bg-primary/15 text-primary font-semibold rounded-full text-sm uppercase tracking-wider mb-6">
                🕌 Halal Directory
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground leading-tight mb-8">
              Searching for a<br />
              <span className="relative">
                halal place?
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-primary/20 -skew-x-12 transform"></div>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium">
              Discover the best places to stay, eat, shop & visit the city nearest to you.<br />
              <span className="text-primary font-semibold">Join thousands of Muslims finding authentic halal experiences.</span>
            </p>
          </div>
          
          {/* Enhanced 3D Search Bar */}
          <div className="max-w-6xl mx-auto mb-16 fade-in card-3d" data-testid="hero-search-container">
            <div className="card-inner">
              <div className="relative bg-white/90 dark:bg-card/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-primary/20 p-4 hover-lift">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl"></div>
                <div className="relative flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-primary w-6 h-6 z-10" />
                    <Input
                      type="text"
                      placeholder="Search businesses, cuisines, services..."
                      className="w-full pl-16 pr-8 py-6 bg-gradient-to-r from-secondary/20 to-secondary/10 border-2 border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary text-lg font-medium placeholder:text-muted-foreground/70 transition-all"
                      data-testid="input-search"
                    />
                  </div>
                  <div className="relative min-w-[260px]">
                    <Select>
                      <SelectTrigger className="px-8 py-6 bg-gradient-to-r from-secondary/20 to-secondary/10 border-2 border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary text-lg font-medium transition-all" data-testid="select-category">
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
                  <Button className="relative bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground px-12 py-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 pulse-ring" data-testid="button-search">
                    <Search className="w-6 h-6 mr-3" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic OR Divider */}
          <div className="flex items-center justify-center mb-16 fade-in">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-primary/60 max-w-48"></div>
            <div className="mx-10 relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden floating-element">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                <span className="relative text-primary-foreground font-black text-lg tracking-widest text-glow">OR</span>
              </div>
            </div>
            <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-primary/30 to-primary/60 max-w-48"></div>
          </div>

          {/* 3D Browse by Category */}
          <div className="fade-in">
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-12 text-glow">Browse by category</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="group card-3d" data-testid="category-school">
                <div className="card-inner bg-white/95 dark:bg-card/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl cursor-pointer border-2 border-primary/20 hover:border-primary/50 transition-all duration-500 hover-lift relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent rounded-3xl"></div>
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100 dark:from-blue-900/60 dark:to-blue-800/40 rounded-3xl mx-auto mb-8 flex items-center justify-center group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-xl floating-element">
                      <GraduationCap className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors duration-300">School</h3>
                  </div>
                </div>
              </div>
              
              <div className="group card-3d" data-testid="category-online">
                <div className="card-inner bg-white/95 dark:bg-card/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl cursor-pointer border-2 border-primary/20 hover:border-primary/50 transition-all duration-500 hover-lift relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-transparent rounded-3xl"></div>
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 via-cyan-50 to-cyan-100 dark:from-cyan-900/60 dark:to-cyan-800/40 rounded-3xl mx-auto mb-8 flex items-center justify-center group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-xl floating-element" style={{animationDelay: '1s'}}>
                      <Globe className="w-12 h-12 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors duration-300">Online</h3>
                  </div>
                </div>
              </div>
              
              <div className="group card-3d" data-testid="category-provision-store">
                <div className="card-inner bg-white/95 dark:bg-card/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl cursor-pointer border-2 border-primary/20 hover:border-primary/50 transition-all duration-500 hover-lift relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent rounded-3xl"></div>
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl mx-auto mb-8 flex items-center justify-center group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-xl floating-element" style={{animationDelay: '2s'}}>
                      <Store className="w-12 h-12 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors duration-300">Provision-Store</h3>
                  </div>
                </div>
              </div>
              
              <div className="group card-3d" data-testid="category-masjid">
                <div className="card-inner bg-white/95 dark:bg-card/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl cursor-pointer border-2 border-primary/20 hover:border-primary/50 transition-all duration-500 hover-lift relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl"></div>
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/30 rounded-3xl mx-auto mb-8 flex items-center justify-center group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-xl floating-element pulse-ring" style={{animationDelay: '3s'}}>
                      <MapPin className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors duration-300">Masjid</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
