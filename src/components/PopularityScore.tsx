import React from 'react';
import { TrendingUp } from 'lucide-react';

interface PopularityScoreProps {
  score: number;
  price?: number;
  className?: string;
}

export const PopularityScore: React.FC<PopularityScoreProps> = ({ score, price, className = "" }) => {

  const formatScore = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`.replace('.0', '');
    }
    return num.toString();
  };

  const getPriceSymbol = (priceValue: number) => {
    const priceTypes = [
      { value: 1, symbol: '$' },
      { value: 2, symbol: '$$' },
      { value: 3, symbol: '$$$' },
      { value: 4, symbol: '$$$$' }
    ];
    return priceTypes.find(p => p.value === priceValue)?.symbol || '$';
  };

  return (
    <div className={`flex items-center justify-between px-2 py-1 border border-border/40 rounded text-xs ${className}`}>
      <div className="flex items-center gap-1">
        <TrendingUp className="w-3 h-3 text-muted-foreground" />
        <span className="text-muted-foreground">
          {formatScore(score)}
        </span>
      </div>
      {typeof price === 'number' && (
        <span className="text-muted-foreground">
          {getPriceSymbol(price)}
        </span>
      )}
    </div>
  );
};