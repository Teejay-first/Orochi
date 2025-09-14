import React from 'react';

interface PopularityScoreProps {
  score: number;
  price?: number;
  className?: string;
}

export const PopularityScore: React.FC<PopularityScoreProps> = ({ score, price, className = "" }) => {
  if (score <= 0 && !price) return null;

  const formatScore = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`.replace('.0', '');
    }
    return num.toString();
  };

  const getPriceSymbols = (priceLevel: number) => {
    return '$'.repeat(priceLevel);
  };

  return (
    <div className={`flex items-center justify-between gap-2 px-2 py-1 border border-red-500 rounded text-xs ${className}`}>
      {score > 0 && (
        <span className="text-muted-foreground">
          {formatScore(score)}
        </span>
      )}
      {price && price > 0 && (
        <span className="text-muted-foreground">
          {getPriceSymbols(price)}
        </span>
      )}
    </div>
  );
};