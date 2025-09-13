import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgents } from '@/contexts/AgentContext';
import { AgentCard } from '@/components/AgentCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { Button } from '@/components/ui/button';
import { Settings, Waves } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { agents, loading } = useAgents();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = searchQuery === '' || 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.tagline.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
      const matchesLanguage = selectedLanguage === 'all' || agent.language === selectedLanguage;
      
      return matchesSearch && matchesCategory && matchesLanguage;
    });
  }, [agents, searchQuery, selectedCategory, selectedLanguage]);

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedLanguage('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-primary">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-hero bg-clip-text text-transparent">
                VoiceTube
              </h1>
            </div>
            
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
              className="hover:bg-secondary-hover transition-smooth"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search agents by name or tagline..."
              />
            </div>
            
            <FilterPanel
              selectedCategory={selectedCategory}
              selectedLanguage={selectedLanguage}
              onCategoryChange={setSelectedCategory}
              onLanguageChange={setSelectedLanguage}
              onClearFilters={handleClearFilters}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            {filteredAgents.length} {filteredAgents.length === 1 ? 'agent' : 'agents'} available
          </div>
        </div>

        {/* Agent Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Loading agents...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the available agents.</p>
          </div>
        ) : filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAgents.map((agent) => (
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