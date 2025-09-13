import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CATEGORIES, LANGUAGES } from '@/types/agent';
import { X } from 'lucide-react';

interface FilterPanelProps {
  selectedCategory: string;
  selectedLanguage: string;
  onCategoryChange: (category: string) => void;
  onLanguageChange: (language: string) => void;
  onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedCategory,
  selectedLanguage,
  onCategoryChange,
  onLanguageChange,
  onClearFilters,
}) => {
  const hasActiveFilters = selectedCategory !== 'all' || selectedLanguage !== 'all';

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-40 bg-input border-border/40">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-40 bg-input border-border/40">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Languages</SelectItem>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};