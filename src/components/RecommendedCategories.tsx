import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface RecommendedCategoriesProps {
  categories: string[];
  onCategoryClick: (category: string) => void;
  settings?: Record<string, string>;
}

export function RecommendedCategories({ categories, onCategoryClick, settings }: RecommendedCategoriesProps) {
  if (categories.length === 0) return null;

  const getImageUrl = (category: string, index: number) => {
    const key = `featuredImageUrl${index + 1}`;
    return settings?.[key] || `https://picsum.photos/seed/${category}/800/600`;
  };

  return (
    <section className="py-12 bg-white border-y border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-[#d35400]/10 rounded-lg text-[#d35400]">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-[#1a1a1a]">Inspired by Your Taste</h2>
            <p className="text-sm text-gray-500">Curated categories we think you'll love</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => onCategoryClick(category)}
              className="group relative h-48 rounded-2xl overflow-hidden bg-gray-100 border border-black/5 hover:border-[#d35400]/30 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
              <img 
                src={getImageUrl(category, index)}
                alt={category}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="text-white font-serif text-xl mb-1">{category}</h3>
                <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                  Explore Menu <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
