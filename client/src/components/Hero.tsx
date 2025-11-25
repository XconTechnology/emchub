import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, GraduationCap, Globe, Store, MapPin, Wrench, ChefHat, Palette, Utensils } from "lucide-react";
import type { Category } from "@shared/schema";

export default function Hero() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [, setLocation] = useLocation();

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }
    if (selectedCategory && selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }
    const queryString = params.toString();
    setLocation(`/explore${queryString ? `?${queryString}` : ""}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: Record<string, any> = {
      'School': GraduationCap,
      'Online': Globe,
      'Provision Store': Store,
      'Masjid': MapPin,
      'Services Store': Wrench,
      'Virtual Kitchen': ChefHat,
      'Arts Henna': Palette,
      'Restaurant': Utensils,
    };
    const IconComponent = iconMap[categoryName] || Store;
    return <IconComponent className="w-7 h-7 text-white" />;
  };
  return (
    <section className="pt-24 pb-16" style={{background: "linear-gradient(135deg, hsl(86 49% 53%) 0%, hsl(86 49% 45%) 50%, hsl(86 49% 38%) 100%)"}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <div className="mb-10 mt-8">
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base shadow-sm"
                    data-testid="input-search"
                  />
                </div>
                <div className="relative min-w-[200px]">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm" data-testid="select-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleSearch}
                  className="bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl" 
                  data-testid="button-search"
                >
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
            
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white/50 rounded-2xl p-6 shadow-xl animate-pulse">
                    <div className="w-14 h-14 rounded-2xl mx-auto mb-4 bg-gray-300"></div>
                    <div className="h-4 bg-gray-300 rounded mx-auto w-20"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-6">
                  {categories?.slice(0, 4).map((category) => (
                    <Link key={category.id} href={`/category/${category.id}`}>
                      <div 
                        className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-1" 
                        data-testid={`category-${category.name.toLowerCase().replace(/ /g, '-')}`}
                      >
                        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg" style={{background: "linear-gradient(135deg, hsl(86 49% 53%) 0%, hsl(86 49% 45%) 100%)"}}>
                          {getCategoryIcon(category.name)}
                        </div>
                        <h3 className="text-center font-semibold text-gray-800 text-sm">{category.name}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
                
                {/* View All Categories Button */}
                <div className="text-center">
                  <Link href="/categories">
                    <Button 
                      variant="outline" 
                      className="bg-white/20 backdrop-blur-sm text-white border-white/40 hover:bg-white/30 hover:border-white/60 px-8 py-3 rounded-xl font-semibold transition-all shadow-lg"
                      data-testid="button-view-all-categories"
                    >
                      View All Categories
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
