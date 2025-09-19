import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgents } from '@/contexts/AgentContext';
import { AgentCard } from '@/components/AgentCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { UserDisplay } from '@/components/UserDisplay';
import { SortDropdown, SortOption, TimeFilter } from '@/components/SortDropdown';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Settings, Waves, Plus, MessageSquare, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { agents, loading } = useAgents();
  const { isAdmin, userProfile, isAuthenticated, signInWithGoogle } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('average_rating_desc');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAccessDeniedDialog, setShowAccessDeniedDialog] = useState(false);

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

  const handleCreateAgentClick = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    if (isAdmin || userProfile?.is_super_admin) {
      navigate('/create-agent');
    } else {
      setShowAccessDeniedDialog(true);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      setShowAuthDialog(false);
      // After successful login, check again if user has access
      setTimeout(() => {
        if (isAdmin || userProfile?.is_super_admin) {
          navigate('/create-agent');
        } else {
          setShowAccessDeniedDialog(true);
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
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
              <span className="text-xl font-semibold text-foreground">
                Voice AI Agents Directory
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => window.open('https://discord.gg/6Se9nUBBgX', '_blank')}
                variant="default"
                className="hover:bg-primary-hover transition-smooth"
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit
              </Button>
              <Button
                onClick={() => handleCreateAgentClick()}
                variant="secondary"
                className="hover:bg-secondary-hover transition-smooth"
              >
                <Waves className="w-4 h-4 mr-2" />
                Create Agent
              </Button>
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border/20 bg-card/30">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-foreground">
            <span className="block">
              <span className="text-primary">Your</span>{' '}
              <span>Hub to Discover</span>
            </span>
            <span className="block">
              <span>the Best</span>{' '}
              <span className="text-primary">Voice AI Agents</span>
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Test live voice agents side-by-side. Rank them. Submit yours.
          </p>
        </div>
      </section>

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

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold text-foreground mb-4">Voice AI Directory</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                The trusted place to discover, test, and rank voice AI agents with curated listings, live demos, public scores, and easy submissions.
              </p>
              <div className="flex gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2"
                  onClick={() => window.open('https://discord.gg/6Se9nUBBgX', '_blank')}
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2"
                  onClick={() => window.open('mailto:team@voiceagents.directory', '_blank')}
                >
                  <Mail className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Voice AI Agents Categories */}
            <div>
              <h4 className="font-bold text-foreground mb-4">Voice AI Agents</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <button 
                    onClick={() => {setSelectedCategory('all'); window.scrollTo(0, 0);}}
                    className="hover:text-foreground transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {setSelectedCategory('education'); window.scrollTo(0, 0);}}
                    className="hover:text-foreground transition-colors"
                  >
                    Education
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {setSelectedCategory('sales'); window.scrollTo(0, 0);}}
                    className="hover:text-foreground transition-colors"
                  >
                    Sales
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {setSelectedCategory('shopping'); window.scrollTo(0, 0);}}
                    className="hover:text-foreground transition-colors"
                  >
                    Shopping
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {setSelectedCategory('support'); window.scrollTo(0, 0);}}
                    className="hover:text-foreground transition-colors"
                  >
                    Support
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {setSelectedCategory('fitness'); window.scrollTo(0, 0);}}
                    className="hover:text-foreground transition-colors"
                  >
                    Fitness
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {setSelectedCategory('health'); window.scrollTo(0, 0);}}
                    className="hover:text-foreground transition-colors"
                  >
                    Health
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <button className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button className="hover:text-foreground transition-colors">
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <div>© 2025 Voice AI Directory. All rights reserved.</div>
            <div className="mt-2 md:mt-0 text-center md:text-right">
              <div>The scoreboard for Voice AI.</div>
              <div>If it talks, we test it.</div>
            </div>
          </div>
        </div>
      </footer>

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in Required</DialogTitle>
            <DialogDescription>
              You need to sign in with Google to create voice agents.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button onClick={handleGoogleSignIn} className="w-full">
              <MessageSquare className="w-4 h-4 mr-2" />
              Sign in with Google
            </Button>
            <Button variant="outline" onClick={() => setShowAuthDialog(false)} className="w-full">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Access Denied Dialog */}
      <Dialog open={showAccessDeniedDialog} onOpenChange={setShowAccessDeniedDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Access Restricted</DialogTitle>
            <DialogDescription>
              Creating voice agents requires special permissions. Please contact support to request access.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button 
              onClick={() => window.open('mailto:team@voiceagents.directory', '_blank')} 
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowAccessDeniedDialog(false)} 
              className="w-full"
            >
              Return to Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};