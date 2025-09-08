import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, GraduationCap, Globe, Store, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section className="py-16 bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 dark:from-green-700 dark:via-green-800 dark:to-emerald-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Searching for a halal place?
            </h1>
            <p className="text-lg md:text-xl text-green-50 max-w-3xl mx-auto opacity-90">
              Discover the best places to stay, eat, shop & visit the city nearest to you.
            </p>
          </div>
          
          {/* Clean Search Bar */}
          <div className="max-w-4xl mx-auto mb-10" data-testid="hero-search-container">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search businesses, cuisines, services..."
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base shadow-sm"
                    data-testid="input-search"
                  />
                </div>
                <div className="relative min-w-[200px]">
                  <Select>
                    <SelectTrigger className="px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm" data-testid="select-category">
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
                <Button className="bg-green-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-800 transition-colors shadow-lg hover:shadow-xl" data-testid="button-search">
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Simple OR Divider */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex-1 h-px bg-white/30 max-w-32"></div>
            <div className="mx-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <span className="text-white font-semibold text-sm">OR</span>
              </div>
            </div>
            <div className="flex-1 h-px bg-white/30 max-w-32"></div>
          </div>

          {/* Simple Browse by Category */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-8">Browse by category</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all cursor-pointer group" data-testid="category-school">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-center font-semibold text-white">School</h3>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all cursor-pointer group" data-testid="category-online">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-center font-semibold text-white">Online</h3>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all cursor-pointer group" data-testid="category-provision-store">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-center font-semibold text-white">Provision-Store</h3>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all cursor-pointer group" data-testid="category-masjid">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-center font-semibold text-white">Masjid</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
