export default function Stats() {
  const stats = [
    { value: "500+", label: "Listed Businesses", icon: "🏪", color: "from-blue-500 to-blue-600" },
    { value: "18", label: "Districts Covered", icon: "📍", color: "from-green-500 to-green-600" },
    { value: "50+", label: "Cuisines", icon: "🍽️", color: "from-orange-500 to-orange-600" },
    { value: "10K+", label: "Monthly Visitors", icon: "👥", color: "from-purple-500 to-purple-600" },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-card via-background to-card relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 background-pattern opacity-30"></div>
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 morphing-blob blur-3xl floating-element"></div>
      <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-primary/15 morphing-blob blur-2xl floating-element" style={{animationDelay: '3s'}}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 text-glow">
            Our Impact
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connecting communities across Hong Kong with authentic halal experiences
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="group card-3d fade-in" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="card-inner relative bg-white/80 dark:bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover-lift border-2 border-primary/20 hover:border-primary/40 transition-all duration-500 overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 rounded-3xl`}></div>
                
                {/* Icon */}
                <div className="relative text-center">
                  <div className="text-4xl mb-4 floating-element" style={{animationDelay: `${index * 0.5}s`}}>
                    {stat.icon}
                  </div>
                  
                  {/* Value */}
                  <div className="text-5xl md:text-6xl font-black text-primary mb-3 group-hover:scale-110 transition-transform duration-300" data-testid={`stat-value-${index}`}>
                    {stat.value}
                  </div>
                  
                  {/* Label */}
                  <div className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300" data-testid={`stat-label-${index}`}>
                    {stat.label}
                  </div>
                </div>
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
