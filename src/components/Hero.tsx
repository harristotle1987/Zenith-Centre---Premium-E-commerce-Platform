interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Hero({ searchQuery, setSearchQuery }: HeroProps) {
  return (
    <div className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fdfbf7]/80 via-[#fdfbf7]/60 to-[#fdfbf7] z-10" />
        <img 
          src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=2000" 
          alt="Gourmet Restaurant" 
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif text-[#1a1a1a] tracking-tight mb-6 uppercase">
          Welcome to <span className="text-[#d35400]">Zenith</span>
          <br />
          <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-700 font-light tracking-widest mt-2 sm:mt-4 block">
            A Culinary Sanctuary
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-600 font-light tracking-wide max-w-3xl mx-auto px-4">
          Where Modern Gastronomy Meets Timeless Elegance.
        </p>
        
        <div className="mt-8 sm:mt-10 max-w-md mx-auto px-4">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full px-5 py-3.5 border border-black/10 rounded-full leading-5 bg-white/80 backdrop-blur-md text-[#1a1a1a] placeholder-gray-500 focus:outline-none focus:border-[#d35400] focus:ring-1 focus:ring-[#d35400] transition-all duration-300 shadow-sm text-sm"
              placeholder="Search Zenith Menu..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
