import React from 'react';
import { 
  Laptop, 
  Battery, 
  Newspaper, 
  Box, 
  Wine, 
  Wrench, 
  Zap, 
  Disc, 
  Cpu, 
  Recycle,
  CheckCircle2
} from 'lucide-react';
import { PRICING_CATALOG, MaterialPriceItem } from '../../data/pricing';

export interface PictorialCategorySelectorProps {
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ewaste: <Laptop className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
  batteries: <Battery className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
  paper: <Newspaper className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
  cardboard: <Box className="w-8 h-8 text-amber-700 dark:text-amber-500" />,
  plastics: <Recycle className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />,
  glass: <Wine className="w-8 h-8 text-teal-600 dark:text-teal-400" />,
  metals: <Wrench className="w-8 h-8 text-stone-600 dark:text-stone-300" />,
  appliances: <Cpu className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
  cables: <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />,
  tyres: <Disc className="w-8 h-8 text-slate-700 dark:text-slate-300" />,
};

export const PictorialCategorySelector: React.FC<PictorialCategorySelectorProps> = ({
  selectedCategoryId,
  onSelectCategory,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>Select Waste Stream</span>
            <span className="text-xs font-normal text-stone-500 dark:text-stone-400">(Touch / Click image)</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Current scrap rates updated daily from regional market benchmarks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {PRICING_CATALOG.map((cat: MaterialPriceItem) => {
          const isSelected = selectedCategoryId === cat.id;
          const icon = CATEGORY_ICONS[cat.wasteStream] || <Recycle className="w-8 h-8 text-emerald-600" />;
          const audioText = `${cat.name}. Rate is rupees ${cat.indicativePrice} per ${cat.unit}. ${cat.specialHandlingNotice || ''}`;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`relative flex flex-col items-center p-4 rounded-xl text-left border-2 transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500 ${
                isSelected
                  ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-md scale-[1.02]'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50/50 dark:hover:bg-stone-800/50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white dark:fill-emerald-500 dark:text-stone-900" />
                </div>
              )}

              <div className="my-2 p-3 rounded-full bg-stone-100 dark:bg-stone-800/80 group-hover:scale-110 transition-transform">
                {icon}
              </div>

              <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm text-center line-clamp-1">
                {cat.name}
              </span>

              <div className="mt-1.5 flex items-center justify-center gap-1 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                ₹{cat.indicativePrice}/{cat.unit}
              </div>

              {cat.specialHandlingNotice && (
                <span className="mt-2 text-[10px] text-center text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900 line-clamp-1">
                  {cat.specialHandlingNotice}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
