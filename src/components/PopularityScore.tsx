import React from 'react';
import { TrendingUp } from 'lucide-react';

interface PopularityScoreProps {
  score: number;
  className?: string;
}

export const PopularityScore: React.FC<PopularityScoreProps> = ({ score, className = "" }) => {
  if (score <= 0) return null;

  const formatScore = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`.replace('.0', '');
    }
    return num.toString();
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <TrendingUp className="w-3 h-3 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">
        {formatScore(score)}
      </span>
    </div>
  );
};