import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0-5 scale, float (e.g., 4.23)
  count?: number; // number of ratings (optional)
  showCount?: boolean; // show compact count display
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  count, 
  showCount = false, 
  className = "" 
}) => {
  if (rating <= 0) return null;

  // Google-style star logic: half star if remainder ≥0.25 and <0.75
  const fullStars = Math.floor(rating);
  const remainder = rating % 1;
  const hasHalfStar = remainder >= 0.25 && remainder < 0.75;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const formatCount = (num: number) => {
    if (num >= 1000) {
      return `(${(num / 1000).toFixed(1)}k)`.replace('.0k', 'k');
    }
    return `(${num})`;
  };

  const ariaLabel = count 
    ? `Rated ${rating.toFixed(1)} out of 5 from ${count} ratings`
    : `Rated ${rating.toFixed(1)} out of 5`;

  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={ariaLabel} title={ariaLabel}>
      <div className="flex items-center">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, index) => (
          <Star key={`full-${index}`} className="w-3 h-3 fill-primary text-primary" />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-3 h-3 text-muted-foreground" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-3 h-3 fill-primary text-primary" />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <Star key={`empty-${index}`} className="w-3 h-3 text-muted-foreground" />
        ))}
      </div>
      
      <span className="text-xs font-medium text-foreground">
        {rating.toFixed(1)}
      </span>
      
      {showCount && count && count > 0 && (
        <span className="text-xs text-muted-foreground">
          {formatCount(count)}
        </span>
      )}
    </div>
  );
};