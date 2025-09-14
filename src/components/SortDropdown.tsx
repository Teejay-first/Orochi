import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Calendar } from 'lucide-react';

export type SortOption = 'average_rating_desc' | 'average_rating_asc' | 'rating_desc' | 'rating_asc' | 'name_asc' | 'name_desc' | 'newest' | 'oldest';
export type TimeFilter = 'all' | 'year' | 'quarter' | 'month' | 'week' | 'day';

interface SortDropdownProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  className?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  sortBy,
  onSortChange,
  timeFilter,
  onTimeFilterChange,
  className = ""
}) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="average_rating_desc">
            <div className="flex items-center gap-2">
              Highest ⭐⭐⭐⭐⭐
            </div>
          </SelectItem>
          <SelectItem value="average_rating_asc">
            <div className="flex items-center gap-2">
              Lowest ⭐
            </div>
          </SelectItem>
          <SelectItem value="rating_desc">Most Popular</SelectItem>
          <SelectItem value="rating_asc">Least Popular</SelectItem>
          <SelectItem value="name_asc">A-Z</SelectItem>
          <SelectItem value="name_desc">Z-A</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
        </SelectContent>
      </Select>

      {(sortBy === 'average_rating_desc' || sortBy === 'average_rating_asc') && (
        <Select value={timeFilter} onValueChange={onTimeFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Time period..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                All Time
              </div>
            </SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
            <SelectItem value="quarter">Last 3 Months</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="day">Last 24 Hours</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};