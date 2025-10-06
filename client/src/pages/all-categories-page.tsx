import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, Globe, Store, MapPin, Wrench, ChefHat, Palette, Utensils } from "lucide-react";
import type { Category } from "@shared/schema";

export default function AllCategoriesPage() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

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
    return <IconComponent className="w-8 h-8 text-white" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header forceSolid={true} />
      <main className="pt-16">
        {/* Colorful Hero Section */}
        <div className="text-white relative overflow-hidden" style={{background: "linear-gradient(135deg, hsl(86 49% 53%) 0%, hsl(86 49% 45%) 50%, hsl(86 49% 38%) 100%)"}}>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Back Button */}
            <Link href="/">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20 mb-6"
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            {/* Page Title */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" data-testid="text-page-title">
                All Categories
              </h1>
              <p className="text-lg md:text-xl text-green-50 max-w-3xl mx-auto opacity-90">
                Browse all business categories to find exactly what you're looking for
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-card rounded-2xl p-8 shadow-xl animate-pulse">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-gray-300"></div>
                    <div className="h-4 bg-gray-300 rounded mx-auto w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mx-auto w-32"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories?.map((category) => (
                  <Link key={category.id} href={`/category/${category.id}`}>
                    <div 
                      className="bg-white dark:bg-card rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 border-2 border-transparent hover:border-primary/40"
                      data-testid={`category-card-${category.name.toLowerCase().replace(/ /g, '-')}`}
                    >
                      {/* Icon */}
                      <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg" style={{background: "linear-gradient(135deg, hsl(86 49% 53%) 0%, hsl(86 49% 45%) 100%)"}}>
                        {getCategoryIcon(category.name)}
                      </div>
                      
                      {/* Category Name */}
                      <h3 className="text-center font-bold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      
                      {/* Category Description */}
                      <p className="text-center text-muted-foreground text-sm line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
