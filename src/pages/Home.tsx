import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgents } from '@/contexts/AgentContext';
import { AgentCard } from '@/components/AgentCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { UserDisplay } from '@/components/UserDisplay';
import { SortDropdown, SortOption, TimeFilter } from '@/components/SortDropdown';
import { Button } from '@/components/ui/button';
import { Settings, Waves } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { agents, loading } = useAgents();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('average_rating_desc');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = searchQuery === '' || 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.tagline.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
      const matchesLanguage = selectedLanguage === 'all' || agent.language.includes(selectedLanguage);
      const matchesStatus = selectedStatus === 'all' || agent.status_type === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesLanguage && matchesStatus;
    });
  }, [agents, searchQuery, selectedCategory, selectedLanguage, selectedStatus]);

  const sortedAgents = useMemo(() => {
    const filtered = [...filteredAgents];
    
    switch (sortBy) {
      case 'average_rating_desc':
        return filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
      case 'average_rating_asc':
        return filtered.sort((a, b) => (a.average_rating || 0) - (b.average_rating || 0));
      case 'rating_desc':
        return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'rating_asc':
        return filtered.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      case 'name_asc':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return filtered.sort((a, b) => b.name.localeCompare(a.name));
      case 'newest':
        return filtered.sort((a, b) => b.createdAt - a.createdAt);
      case 'oldest':
        return filtered.sort((a, b) => a.createdAt - b.createdAt);
      default:
        return filtered;
    }
  }, [filteredAgents, sortBy]);

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedLanguage('all');
    setSelectedStatus('all');
    setSearchQuery('');
    setSortBy('average_rating_desc');
    setTimeFilter('all');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-primary">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold gradient-hero bg-clip-text text-transparent">
                Voice AI Agents Directory
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <UserDisplay />
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin')}
                  className="hover:bg-secondary-hover transition-smooth"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
            </div>
          </div>
          
          {/* Hero section */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="gradient-hero bg-clip-text text-transparent">Your Hub to Discover</span>
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-hero bg-clip-text text-transparent">the Best Voice AI Agents</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Test live voice agents side-by-side. Rank them. Submit yours.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search agents by name or tagline..."
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <SortDropdown
                sortBy={sortBy}
                onSortChange={setSortBy}
                timeFilter={timeFilter}
                onTimeFilterChange={setTimeFilter}
              />
              
              <FilterPanel
                selectedCategory={selectedCategory}
                selectedLanguage={selectedLanguage}
                selectedStatus={selectedStatus}
                onCategoryChange={setSelectedCategory}
                onLanguageChange={setSelectedLanguage}
                onStatusChange={setSelectedStatus}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {sortedAgents.length} {sortedAgents.length === 1 ? 'agent' : 'agents'} available
          </div>
        </div>

        {/* Agent Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Loading agents...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the available agents.</p>
          </div>
        ) : sortedAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button onClick={handleClearFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};