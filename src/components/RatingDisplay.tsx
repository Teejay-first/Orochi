import React from 'react';
import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  className?: string;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({ rating, className = "" }) => {
  const formatRating = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`.replace('.0', '');
    }
    return num.toString();
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Star className="w-3 h-3 fill-primary text-primary" />
      <span className="text-sm font-medium text-foreground">
        {formatRating(rating)}
      </span>
    </div>
  );
};